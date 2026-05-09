import { FacilityDetailPage } from "@/components/facility/FacilityDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FacilityDetailPage id={id} />;
}
