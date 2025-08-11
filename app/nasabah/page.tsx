import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getNasabahDashboardData } from "@/app/actions/nasabah"; // 🆕 Import new action
import LayoutWrapper from "@/components/layout-wrapper";
import NasabahDashboard from "@/components/nasabah-dashboard";
import type { NasabahSession } from "@/types"; // 🆕 Import NasabahSession

export default async function NasabahPage() {
  const session = (await getSession()) as NasabahSession | null; // Cast session type

  if (!session || session.userType !== "nasabah") {
    redirect("/");
  }

  // 🆕 Get selected bank sampah ID from session
  const selectedBankSampahId = session.selectedBankSampahId;

  // 🆕 Fetch dashboard data for the selected bank sampah
  const { nasabah, transaksi, inventarisList, error } =
    await getNasabahDashboardData(session.personId, selectedBankSampahId);

  if (error) {
    // Handle error, e.g., redirect to an error page or display a message
    console.error("Error fetching nasabah dashboard data:", error);
    // For now, redirect to home or show a generic error
    redirect("/");
  }

  if (!nasabah) {
    // This should ideally not happen if error is handled, but as a fallback
    return (
      <LayoutWrapper userType="nasabah" userName={session.nama || "Unknown"}>
        <div className="max-w-4xl mx-auto py-6 px-4 text-center text-gray-500">
          <p>Data nasabah tidak ditemukan untuk bank sampah yang dipilih.</p>
          <p>Silakan coba login kembali atau hubungi admin.</p>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper userType="nasabah" userName={session.nama || "Unknown"}>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <NasabahDashboard
          nasabah={nasabah} // Pass the specific nasabah relationship
          transaksi={transaksi}
          inventarisList={inventarisList} // 🆕 Pass inventaris list
          bankSampahRelationships={session.bankSampahRelationships} // 🆕 Pass all relationships
          selectedBankSampahId={selectedBankSampahId} // 🆕 Pass selected ID
        />
      </div>
    </LayoutWrapper>
  );
}
