import { GoogleGenAI } from '@google/genai';

// Initialize Google GenAI Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface WeatherData {
  temp: number;
  city: string;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
  precipitationChance: number;
  hourly: Array<{
    time: string;
    temp: number;
    precipProb: number;
    condition: string;
    conditionCode: number;
  }>;
  daily: Array<{
    day: string;
    date: string;
    tempMax: number;
    tempMin: number;
    precipProb: number;
    condition: string;
    conditionCode: number;
  }>;
}

export interface GeminiWeatherBrief {
  summaryEng: string;
  summaryUrdu: string;
  hazardLevel: 'low' | 'medium' | 'high' | 'critical';
  advisoryEng: string;
  advisoryUrdu: string;
  clothing: string;
  activities: string;
}

// Convert Open-Meteo WMO weather code to standard descriptive string
export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Sunny/Clear';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 56 && code <= 57) return 'Freezing Drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 66 && code <= 67) return 'Freezing Rain';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 85 && code <= 86) return 'Snow Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Overcast';
}

export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '☁️';
}

// Fetch live weather data based on latitude and longitude
export async function fetchLiveWeather(lat: number, lng: number, cityName?: string): Promise<WeatherData> {
  let city = cityName || 'Islamabad';
  
  if (!cityName) {
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const geoData = await geoRes.json();
      city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || 'Islamabad';
    } catch {
      city = 'Islamabad';
    }
  }

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,precipitation_probability,weathercode,relativehumidity_2m,surface_pressure&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
  );
  
  if (!weatherRes.ok) {
    throw new Error('Failed to fetch weather from API');
  }

  const data = await weatherRes.json();
  const current = data.current_weather;
  const hourly = data.hourly;
  const daily = data.daily;

  // Format hourly forecast (next 24 hours)
  const currentHourIdx = new Date().getHours();
  const formattedHourly = [];
  for (let i = 0; i < 24; i++) {
    const idx = currentHourIdx + i;
    const timeStr = new Date(hourly.time[idx] || Date.now() + i * 3600 * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
    formattedHourly.push({
      time: timeStr,
      temp: Math.round(hourly.temperature_2m[idx] ?? current.temperature),
      precipProb: hourly.precipitation_probability[idx] ?? 0,
      condition: getWeatherDescription(hourly.weathercode[idx] ?? 0),
      conditionCode: hourly.weathercode[idx] ?? 0,
    });
  }

  // Format daily forecast (next 7 days)
  const formattedDaily = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(daily.time[i]);
    const dayName = i === 0 ? 'Today' : daysOfWeek[dateObj.getDay()];
    formattedDaily.push({
      day: dayName,
      date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tempMax: Math.round(daily.temperature_2m_max[i] ?? current.temperature),
      tempMin: Math.round(daily.temperature_2m_min[i] ?? current.temperature),
      precipProb: daily.precipitation_probability_max[i] ?? 0,
      condition: getWeatherDescription(daily.weathercode[i] ?? 0),
      conditionCode: daily.weathercode[i] ?? 0,
    });
  }

  return {
    temp: Math.round(current.temperature),
    city,
    condition: getWeatherDescription(current.weathercode),
    conditionCode: current.weathercode,
    humidity: hourly.relativehumidity_2m[currentHourIdx] ?? 65,
    windSpeed: Math.round(current.windspeed),
    pressure: Math.round(hourly.surface_pressure[currentHourIdx] ?? 1013),
    uvIndex: current.temperature > 38 ? 9 : current.temperature > 30 ? 6 : 3, // Open-Meteo free UV requires separate call, estimate based on temp
    precipitationChance: daily.precipitation_probability_max[0] ?? 0,
    hourly: formattedHourly,
    daily: formattedDaily,
  };
}

