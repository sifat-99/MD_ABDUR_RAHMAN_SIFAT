import { StudioLayout } from "@/components/studio/StudioLayout";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ tool?: string[] }>;
}) {
  const resolvedParams = await params;
  return <StudioLayout initialTool={resolvedParams?.tool} />;
}
