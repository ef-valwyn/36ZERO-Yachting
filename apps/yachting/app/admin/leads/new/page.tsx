import ManualLeadForm from '../../_components/ManualLeadForm';

export default function NewLeadPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add leads manually</h1>
        <p className="mt-1 text-sm text-white/60">
          For paper-collected leads and anyone who didn&rsquo;t scan the QR. Each
          row is pushed to HubSpot; staff notification emails are suppressed.
        </p>
      </div>
      <ManualLeadForm />
    </div>
  );
}
