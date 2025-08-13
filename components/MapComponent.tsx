"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface BankSampahLocation {
  id: string;
  nama: string;
  email: string;
  alamat: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  _count: {
    nasabah: number;
  };
}

interface MapComponentProps {
  locations: BankSampahLocation[];
}

export default function MapComponent({ locations }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-96 w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat peta...</p>
        </div>
      </div>
    );
  }

  // Center map on Indonesia
  const centerLat = -2.5;
  const centerLng = 118;
  const zoom = 5;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div className="p-2 min-w-48">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{location.nama}</h3>
                <Badge variant={location.isActive ? "default" : "secondary"}>
                  {location.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-1">{location.email}</p>
              <p className="text-xs text-gray-600 mb-2">{location.alamat}</p>
              <div className="flex items-center gap-1 text-xs">
                <Users className="h-3 w-3" />
                <span>{location._count.nasabah} nasabah</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
