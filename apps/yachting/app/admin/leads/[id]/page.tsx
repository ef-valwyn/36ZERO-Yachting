import LeadDetailClient from '../../_components/LeadDetailClient';

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailClient inquiryId={id} />;
}
