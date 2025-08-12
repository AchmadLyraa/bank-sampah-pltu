"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, TrendingUp, Users, MapPin, Phone, Mail } from "lucide-react";
import {
  getBankSampahListPaginated,
  toggleBankSampahStatus,
} from "@/app/actions/controller";
import { BankSampahProfitChart } from "@/components/bank-sampah-profit-chart";

interface BankSampah {
  id: string;
  nama: string;
  email: string;
  telepon: string | null;
  alamat: string | null;
  longitude: number | null;
  latitude: number | null;
  isActive: boolean;
  _count: {
    nasabah: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function BankSampahListWithCharts() {
  const [bankSampahList, setBankSampahList] = useState<BankSampah[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBankSampah, setSelectedBankSampah] =
    useState<BankSampah | null>(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);

  const fetchBankSampahList = async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const result = await getBankSampahListPaginated(page, searchQuery, 10);
      if (result.success) {
        setBankSampahList(result.data || []);
        setPagination(
          result.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          },
        );
      }
    } catch (error) {
      console.error("Error fetching bank sampah list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankSampahList(1, search);
  }, [search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchBankSampahList(page, search);
  };

  const handleToggleStatus = async (bankSampahId: string) => {
    try {
      const result = await toggleBankSampahStatus(bankSampahId);
      if (result.success) {
        await fetchBankSampahList(pagination.currentPage, search);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleShowChart = (bankSampah: BankSampah) => {
    setSelectedBankSampah(bankSampah);
    setChartDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari bank sampah..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bank Sampah List */}
      <div className="grid gap-4">
        {bankSampahList.map((bankSampah) => (
          <Card
            key={bankSampah.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{bankSampah.nama}</h3>
                    <Badge
                      variant={bankSampah.isActive ? "default" : "secondary"}
                    >
                      {bankSampah.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{bankSampah.email}</span>
                    </div>
                    {bankSampah.telepon && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{bankSampah.telepon}</span>
                      </div>
                    )}
                    {bankSampah.alamat && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{bankSampah.alamat}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{bankSampah._count.nasabah} nasabah</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center self-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowChart(bankSampah)}
                    className="flex items-center space-x-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Grafik</span>
                  </Button>

                  <Button
                    variant={bankSampah.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleStatus(bankSampah.id)}
                  >
                    {bankSampah.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={
                  page === pagination.currentPage ? "default" : "outline"
                }
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Chart Dialog */}
      <Dialog open={chartDialogOpen} onOpenChange={setChartDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Grafik Keuntungan - {selectedBankSampah?.nama}
            </DialogTitle>
          </DialogHeader>

          {selectedBankSampah && (
            <BankSampahProfitChart bankSampahId={selectedBankSampah.id} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
