import React, { useEffect, useRef, useState } from 'react';
import type { CrisisSituationReport } from '../../types';
import { CRISIS_COLORS, CRISIS_LABELS } from '../../types';

interface Props {
  report?: CrisisSituationReport;
  height?: number | string;
}

type MapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
type MapEngine = 'sdk' | 'leaflet';

export function CrisisMap({ report, height = 400 }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Google Maps SDK references
  const sdkMapRef = useRef<any>(null);
  const sdkMarkerRef = useRef<any>(null);
  const sdkCircleRef = useRef<any>(null);
  const sdkInfoWindowRef = useRef<any>(null);

  // Leaflet references
  const leafletMapRef = useRef<any>(null);
  const leafletTileLayerRef = useRef<any>(null);
  const leafletMarkerRef = useRef<any>(null);
  const leafletCircleRef = useRef<any>(null);

  // States
  const [mapType, setMapType] = useState<MapType>('roadmap');
  const [mapEngine, setMapEngine] = useState<MapEngine>('leaflet');
  const [sdkLoading, setSdkLoading] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<boolean>(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 1. Detect if Google API Key is available and configure default engine
  useEffect(() => {
    if (apiKey && apiKey !== 'your_google_maps_api_key_here' && apiKey.startsWith('AIzaSy')) {
      setMapEngine('sdk');
    } else {
      setMapEngine('leaflet');
    }
  }, [apiKey]);

  // 2. Load Google Maps SDK Script
  const loadGoogleMapsScript = (callback: () => void) => {
    if ((window as any).google && (window as any).google.maps) {
      callback();
      return;
    }
    const scriptId = 'google-maps-sdk-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      setSdkLoading(true);
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setSdkLoading(false);
        callback();
      };
      script.onerror = () => {
        setSdkLoading(false);
        setSdkError(true);
        setMapEngine('leaflet'); // Fallback immediately
        console.error('Google Maps SDK failed to load. Falling back to Google Tile Server layers.');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => callback());
    }
  };

  // 3. Initialize and handle map instance creation
  useEffect(() => {
    // Cleanup previous maps
    cleanupMaps();

    if (mapEngine === 'sdk') {
      loadGoogleMapsScript(() => {
        initSDKMap();
      });
    } else {
      initLeafletMap();
    }

    return () => cleanupMaps();
  }, [mapEngine, mapType]); // Re-init on engine or type changes

  // 4. Update markers/circles when report changes
  useEffect(() => {
    if (mapEngine === 'sdk' && sdkMapRef.current && report) {
      updateSDKMarkers(report);
    } else if (mapEngine === 'leaflet' && leafletMapRef.current && report) {
      updateLeafletMarkers(report);
    }
  }, [report, mapEngine]);

  const cleanupMaps = () => {
    // Clean Leaflet
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    leafletTileLayerRef.current = null;
    leafletMarkerRef.current = null;
    leafletCircleRef.current = null;

    // Clean Google Maps SDK
    if (sdkMarkerRef.current) sdkMarkerRef.current.setMap(null);
    if (sdkCircleRef.current) sdkCircleRef.current.setMap(null);
    sdkMarkerRef.current = null;
    sdkCircleRef.current = null;
    sdkMapRef.current = null;
  };

  // ── GOOGLE MAPS SDK SETUP ──
  const initSDKMap = () => {
    if (!mapContainerRef.current || !(window as any).google) return;

    const defaultLat = report?.lat ?? 33.6844;
    const defaultLng = report?.lng ?? 73.0479;

    const gTypeMap: Record<MapType, string> = {
      roadmap: 'roadmap',
      satellite: 'satellite',
      hybrid: 'hybrid',
      terrain: 'terrain',
    };

    const mapOptions = {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: 13,
      mapTypeId: gTypeMap[mapType],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          color: '#8ec3b9',
        },
      ],
    };

    sdkMapRef.current = new (window as any).google.maps.Map(mapContainerRef.current, mapOptions);

    if (report) {
      updateSDKMarkers(report);
    }
  };

  const updateSDKMarkers = (rep: CrisisSituationReport) => {
    const google = (window as any).google;
    if (!sdkMapRef.current || !google) return;

    // Remove old overlays
    if (sdkMarkerRef.current) sdkMarkerRef.current.setMap(null);
    if (sdkCircleRef.current) sdkCircleRef.current.setMap(null);

    const center = { lat: rep.lat, lng: rep.lng };
    const color = CRISIS_COLORS[rep.crisis_type] ?? '#ef4444';
    const radiusMap: Record<string, number> = { critical: 800, high: 600, medium: 400, low: 250 };
    const radius = radiusMap[rep.severity] ?? 500;

    // Add hazard circle
    sdkCircleRef.current = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.15,
      map: sdkMapRef.current,
      center: center,
      radius: radius,
    });

    // Add crisis marker with pulsing emoji look
    sdkMarkerRef.current = new google.maps.Marker({
      position: center,
      map: sdkMapRef.current,
      title: CRISIS_LABELS[rep.crisis_type],
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 0.9,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 10,
      },
    });

    // Configure info window
    const contentString = `
      <div style="font-family:system-ui;min-width:180px;color:#111;padding:8px">
        <b style="color:${color};font-size:14px;display:block;margin-bottom:4px">${CRISIS_LABELS[rep.crisis_type]}</b>
        <span style="font-size:12px;display:block;margin-bottom:2px"><b>Severity:</b> ${rep.severity.toUpperCase()}</span>
        <span style="font-size:12px;display:block;margin-bottom:2px"><b>Confidence:</b> ${rep.confidence}%</span>
        <span style="font-size:11px;color:#555;display:block">${rep.affected_zones.join(', ')}</span>
      </div>
    `;

    sdkInfoWindowRef.current = new google.maps.InfoWindow({
      content: contentString,
    });

    sdkMarkerRef.current.addListener('click', () => {
      sdkInfoWindowRef.current.open(sdkMapRef.current, sdkMarkerRef.current);
    });

    // Auto open info window
    sdkInfoWindowRef.current.open(sdkMapRef.current, sdkMarkerRef.current);

    // Pan map to center
    sdkMapRef.current.panTo(center);
    sdkMapRef.current.setZoom(14);
  };

  // ── LEAFLET GOOGLE TILES SETUP ──
  const initLeafletMap = async () => {
    const L = (await import('leaflet')).default;
    if (!mapContainerRef.current) return;

    const defaultLat = report?.lat ?? 33.6844;
    const defaultLng = report?.lng ?? 73.0479;

    leafletMapRef.current = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Select Google Maps Tiles
    let tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // roadmap
    if (mapType === 'satellite') tileUrl = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
    if (mapType === 'hybrid') tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    if (mapType === 'terrain') tileUrl = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

    leafletTileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 20,
    }).addTo(leafletMapRef.current);

    if (report) {
      updateLeafletMarkers(report);
    }
  };

  const updateLeafletMarkers = async (rep: CrisisSituationReport) => {
    const L = (await import('leaflet')).default;
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove old overlays
    if (leafletMarkerRef.current) { leafletMarkerRef.current.remove(); leafletMarkerRef.current = null; }
    if (leafletCircleRef.current) { leafletCircleRef.current.remove(); leafletCircleRef.current = null; }

    const center: [number, number] = [rep.lat, rep.lng];
    const color = CRISIS_COLORS[rep.crisis_type] ?? '#ef4444';
    const radiusMap: Record<string, number> = { critical: 800, high: 600, medium: 400, low: 250 };
    const radius = radiusMap[rep.severity] ?? 500;

    // Pulse Circle
    leafletCircleRef.current = L.circle(center, {
      color, fillColor: color, fillOpacity: 0.15, radius, weight: 2,
    }).addTo(map);

    // Dynamic marker pin
    const icon = L.divIcon({
      html: `<div style="
        background: ${color};
        width: 20px; height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 0 ${color}80;
        animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <style>
        @keyframes ping { 75%,100%{ transform: scale(2); opacity:0; } }
      </style>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    leafletMarkerRef.current = L.marker(center, { icon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family:system-ui;min-width:180px">
          <b style="color:${color};font-size:14px">${CRISIS_LABELS[rep.crisis_type]}</b><br/>
          <span style="font-size:12px;color:#666">Severity: ${rep.severity.toUpperCase()}</span><br/>
          <span style="font-size:12px;color:#666">Confidence: ${rep.confidence}%</span><br/>
          <span style="font-size:12px">${rep.affected_zones.join(', ')}</span>
        </div>
      `, { maxWidth: 250 })
      .openPopup();

    map.flyTo(center, 14, { animate: true, duration: 1.5 });
  };

  const CRISIS_ICONS_EMOJI: Record<string, string> = {
    urban_flooding: '🌊', heatwave: '🔥', road_blockage: '🚧',
    accident: '🚨', infrastructure_failure: '⚡', unknown: '❓',
  };

  const mapTypes = [
    { id: 'roadmap', label: 'Map', emoji: '🗺️' },
    { id: 'satellite', label: 'Satellite', emoji: '🛰️' },
    { id: 'hybrid', label: 'Hybrid', emoji: '🔀' },
    { id: 'terrain', label: 'Terrain', emoji: '⛰️' },
  ];

  return (
    <div style={{ position: 'relative', height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Map Target */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Dynamic Layer Switcher Control */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000,
        display: 'flex', background: 'rgba(5, 14, 8, 0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid var(--border-gold)', borderRadius: 8, padding: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      }}>
        {mapTypes.map(type => {
          const isActive = mapType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setMapType(type.id as MapType)}
              style={{
                background: isActive ? 'var(--pak-gold)' : 'transparent',
                color: isActive ? '#000' : 'var(--text-primary)',
                border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 11,
                fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                transition: 'all 0.2s', fontFamily: 'var(--font-body)',
              }}
            >
              <span>{type.emoji}</span>
              <span className="hide-mobile">{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Engine Toggle (If SDK script is loadable) */}
      {apiKey && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 1000,
          background: 'rgba(5, 14, 8, 0.85)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-gold)', borderRadius: 8, padding: '4px 8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 10, color: 'var(--pak-gold)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>ENGINE:</span>
          <button
            onClick={() => setMapEngine(mapEngine === 'sdk' ? 'leaflet' : 'sdk')}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--text-secondary)', padding: '2px 8px', fontSize: 9, fontWeight: 900, cursor: 'pointer'
            }}
          >
            {mapEngine === 'sdk' ? '⚡ GOOGLE SDK' : '🗺️ GOOGLE TILES'}
          </button>
        </div>
      )}

      {/* Overlay report details */}
      {report && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 1000,
          background: 'rgba(5, 14, 8, 0.9)', backdropFilter: 'blur(8px)',
          border: `1px solid ${CRISIS_COLORS[report.crisis_type]}40`,
          borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: CRISIS_COLORS[report.crisis_type], display: 'flex', alignItems: 'center', gap: 6 }}>
            {CRISIS_ICONS_EMOJI[report.crisis_type]} {CRISIS_LABELS[report.crisis_type]}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {report.affected_zones.join(' • ')}
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {sdkLoading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5, 14, 8, 0.7)', backdropFilter: 'blur(4px)', zIndex: 500,
        }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
            <div style={{ color: 'var(--pak-gold)', fontSize: 12, fontWeight: 800 }}>Loading Google Maps...</div>
          </div>
        </div>
      )}

      {/* No report selected state */}
      {!report && !sdkLoading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(5, 14, 8, 0.65)', backdropFilter: 'blur(4px)', zIndex: 400,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🗺️</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700 }}>Run analysis to map active crisis zones</div>
          </div>
        </div>
      )}
    </div>
  );
}
