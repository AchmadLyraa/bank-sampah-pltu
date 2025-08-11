import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ControllerDashboard } from "@/components/controller-dashboard";
import LayoutWrapper from "@/components/layout-wrapper";

export default async function ControllerPage() {
  const session = await getSession();

  if (!session || session.userType !== "controller") {
    redirect("/");
  }

  return (
    <LayoutWrapper userType="controller" userName={session.nama}>
      <ControllerDashboard />
    </LayoutWrapper>
  );
}
