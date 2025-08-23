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
import { BankSampahPembelianChart } from "@/components/bank-sampah-pembelian-sampah-chart";

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [search, setSearch] = useState("");
  const [selectedBankSampah, setSelectedBankSampah] =
    useState<BankSampah | null>(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);

  const fetchBankSampahList = async (page = 1, searchQuery = "") => {
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
      setIsInitialLoading(false);
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
      <div className="grid gap-4 w-full">
        {isInitialLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span>Memuat data bank sampah...</span>
            </div>
          </div>
        ) : bankSampahList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search
              ? "Tidak ada bank sampah yang ditemukan"
              : "Belum ada bank sampah terdaftar"}
          </div>
        ) : (
          bankSampahList.map((bankSampah) => (
            <Card
              key={bankSampah.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between sm:flex-row flex-col">
                  <div className="flex-1 md:self-center self-start">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {bankSampah.nama}
                      </h3>
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

                  <div className="flex items-center space-x-2">
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
          ))
        )}
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
          <h1 className="text-2xl font-bold mb-4">
            {selectedBankSampah?.nama}
          </h1>
          <DialogHeader>
            <DialogTitle
              className="text-left
              "
            >
              Grafik Keuntungan
            </DialogTitle>
          </DialogHeader>

          {selectedBankSampah && (
            <>
              <BankSampahProfitChart bankSampahId={selectedBankSampah.id} />
              <BankSampahPembelianChart bankSampahId={selectedBankSampah.id} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
