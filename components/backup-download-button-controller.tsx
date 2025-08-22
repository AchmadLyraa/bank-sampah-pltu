"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface BackupDownloadButtonControllerProps {
  bankSampahId: string;
}

export default function BackupDownloadButtonController({
  bankSampahId,
}: BackupDownloadButtonControllerProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // 📥 Fetch PDF
      const response = await fetch(
        `/api/backup-pdf-controller?bankSampahId=${bankSampahId}`,
      );

      if (!response.ok) {
        throw new Error("Gagal mengunduh laporan backup");
      }

      // 📄 Get PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // 📁 Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-data-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();

      // 🧹 Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // ✅ Success message
    } catch (error) {
      console.error("Error downloading backup:", error);
      alert("❌ Gagal mengunduh laporan backup. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Membuat PDF...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Backup PDF
        </>
      )}
    </Button>
  );
}
