"use client";

import { useEffect, useState, useRef } from "react";
import { getBankSampahLocations } from "@/app/actions/controller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Building, Search, X } from "lucide-react";

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

export function BankSampahMap() {
  const [locations, setLocations] = useState<BankSampahLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<
    BankSampahLocation[]
  >([]);
  const [MapComponent, setMapComponent] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const loadMap = async () => {
      try {
        const L = await import("leaflet");
        const { MapContainer, TileLayer, Marker, Popup } = await import(
          "react-leaflet"
        );

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        const activeIcon = new L.Icon({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        const inactiveIcon = new L.Icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
          iconRetinaUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })

        const Map = ({ locations }: { locations: BankSampahLocation[] }) => (
          <MapContainer
            center={[-2.5, 118]}
            zoom={5}
            minZoom={4}
            maxZoom={12}
            maxBounds={[
              [-11.5, 95],
              [12, 141],
            ]}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={location.isActive ? activeIcon : inactiveIcon}
              >
                <Popup>
                  <div className="p-2 min-w-48">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{location.nama}</h3>
                      <Badge
                        variant={location.isActive ? "default" : "secondary"}
                      >
                        {location.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {location.email}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {location.alamat}
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <Users className="h-3 w-3" />
                      <span>{location._count.nasabah} nasabah</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {location.latitude.toFixed(6)},{" "}
                      {location.longitude.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );

        setMapComponent(() => Map);
      } catch (error) {
        console.error("Error loading map:", error);
        setError("Gagal memuat komponen peta");
      }
    };

    loadMap();
  }, []);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const result = await getBankSampahLocations();
        if (result.success && result.data) {
          setLocations(result.data);
          setFilteredLocations(result.data);
        } else {
          setError(result.error || "Gagal memuat data");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(
        (location) =>
          location.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.alamat.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  const focusOnLocation = (location: BankSampahLocation) => {
    console.log(
      "Focusing on location:",
      location.nama,
      location.latitude,
      location.longitude,
    );

    if (mapRef.current) {
      try {
        const map = mapRef.current;
        if (map && map.setView) {
          map.setView([location.latitude, location.longitude], 10);
          setSearchQuery("");
        } else {
          console.error("Map instance not available or setView method missing");
        }
      } catch (error) {
        console.error("Error focusing on location:", error);
      }
    } else {
      console.error("Map ref is not available");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat peta...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bank Sampah
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">
              Dengan koordinat lokasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bank Sampah Aktif
            </CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {locations.filter((loc) => loc.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Sedang beroperasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nasabah</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.reduce((total, loc) => total + loc._count.nasabah, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Terdaftar di semua bank sampah
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Cari Bank Sampah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama, email, atau alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {searchQuery && filteredLocations.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto border rounded-lg">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => focusOnLocation(location)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{location.nama}</h4>
                      <p className="text-xs text-gray-600">{location.alamat}</p>
                    </div>
                    <Badge
                      variant={location.isActive ? "default" : "secondary"}
                    >
                      {location.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && filteredLocations.length === 0 && (
            <div className="mt-4 text-center py-4 text-gray-500">
              Tidak ada bank sampah yang ditemukan
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Peta Lokasi Bank Sampah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="h-96 w-full rounded-lg overflow-hidden z-1"
            style={{ position: "relative", zIndex: 1 }}
          >
            {MapComponent ? (
              <MapComponent locations={locations} />
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat peta...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
