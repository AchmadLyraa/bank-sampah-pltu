"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSelectedBankSampahAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { BanknoteIcon as Bank, Loader2 } from "lucide-react";
import type { NasabahRelationshipForSession } from "@/types";

interface BankSampahSelectorProps {
  relationships: NasabahRelationshipForSession[];
  selectedBankSampahId: string;
}

export function BankSampahSelector({
  relationships,
  selectedBankSampahId,
}: BankSampahSelectorProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleValueChange = async (newBankSampahId: string) => {
    if (newBankSampahId === selectedBankSampahId) return;

    setLoading(true);
    const result = await updateSelectedBankSampahAction(newBankSampahId);
    if (result.success) {
      // Revalidate the current path to fetch new data based on updated session
      router.refresh();
    } else {
      alert(result.error || "Gagal mengganti bank sampah.");
    }
    setLoading(false);
  };

  const currentSelectedBank = relationships.find(
    (rel) => rel.bankSampahId === selectedBankSampahId,
  );

  return (
    <div className="flex items-center gap-2">
      <Bank className="h-5 w-5 text-gray-600" />
      <Select
        value={selectedBankSampahId}
        onValueChange={handleValueChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[240px]">
          {loading ? (
            <span className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat...
            </span>
          ) : (
            <SelectValue placeholder="Pilih Bank Sampah">
              {currentSelectedBank?.bankSampahNama || "Pilih Bank Sampah"}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent>
          {relationships.map((rel) => (
            <SelectItem key={rel.bankSampahId} value={rel.bankSampahId}>
              {rel.bankSampahNama} (Saldo: Rp {rel.saldo.toLocaleString()})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
