import { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Star, Navigation, Store, MapPin, ZoomIn, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix Leaflet icon issue
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const BouncingIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "map-marker-bounce",
});

const createCustomMarkerIcon = (isBouncing: boolean) => {
  return isBouncing ? BouncingIcon : DefaultIcon;
};

// Haversine formula to compute distance in kilometers between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MAP_DEFAULT_CENTER: [number, number] = [-7.797061, 110.368554];

// Map controller component to sync zoom and bounds with parent state
function MapController({
  targetCenter,
}: {
  targetCenter?: [number, number] | null;
}) {
  const map = useMap();
  const lastFlyCoordsRef = useRef<string | null>(null);

  // Dynamically fly/setView to the target position when it changes to prevent map from being stuck in default Jakarta 
  useEffect(() => {
    if (targetCenter) {
      const coordsKey = `${targetCenter[0].toFixed(5)},${targetCenter[1].toFixed(5)}`;
      if (lastFlyCoordsRef.current !== coordsKey) {
        lastFlyCoordsRef.current = coordsKey;
        map.flyTo(targetCenter, 14, { animate: true, duration: 1.5 });
      }
    }
  }, [map, targetCenter]);

  return null;
}

export default function StoreMap({ stores = [], onSelectStore }: { stores?: any[], onSelectStore?: (id: string) => void }) {
  // Track map state dynamically
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Track bouncing pin state
  const [bouncingStoreId, setBouncingStoreId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // References to markers to trigger auto-open popup
  const markersRef = useRef<{ [key: string]: L.Marker | null }>({});

  // Request browser location on mount to provide precise "nearest" calculations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userCoords);
        },
        (error) => {
          console.log("No location permissions granted, using default map center.", error);
        }
      );
    }
  }, []);

  const handleDirections = (lat: number, lng: number, gmapLink?: string) => {
    if (gmapLink) {
      window.open(gmapLink, "_blank");
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    }
  };

  // Determine the reference point (user live location or default center)
  const referencePoint = userLocation || MAP_DEFAULT_CENTER;

  // Calculate distances for all stores and sort by closest
  const storesWithDistance = useMemo(() => {
    return stores.map((store) => {
      const storeLat = store.location?.lat ?? MAP_DEFAULT_CENTER[0];
      const storeLng = store.location?.lng ?? MAP_DEFAULT_CENTER[1];
      const dist = calculateDistance(storeLat, storeLng, referencePoint[0], referencePoint[1]);
      return { ...store, distanceKm: dist };
    });
  }, [stores, referencePoint]);

  // Find the single closest store
  const closestStore = useMemo(() => {
    if (storesWithDistance.length === 0) return null;
    return [...storesWithDistance].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  }, [storesWithDistance]);

  // Render all stores to prevent any markers from disappearing during zoom in/out
  const visibleStores = useMemo(() => {
    return storesWithDistance;
  }, [storesWithDistance]);

  // Determine target center to fly the map to (closest florist to user or user's active coords)
  const targetFlyCenter = useMemo<[number, number] | null>(() => {
    if (closestStore?.location?.lat && closestStore?.location?.lng) {
      return [closestStore.location.lat, closestStore.location.lng];
    }
    if (userLocation) {
      return userLocation;
    }
    return null;
  }, [closestStore, userLocation]);

  // Set/update bouncing store identifier to the closest store whenever the closest store changes
  useEffect(() => {
    if (closestStore) {
      setBouncingStoreId(closestStore.id);
    }
  }, [closestStore?.id]);

  return (
    <div className="h-full w-full overflow-hidden rounded-3xl border bg-card shadow-sm relative flex flex-col">
      {/* Dynamic UX status info layer */}
      {!hasInteracted && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-sm">
          <div className="bg-background/95 backdrop-blur border border-pink-200/50 shadow-lg shadow-pink-500/5 rounded-2xl p-3 flex items-center gap-3 animate-in fade-in duration-200">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="h-4.5 w-4.5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {closestStore ? `Menampilkan ${closestStore.name} (Terdekat)` : "Mencari florist terdekat..."}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                <ZoomIn className="h-3 w-3" /> Klik pin drop untuk melihat info & katalog florist
              </p>
            </div>
            {closestStore && (
              <Badge variant="outline" className="text-[10px] font-bold bg-primary/5 text-primary border-primary/20 shrink-0">
                {closestStore.distanceKm < 1 ? `${Math.round(closestStore.distanceKm * 1000)}m` : `${closestStore.distanceKm.toFixed(1)}km`}
              </Badge>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={referencePoint}
        zoom={13}
        className="h-full w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Sync state with Leaflet */}
        <MapController 
          targetCenter={targetFlyCenter}
        />

        {visibleStores.map((store) => (
          <Marker
            key={store.id}
            position={[store.location.lat, store.location.lng]}
            icon={createCustomMarkerIcon(bouncingStoreId === store.id)}
            eventHandlers={{
              click: () => {
                setBouncingStoreId(null);
                setHasInteracted(true);
              }
            }}
            ref={(el) => {
              if (el) {
                markersRef.current[store.id] = el;
              }
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-heading text-lg font-bold">{store.name}</h3>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold">{store.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({store.reviewCount})
                  </span>
                  {closestStore?.id === store.id && (
                    <Badge variant="default" className="text-[9px] px-1.5 py-0 rounded-full bg-emerald-500 text-white ml-auto">
                      Terdekat
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {store.location.address}
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  Buka: {store.operatingHours}
                </Badge>

                {store.distanceKm !== undefined && (
                  <p className="mt-1.5 text-[10px] text-primary font-bold">
                    Jarak: {store.distanceKm < 1 ? `${Math.round(store.distanceKm * 1000)} meter` : `${store.distanceKm.toFixed(1)} km`} dari Anda
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => handleDirections(store.location.lat, store.location.lng, (store.location as any).gmapLink)}
                  >
                    <Navigation className="mr-1 h-3 w-3" /> Petunjuk Arah
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs"
                    onClick={() => {
                      setBouncingStoreId(null);
                      setHasInteracted(true);
                      onSelectStore?.(store.id);
                    }}
                  >
                    <Store className="mr-1 h-3 w-3" /> Lihat Toko
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
