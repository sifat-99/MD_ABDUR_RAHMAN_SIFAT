import { getNavigation } from "@/lib/db-service";
import { FloatingDockClient } from "./FloatingDockClient";

export async function FloatingDock() {
  const navItems = await getNavigation();

  if (!navItems || navItems.length === 0) {
    return null;
  }

  return <FloatingDockClient navItems={navItems} />;
}