// Generate an intelligent, localized weather safety/advisory brief using Google Gemini
export async function generateGeminiWeatherBrief(weather: WeatherData): Promise<GeminiWeatherBrief> {
  const prompt = `You are Google Gemini Weather Intelligence Specialist, integrated into CIRO (Crisis Intelligence & Response Orchestrator).
Analyze this live weather data for the city of **${weather.city}**, Pakistan:

=== CURRENT CONDITIONS ===
* Temperature: ${weather.temp}°C
* Weather Condition: ${weather.condition}
* Humidity: ${weather.humidity}%
* Wind Speed: ${weather.windSpeed} km/h
* Pressure: ${weather.pressure} hPa
* UV Index Level: ${weather.uvIndex}
* Precipitation Chance today: ${weather.precipitationChance}%

=== 7-DAY FORECAST SUMMARY ===
${weather.daily.map(d => `* ${d.day} (${d.date}): Max ${d.tempMax}°C, Min ${d.tempMin}°C | ${d.condition} | Rain Chance: ${d.precipProb}%`).join('\n')}

Based on this, generate a highly structured Weather and Crisis Intelligence Advisory.
Evaluate standard Pakistani environmental risks (e.g. monsoons leading to urban flooding in Islamabad/Karachi, intense summer heatwaves up to 50°C+, heavy winter dense fog on motorways, high-humidity dehydration).

Return ONLY a valid JSON object matching this schema (do NOT include markdown code blocks or any text other than the JSON itself):
{
  "summaryEng": "A crisp, engaging 2-sentence weather briefing in English detailing what the weather feels like and key changes today.",
  "summaryUrdu": "A poetic, clear, and native 2-sentence weather briefing in Urdu.",
  "hazardLevel": "low|medium|high|critical",
  "advisoryEng": "A clear, actionable crisis safety advisory in English. Highlight any flood/heatwave/fog risks and direct advice.",
  "advisoryUrdu": "A clear, actionable crisis safety advisory in Urdu language with professional rescue/safety tone.",
  "clothing": "Practical clothing advice tailored to these conditions (e.g. breathable lawn/cotton for heat, raincoats/waterproof shoes for monsoon).",
  "activities": "Direct suggestions for public travel or outdoor activities (e.g., avoid underpasses in G-10/Clifton, stay hydrated indoors, check motorways for fog)."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text ?? '{}') as GeminiWeatherBrief;
    
    // Validate output structure
    if (parsed.summaryEng && parsed.summaryUrdu && parsed.advisoryEng) {
      return parsed;
    }
    throw new Error('Invalid JSON structure returned by Gemini');
  } catch (err) {
    console.error('Gemini weather generation failed, using fallback:', err);
    
    // Intelligent Fallback depending on temperature / rainfall condition
    const isHot = weather.temp > 35;
    const isWet = weather.condition.toLowerCase().includes('rain') || weather.condition.toLowerCase().includes('thunderstorm') || weather.precipitationChance > 50;
    
    if (isWet) {
      return {
        summaryEng: `Wet weather is currently active in ${weather.city} with a temperature of ${weather.temp}°C. Rain and thunderstorm risks are elevated today.`,
        summaryUrdu: `${weather.city} میں اس وقت بارش کا موسم فعال ہے اور درجہ حرارت ${weather.temp} ڈگری ہے۔ آج بارش اور گرج چمک کے امکانات زیادہ ہیں۔`,
        hazardLevel: 'medium',
        advisoryEng: 'Heavy rain might cause water logging in low-lying roads. Stay indoors during lightning and avoid touching electric poles.',
        advisoryUrdu: 'تیز بارش کی وجہ سے نشیبی سڑکوں پر پانی جمع ہو سکتا ہے۔ آسمانی بجلی کے دوران اندر رہیں اور بجلی کے کھمبوں کو چھونے سے گریز کریں۔',
        clothing: 'Waterproof jacket, umbrella, and non-slip rubber shoes.',
        activities: 'Avoid underpasses and drainage channels. Drive slow with hazard lights on.',
      };
    } else if (isHot) {
      return {
        summaryEng: `Extremely hot conditions are prevailing in ${weather.city} with temperatures reaching ${weather.temp}°C under clear skies.`,
        summaryUrdu: `${weather.city} میں انتہائی گرم حالات غالب ہیں، اور صاف آسمان کے تحت درجہ حرارت ${weather.temp} ڈگری تک پہنچ رہا ہے۔`,
        hazardLevel: 'high',
        advisoryEng: 'Extreme UV exposure and dehydration risks. Avoid direct sunlight between 11 AM and 4 PM. Keep children and elderly hydrated.',
        advisoryUrdu: 'انتہائی شدید گرمی اور پانی کی کمی کا خطرہ ہے۔ صبح 11 بجے سے دوپہر 4 بجے کے درمیان براہ راست سورج کی روشنی سے بچیں۔ بچوں اور بوڑھوں کو ہائیڈریٹ رکھیں۔',
        clothing: 'Lightweight, loose-fitting, light-colored cotton clothing and a wide-brim hat.',
        activities: 'Stay indoors in air-conditioned areas. Postpone strenuous outdoor tasks to evening hours.',
      };
    } else {
      return {
        summaryEng: `Pleasant weather conditions today in ${weather.city} with a comfortable temperature of ${weather.temp}°C and light winds.`,
        summaryUrdu: `${weather.city} میں آج موسم خوشگوار ہے، درجہ حرارت ${weather.temp} ڈگری سینٹی گریڈ ہے اور ہلکی ہوائیں چل رہی ہیں۔`,
        hazardLevel: 'low',
        advisoryEng: 'No major crisis threats detected. Standard seasonal conditions apply. Enjoy outdoor activities safely.',
        advisoryUrdu: 'بحران کا کوئی بڑا خطرہ نہیں پایا گیا۔ موسم معمول کے مطابق ہے۔ بیرونی سرگرمیوں سے لطف اندوز ہوں۔',
        clothing: 'Standard casual wear. A light jacket if outside during early morning or late evening.',
        activities: 'Perfect weather for outdoor activities, community travel, and routines.',
      };
    }
  }
}
