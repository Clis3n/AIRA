import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, TextInput, FlatList, ActivityIndicator, Keyboard, Animated, Easing, Platform, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { Search, LocateFixed, Plane, X, ArrowRight, Save, MapPin, RefreshCcw, Layers, Send, Navigation, CornerUpLeft, CornerUpRight, ArrowUp, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { push, ref, set } from "firebase/database";
import { auth, db } from '@/services/firebaseConfig';
import CustomAlert from '@/components/ui/CustomAlert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const GOOGLE_API_KEY = "MAPS-KEY"; 
const AVIATION_API_KEY = "AVIATION-KEY"; 

const AIRPORT_COORDS: Record<string, { lat: number, lng: number }> = {
    'CGK': { lat: -6.1256, lng: 106.6558 },
    'HLP': { lat: -6.2666, lng: 106.8900 },
    'DPS': { lat: -8.7482, lng: 115.1672 },
    'SUB': { lat: -7.3798, lng: 112.7869 },
    'KNO': { lat: 3.6422, lng: 98.8852 },
    'UPG': { lat: -5.0616, lng: 119.5540 },
    'YIA': { lat: -7.8924, lng: 110.0574 },
    'JOG': { lat: -7.7881, lng: 110.4318 },
    'BDO': { lat: -6.9006, lng: 107.5759 },
    'SRG': { lat: -6.9727, lng: 110.3750 },
    'SOC': { lat: -7.5161, lng: 110.7574 },
    'BTH': { lat: 1.1210, lng: 104.1180 },
    'PKU': { lat: 0.4608, lng: 101.4445 },
    'PLM': { lat: -2.8982, lng: 104.7009 },
    'BPN': { lat: -1.2635, lng: 116.9001 },
    'PDG': { lat: -0.7869, lng: 100.2800 },
    'AMI': { lat: -8.5607, lng: 116.0948 },
    'MDC': { lat: 1.5495, lng: 124.9259 },
    'TIM': { lat: -4.5283, lng: 136.8874 },
    'DJJ': { lat: -2.5769, lng: 140.5160 },
    'BMU': { lat: -8.5396, lng: 118.6867 },
    'KDI': { lat: -4.0816, lng: 122.4183 },
    'PNK': { lat: -0.1507, lng: 109.4036 },
    'TRK': { lat: 3.3267, lng: 117.5696 },
    'TJQ': { lat: -2.7457, lng: 107.7549 },
    'TNJ': { lat: 0.9224, lng: 104.5310 },
    'KTG': { lat: -1.8166, lng: 109.9623 },
    'SIN': { lat: 1.3644, lng: 103.9915 },
    'KUL': { lat: 2.7456, lng: 101.7072 },
    'BKK': { lat: 13.6900, lng: 100.7501 },
    'HKG': { lat: 22.3080, lng: 113.9185 },
    'ICN': { lat: 37.4602, lng: 126.4407 },
    'NRT': { lat: 35.7720, lng: 140.3929 },
    'HND': { lat: 35.5494, lng: 139.7798 },
    'DXB': { lat: 25.2532, lng: 55.3657 },
    'JED': { lat: 21.6796, lng: 39.1565 },
};

const getIataCode = (name: string, city: string) => {
    const text = (name + " " + city).toUpperCase();

    if (text.includes("SOEKARNO") || text.includes("CENGKARENG") || text.includes("JAKARTA")) return "CGK";
    if (text.includes("HALIM")) return "HLP";
    if (text.includes("NGURAH") || text.includes("BALI") || text.includes("DENPASAR")) return "DPS";
    if (text.includes("JUANDA") || text.includes("SURABAYA")) return "SUB";
    if (text.includes("KUALANAMU") || text.includes("MEDAN")) return "KNO";
    if (text.includes("HASANUDDIN") || text.includes("MAKASSAR")) return "UPG";
    if (text.includes("YOGYAKARTA") || text.includes("YIA") || text.includes("KULON PROGO")) return "YIA";
    if (text.includes("ADISUTJIPTO") || text.includes("ADI SUTJIPTO")) return "JOG";
    if (text.includes("BANDUNG") || text.includes("HUSEIN")) return "BDO";
    if (text.includes("AHMAD YANI") || text.includes("SEMARANG")) return "SRG";
    if (text.includes("ADI SUMARMO") || text.includes("ADI SOEMARMO") || text.includes("SOLO")) return "SOC";
    if (text.includes("HANG NADIM") || text.includes("BATAM")) return "BTH";
    if (text.includes("SULTAN SYARIF") || text.includes("PEKANBARU")) return "PKU";
    if (text.includes("MAHMUD BADARUDDIN") || text.includes("PALEMBANG")) return "PLM";
    if (text.includes("SULTAN AJI") || text.includes("BALIKPAPAN")) return "BPN";
    if (text.includes("MINANGKABAU") || text.includes("PADANG")) return "PDG";
    if (text.includes("ZAINUDDIN") || text.includes("LOMBOK")) return "AMI";
    if (text.includes("SAM RATULANGI") || text.includes("MANADO")) return "MDC";
    if (text.includes("TIMIKA") || text.includes("KILANGIN")) return "TIM";
    if (text.includes("SENTANI") || text.includes("JAYAPURA")) return "DJJ";
    if (text.includes("M. SALAHUDDIN") || text.includes("MUHAMMAD SALAHUDDIN") || text.includes("BIMA")) return "BMU";
    if (text.includes("HALU OLEO") || text.includes("KENDARI")) return "KDI";
    if (text.includes("SUPADIO") || text.includes("PONTIANAK")) return "PNK";
    if (text.includes("JUWATA") || text.includes("TARAKAN")) return "TRK";
    if (text.includes("HANANDJOEDDIN") || text.includes("TANJUNG PANDAN")) return "TJQ";
    if (text.includes("RAJA HAJI FISABILILLAH") || text.includes("TANJUNG PINANG")) return "TNJ";
    if (text.includes("RAHADI USMAN") || text.includes("KETAPANG")) return "KTG";

    if (text.includes("CHANGI") || text.includes("SINGAPORE")) return "SIN";
    if (text.includes("KUALA LUMPUR") || text.includes("KLIA")) return "KUL";
    if (text.includes("SUVARNABHUMI") || text.includes("BANGKOK")) return "BKK";
    if (text.includes("HONG KONG")) return "HKG";
    if (text.includes("INCHEON") || text.includes("SEOUL")) return "ICN";
    if (text.includes("NARITA")) return "NRT";
    if (text.includes("HANEDA")) return "HND";
    if (text.includes("DUBAI")) return "DXB";
    if (text.includes("JEDDAH") || text.includes("KING ABDULAZIZ")) return "JED";

    return null;
};

const decodePolyline = (t: string) => {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;
    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = t.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = t.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
    }
    return points;
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
};

