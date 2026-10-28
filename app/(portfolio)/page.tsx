import PortfolioContent from "@/components/PortfolioContent";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";
import { getSiteSettings, getProfile } from "@/lib/db-service";

export const revalidate = 60;

export default async function Home() {
  const settings = await getSiteSettings();

  if (settings?.maintenanceMode) {
    const profile = await getProfile();
    return <MaintenanceScreen settings={settings} profile={profile} />;
  }

  return (
    <main className="min-h-screen">
      <PortfolioContent />
    </main>
  );
}