const MAP_STYLE_LIGHT = [
    { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] }
];

const MAP_STYLE_DARK = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const locationRef = useRef<Location.LocationObject | null>(null);
  const [currentRegion, setCurrentRegion] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const refreshAnimValue = useRef(new Animated.Value(1)).current; 

  const [airports, setAirports] = useState<any[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<any>(null);
  const [flightSchedule, setFlightSchedule] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [isDriveMode, setIsDriveMode] = useState(false);
  const [isRouteLoading, setIsRouteLoading] = useState(false); 
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [targetAirportId, setTargetAirportId] = useState<string | null>(null);
  const [flightPaths, setFlightPaths] = useState<any[]>([]);
  
  const [navInfo, setNavInfo] = useState<{
      distanceRemaining: string; 
      timeRemaining: string; 
      nextInstruction: string; 
      nextManeuver: string; 
      distanceToTurn: string; 
  } | null>(null);
  
  const routeSteps = useRef<any[]>([]); 
  const currentStepIndex = useRef<number>(0);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const headingSubscription = useRef<Location.LocationSubscription | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string; onConfirm?: () => void; confirmText?: string; cancelText?: string;  
  }>({ visible: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    const timer = setTimeout(() => {
        Animated.timing(refreshAnimValue, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }).start();
    }, 6000); 
    return () => clearTimeout(timer);
  }, []);

  const refreshTextWidth = refreshAnimValue.interpolate({ inputRange: [0, 1], outputRange: [0, 110] });
  const refreshTextOpacity = refreshAnimValue;

  useEffect(() => {
    if (tracksViewChanges) {
      const timer = setTimeout(() => setTracksViewChanges(false), 500);
      return () => clearTimeout(timer);
    }
  }, [tracksViewChanges]);

  const triggerMarkerUpdate = () => setTracksViewChanges(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAlertConfig({ visible: true, type: 'error', title: 'Izin Ditolak', message: 'Aplikasi membutuhkan lokasi Anda.' });
        return;
      }
      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
      locationRef.current = loc;
      fetchNearbyAirports(loc.coords.latitude, loc.coords.longitude);
    })();
    return () => {
      if (locationSubscription.current) locationSubscription.current.remove();
      if (headingSubscription.current) headingSubscription.current.remove();
    };
  }, []);

  useEffect(() => {
    if (params.focusMap === 'true' && params.lat && params.lng) {
      const target = {
        id: params.id as string,
        lat: parseFloat(params.lat as string),
        lng: parseFloat(params.lng as string),
        name: params.name as string,
        city: params.city as string || 'Alamat tidak tersedia'
      };
      handleExternalTrigger(target, false);
      router.setParams({ focusMap: null });
    }

    if (params.startNav === 'true') {
        const targetId = params.id as string;
        let targetLat = parseFloat(params.lat as string);
        let targetLng = parseFloat(params.lng as string);

        if ((isNaN(targetLat) || isNaN(targetLng)) && AIRPORT_COORDS[targetId]) {
            targetLat = AIRPORT_COORDS[targetId].lat;
            targetLng = AIRPORT_COORDS[targetId].lng;
        }

        if (!isNaN(targetLat) && !isNaN(targetLng)) {
            const target = {
                id: targetId || `NAV-${Date.now()}`,
                lat: targetLat,
                lng: targetLng,
                name: params.name as string || targetId,
                city: params.city as string || 'Tujuan Navigasi'
            };
            handleExternalTrigger(target, true);
        } else {
            setAlertConfig({ visible: true, type: 'error', title: 'Lokasi Tidak Ditemukan', message: 'Koordinat tujuan tidak valid.' });
        }
        router.setParams({ startNav: null });
    }
  }, [params]);

  const handleExternalTrigger = (target: any, autoDrive: boolean) => {
    setAirports(prev => {
        const exists = prev.find(p => p.id === target.id);
        if(!exists) { triggerMarkerUpdate(); return [...prev, target]; }
        return prev;
    });

    if (autoDrive) {
        setAlertConfig({ visible: true, type: 'info', title: 'Siapkan Navigasi', message: `Menghitung rute terbaik ke ${target.name}...`, onConfirm: () => startDriveMode(target) });
        setTimeout(() => startDriveMode(target), 500);
    } else {
        setSelectedAirport(target);
        fetchFlightsForAirport(target);
        setTimeout(() => {
            mapRef.current?.animateToRegion({
                latitude: target.lat, longitude: target.lng, latitudeDelta: 0.01, longitudeDelta: 0.01
            }, 800);
        }, 500);
    }
  };

  const fetchNearbyAirports = async (lat: number, lng: number) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50000&type=airport&keyword=airport&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.results) {
            const fetchedAirports = json.results.map((item: any) => ({
                id: item.place_id, code: 'APT', name: item.name,
                lat: item.geometry.location.lat, lng: item.geometry.location.lng,
                city: item.vicinity || item.name
            }));
            setAirports(fetchedAirports);
            triggerMarkerUpdate();
        }
    } catch (error) { console.error(error); }
  };

  const handleRefreshArea = () => {
    if (currentRegion) {
        fetchNearbyAirports(currentRegion.latitude, currentRegion.longitude);
        setAlertConfig({ visible: true, type: 'success', title: 'Diperbarui', message: 'Mencari bandara di area tampilan...' });
    }
  };

  const fetchFlightsForAirport = async (airport: any) => {
    setFlightSchedule([]); setFlightPaths([]);
    const iata = getIataCode(airport.name, airport.city);
    if (!iata) return;
    try {
        const url = `http://api.aviationstack.com/v1/flights?access_key=${AVIATION_API_KEY}&dep_iata=${iata}&limit=10`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.data) {
            const realSchedule = json.data.map((flight: any, index: number) => {
                const destIata = flight.arrival?.iata;
                const destCoords = AIRPORT_COORDS[destIata];
                return {
                    id: flight.flight?.iata || `FL-${index}`,
                    airline: flight.airline?.name || 'Unknown',
                    flightNumber: flight.flight?.iata || '??',
                    status: flight.flight_status,
                    time: flight.departure?.scheduled ? new Date(flight.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
                    destination: {
                        city: flight.arrival?.airport || destIata || 'Unknown',
                        code: destIata,
                        lat: destCoords ? destCoords.lat : (airport.lat + 0.5),
                        lng: destCoords ? destCoords.lng : (airport.lng + 0.5)
                    },
                    origin: airport
                };
            });
            setFlightSchedule(realSchedule);
            const paths = realSchedule.filter((sch: any) => AIRPORT_COORDS[sch.destination.code])
                .map((sch: any) => ({
                    id: sch.id,
                    coords: [{ latitude: airport.lat, longitude: airport.lng }, { latitude: sch.destination.lat, longitude: sch.destination.lng }]
                }));
            setFlightPaths(paths);
        }
    } catch (error) { console.error(error); }
  };

  const handleMarkerPress = (airport: any) => {
    setSearchResults([]); setSearchQuery('');
    setSelectedAirport(airport);
    mapRef.current?.animateToRegion({ latitude: airport.lat, longitude: airport.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    fetchFlightsForAirport(airport);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true); Keyboard.dismiss();
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=airport+${searchQuery}&key=${GOOGLE_API_KEY}`);
      const json = await response.json();
      if (json.results) {
        let results = json.results.map((item: any) => ({ ...item, distance: 0 })); 
        setSearchResults(results);
      }
    } catch (error) { setAlertConfig({ visible: true, type: 'error', title: 'Gagal', message: 'Gagal mencari bandara.' }); } finally { setIsSearching(false); }
  };

  const handleSelectResult = (result: any) => {
    setSearchResults([]); setSearchQuery('');
    const newAirport = {
        id: result.place_id, code: 'APT', name: result.name,
        lat: result.geometry.location.lat, lng: result.geometry.location.lng,
        city: result.formatted_address
    };
    handleExternalTrigger(newAirport, false);
  };

  const startDriveMode = async (target: any) => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    setIsRouteLoading(true);
    setNavInfo(null);
    setRouteCoords([]);
    
    const loc = location || locationRef.current;
    if (!loc) {
        setIsRouteLoading(false);
        setAlertConfig({ visible: true, type: 'error', title: 'Error', message: 'Lokasi Anda tidak ditemukan.' });
        return;
    }

    try {
        const origin = `${loc.coords.latitude},${loc.coords.longitude}`;
        const dest = `${target.lat},${target.lng}`;
        
        const resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${GOOGLE_API_KEY}&mode=driving`);
        const json = await resp.json();

        if (json.routes && json.routes.length > 0) {
            const route = json.routes[0];
            const leg = route.legs[0];
            
            routeSteps.current = leg.steps;
            currentStepIndex.current = 0;

            let detailedCoords: any[] = [];
            leg.steps.forEach((step: any) => {
                const stepPoints = decodePolyline(step.polyline.points);
                detailedCoords = [...detailedCoords, ...stepPoints];
            });
            setRouteCoords(detailedCoords);

            setNavInfo({
                distanceRemaining: leg.distance.text,
                timeRemaining: leg.duration.text,
                nextInstruction: stripHtml(leg.steps[0].html_instructions),
                nextManeuver: leg.steps[0].maneuver || 'straight',
                distanceToTurn: leg.steps[0].distance.text
            });

            setIsDriveMode(true);
            setTargetAirportId(target.id);
            setSelectedAirport(null);
            setFlightPaths([]); 

            await startNavigationLoop();
        } else {
            setAlertConfig({ visible: true, type: 'error', title: 'Rute Gagal', message: 'Tidak dapat menemukan rute jalan ke tujuan ini.' });
        }
    } catch (e) {
        console.log(e);
        setAlertConfig({ visible: true, type: 'error', title: 'Koneksi Error', message: 'Gagal menghubungi server navigasi.' });
    } finally {
        setIsRouteLoading(false);
    }
  };

  const startNavigationLoop = async () => {
    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 2 },
      (newLoc) => {
          setLocation(newLoc);
          locationRef.current = newLoc;
          updateNavigationStatus(newLoc); 
      }
    );

    headingSubscription.current = await Location.watchHeadingAsync((obj) => {
      if (locationRef.current && mapRef.current) {
        mapRef.current.animateCamera({ 
            center: { latitude: locationRef.current.coords.latitude, longitude: locationRef.current.coords.longitude }, 
            heading: obj.magHeading, 
            pitch: 65, 
            zoom: 19   
        }, { duration: 500 }); 
      }
    });
  };

  const updateNavigationStatus = (currentLoc: Location.LocationObject) => {
      if (!routeSteps.current || routeSteps.current.length === 0) return;

      const steps = routeSteps.current;
      const idx = currentStepIndex.current;

      if (idx < steps.length) {
          const currentStep = steps[idx];
          const stepEndLat = currentStep.end_location.lat;
          const stepEndLng = currentStep.end_location.lng;

          const distToStepEnd = getDistance(
              currentLoc.coords.latitude, currentLoc.coords.longitude,
              stepEndLat, stepEndLng
          ) * 1000; 

          const distText = distToStepEnd > 1000 ? (distToStepEnd/1000).toFixed(1) + " km" : Math.round(distToStepEnd) + " m";
          
          if (distToStepEnd < 40 && idx < steps.length - 1) {
              currentStepIndex.current = idx + 1;
              const nextStep = steps[idx + 1];
              
              setNavInfo(prev => ({
                  ...prev!,
                  nextInstruction: stripHtml(nextStep.html_instructions),
                  nextManeuver: nextStep.maneuver || 'straight',
                  distanceToTurn: nextStep.distance.text, 
                  distanceRemaining: prev?.distanceRemaining || "..." 
              }));
          } else {
              setNavInfo(prev => ({
                  ...prev!,
                  distanceToTurn: distText
              }));
          }
      }
  };

  const stopDriveMode = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
    setIsDriveMode(false);
    setTargetAirportId(null);
    setRouteCoords([]);
    setNavInfo(null);
    
    if (locationSubscription.current) locationSubscription.current.remove();
    if (headingSubscription.current) headingSubscription.current.remove();
    
    if(location) {
        mapRef.current?.animateCamera({ 
            center: { latitude: location.coords.latitude, longitude: location.coords.longitude }, 
            pitch: 0, 
            heading: 0, 
            zoom: 15 
        });
    }
  };

  const getManeuverIcon = (maneuver: string) => {
      if (maneuver.includes('left')) return <CornerUpLeft size={48} color="white" />;
      if (maneuver.includes('right')) return <CornerUpRight size={48} color="white" />;
      return <ArrowUp size={48} color="white" />;
  };

  const handleNavButtonPress = () => {
    if (isDriveMode) {
      setAlertConfig({ visible: true, type: 'warning', title: 'Berhenti Navigasi', message: 'Akhiri perjalanan?', onConfirm: stopDriveMode });
    } else {
        handleCenterUser(); 
        const findNearest = () => {
            if(!location) return;
            let minDist = Infinity; let nearest: any = null;
            airports.forEach((airport) => {
                const dist = getDistance(location.coords.latitude, location.coords.longitude, airport.lat, airport.lng);
                if (dist < minDist) { minDist = dist; nearest = airport; }
            });
            if(nearest) startDriveMode(nearest);
        };
        if (!selectedAirport) {
             setAlertConfig({ visible: true, type: 'info', title: 'Bandara Terdekat', message: 'Cari dan navigasi ke bandara terdekat?', onConfirm: findNearest });
        }
    }
  };
  
  const handleCenterUser = () => {
    if (location && mapRef.current) {
        if(isDriveMode) {
             mapRef.current.animateCamera({ center: { latitude: location.coords.latitude, longitude: location.coords.longitude }, pitch: 65, heading: 0, zoom: 19 });
        } else {
            mapRef.current.animateToRegion({ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        }
    }
  };

  if (!location) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={{ marginTop: 10, fontFamily: 'Poppins_500Medium', color: Colors.light.icon }}>Menyiapkan satelit...</Text>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        style={isDarkMode ? 'light' : 'dark'} 
        backgroundColor="transparent" 
        translucent={true} 
      />

      {isRouteLoading && (
          <View style={styles.loadingOverlay}>
              <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.loadingText}>Menyiapkan Rute Terbaik...</Text>
              </View>
          </View>
      )}

      {isDriveMode && navInfo && !isRouteLoading && (
          <View style={[styles.navHeader, { paddingTop: insets.top + 10 }]}>
              <View style={styles.navCard}>
                  <View style={styles.turnIconBox}>
                      {getManeuverIcon(navInfo.nextManeuver)}
                      <Text style={styles.turnDistText}>{navInfo.distanceToTurn}</Text>
                  </View>
                  <View style={styles.navInfoContent}>
                      <Text style={styles.navInstruction} numberOfLines={2}>
                          {navInfo.nextInstruction}
                      </Text>
                      <View style={styles.navStatsRow}>
                          <View style={styles.statChip}>
                              <Clock size={14} color={Colors.light.primary} />
                              <Text style={styles.statVal}>{navInfo.timeRemaining}</Text>
                          </View>
                          <Text style={styles.statDot}>•</Text>
                          <Text style={styles.statValGray}>{navInfo.distanceRemaining}</Text>
                      </View>
                  </View>
              </View>
          </View>
      )}

      {!isDriveMode && (
        <View style={[styles.headerContainer, { top: insets.top + 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity style={[styles.squareBtn, { backgroundColor: isDarkMode ? 'white' : Colors.light.primary }]} onPress={() => setIsDarkMode(!isDarkMode)}>
                  <Layers size={22} color={isDarkMode ? Colors.light.primary : 'white'} />
              </TouchableOpacity>
              <View style={styles.searchBar}>
                <TextInput style={styles.searchInput} placeholder="Cari bandara..." placeholderTextColor={Colors.light.icon} value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} returnKeyType="search" />
                <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                  {isSearching ? <ActivityIndicator size="small" color={Colors.light.primary} /> : <Search size={22} color={Colors.light.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              </View>
          </View>
          
          <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
               <TouchableOpacity style={styles.refreshBtn} onPress={handleRefreshArea}>
                    <RefreshCcw size={16} color="white" strokeWidth={2.5} />
                    <Animated.View style={{ width: refreshTextWidth, opacity: refreshTextOpacity, overflow: 'hidden' }}><Text style={styles.refreshText} numberOfLines={1}>Muat Ulang Area</Text></Animated.View>
               </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsList}>
              <FlatList data={searchResults} keyExtractor={(item) => item.place_id} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectResult(item)}>
                    <View style={styles.resultIconBg}><MapPin size={18} color={Colors.light.primary} /></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.resultTitle}>{item.name}</Text>
                      <Text style={styles.resultSub} numberOfLines={1}>{item.formatted_address}</Text>
                    </View>
                    <ArrowRight size={18} color={Colors.light.icon} />
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeSearch} onPress={() => { setSearchResults([]); setSearchQuery(''); }}><Text style={styles.closeSearchText}>Tutup Hasil</Text></TouchableOpacity>
            </View>
          )}

          {selectedAirport && searchResults.length === 0 && (
             <View style={styles.detailCardContainer}>
                <View style={styles.popupCard}>
                    <View style={styles.popupHeaderRow}>
                        <View style={styles.popupIconPlaceholder}><Text style={{ fontFamily: 'Poppins_700Bold', color: Colors.light.primary, fontSize: 16 }}>{getIataCode(selectedAirport.name, selectedAirport.city) || 'APT'}</Text></View>
                        <View style={styles.popupContent}>
                            <View style={styles.badgeRow}><View style={styles.badge}><Text style={styles.badgeText}>BANDARA</Text></View></View>
                            <Text style={styles.popupTitle} numberOfLines={2}>{selectedAirport.name}</Text>
                            <Text style={styles.popupAddress} numberOfLines={2}>{selectedAirport.city}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedAirport(null)} style={styles.closeBtnAbsolute}><X size={20} color={Colors.light.icon} /></TouchableOpacity>
                    </View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.light.primary, flex: 1 }]} onPress={() => {
                                setAlertConfig({ visible: true, type: 'info', title: 'Mulai Navigasi', message: `Menuju ke ${selectedAirport.name}?`, onConfirm: () => startDriveMode(selectedAirport) });
                            }}>
                            <Navigation size={18} color="white" strokeWidth={2.5} /><Text style={styles.actionText}>Mulai Navigasi</Text>
                        </TouchableOpacity>
                    </View>
                </View>
             </View>
          )}
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsBuildings={false} 
        showsTraffic={isDriveMode} 
        showsIndoors={false}
        customMapStyle={isDarkMode ? MAP_STYLE_DARK : MAP_STYLE_LIGHT} 
        toolbarEnabled={false}
        onRegionChangeComplete={(region) => setCurrentRegion(region)}
        initialRegion={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      >
        {airports.map((item: any) => {
            if (isDriveMode && item.id !== targetAirportId) return null;
            const isTarget = item.id === targetAirportId;
            return (
                <Marker key={item.id} coordinate={{ latitude: item.lat, longitude: item.lng }} onPress={() => handleMarkerPress(item)} zIndex={isTarget ? 100 : 1} tracksViewChanges={tracksViewChanges}>
                    <View style={[styles.markerContainer, { backgroundColor: isTarget ? '#EF4444' : Colors.light.primary }]}><Plane size={14} color="white" style={{ transform: [{ rotate: '-45deg' }] }} /></View>
                </Marker>
            );
        })}
        
        {isDriveMode && routeCoords.length > 0 && (
             <>
                <Polyline coordinates={routeCoords} strokeColor="#1E40AF" strokeWidth={8} zIndex={90} /> 
                <Polyline coordinates={routeCoords} strokeColor="#3B82F6" strokeWidth={5} zIndex={91} />
             </>
        )}
      </MapView>
      
      <View style={[styles.rightControlsWrapper, { bottom: insets.bottom - 10 }]}>
        <TouchableOpacity style={[styles.fabButton, { backgroundColor: isDriveMode ? '#EF4444' : Colors.light.primary }]} onPress={handleNavButtonPress}>
          {isDriveMode ? 
            <X size={24} color="white" strokeWidth={3} /> : 
            <Plane size={24} color="white" strokeWidth={2.5} /> 
          }
        </TouchableOpacity>
      </View>

      {!isDriveMode && (
        <View style={[styles.leftControlsWrapper, { bottom: insets.bottom - 10 }]}>
           <TouchableOpacity style={styles.fabButtonWhite} onPress={handleCenterUser}>
               <LocateFixed size={24} color={Colors.light.text} strokeWidth={2} />
           </TouchableOpacity>
        </View>
      )}

      <CustomAlert visible={alertConfig.visible} type={alertConfig.type} title={alertConfig.title} message={alertConfig.message} onConfirm={alertConfig.onConfirm} onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))} confirmText={alertConfig.confirmText || "Ya"} cancelText={alertConfig.cancelText || "Batal"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  map: { width: '100%', height: '100%' },
  
  navHeader: {
      position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, zIndex: 200,
  },
  navCard: {
      backgroundColor: 'white', 
      borderRadius: 16,
      flexDirection: 'row',
      overflow: 'hidden',
      elevation: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: {width:0, height:4}
  },
  turnIconBox: {
      backgroundColor: Colors.light.primary,
      width: 90,
      justifyContent: 'center', alignItems: 'center',
      paddingVertical: 16
  },
  turnDistText: { color: 'white', fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 4 },
  navInfoContent: { flex: 1, padding: 16, justifyContent: 'center' },
  navInstruction: { color: Colors.light.text, fontFamily: 'Poppins_600SemiBold', fontSize: 18, lineHeight: 24, marginBottom: 8 },
  navStatsRow: { flexDirection: 'row', alignItems: 'center' },
  statChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statVal: { color: Colors.light.primary, fontFamily: 'Poppins_700Bold', fontSize: 14, marginLeft: 6 },
  statDot: { color: '#9CA3AF', marginHorizontal: 8 },
  statValGray: { color: '#6B7280', fontFamily: 'Poppins_500Medium', fontSize: 14 },

  loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center', alignItems: 'center',
      zIndex: 300
  },
  loadingBox: { backgroundColor: 'white', padding: 24, borderRadius: 16, alignItems: 'center', elevation: 10 },
  loadingText: { color: Colors.light.text, marginTop: 16, fontFamily: 'Poppins_600SemiBold' },

  headerContainer: { position: 'absolute', left: 20, right: 20, zIndex: 100 },
  squareBtn: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.primary, height: 40, paddingHorizontal: 12, borderRadius: 20, elevation: 4 },
  refreshText: { color: 'white', fontSize: 11, fontFamily: 'Poppins_600SemiBold', marginLeft: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, paddingRight: 8, elevation: 6 },
  searchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.light.text, height: '100%', paddingLeft: 16 },
  searchBtn: { padding: 8, backgroundColor: '#ffffffff', borderRadius: 14 },
  
  resultsList: { backgroundColor: 'white', marginTop: 12, borderRadius: 24, elevation: 8, padding: 8, maxHeight: 320 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 4 },
  resultIconBg: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  resultTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.light.text },
  resultSub: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.light.icon, marginTop: 2 },
  closeSearch: { padding: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#FAFAFA', marginTop: 4 },
  closeSearchText: { fontFamily: 'Poppins_600SemiBold', color: Colors.light.error, fontSize: 12 },

  detailCardContainer: { marginTop: 12 },
  popupCard: { width: '100%', backgroundColor: 'white', borderRadius: 28, padding: 20, elevation: 20 },
  popupHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  popupIconPlaceholder: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  popupContent: { flex: 1, justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  badge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: Colors.light.primary },
  popupTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: Colors.light.text, lineHeight: 22, marginBottom: 2 },
  popupAddress: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.light.icon },
  closeBtnAbsolute: { position: 'absolute', right: -5, top: -5, padding: 8, backgroundColor: '#FAFAFA', borderRadius: 20 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 18, gap: 8, elevation: 2 },
  actionText: { color: 'white', fontFamily: 'Poppins_600SemiBold', fontSize: 14 },

  markerContainer: { padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white', elevation: 4 },
  rightControlsWrapper: { position: 'absolute', right: 20, alignItems: 'center' },
  leftControlsWrapper: { position: 'absolute', left: 20, alignItems: 'center', gap: 20 },
  fabButton: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabButtonWhite: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 6 },
});
