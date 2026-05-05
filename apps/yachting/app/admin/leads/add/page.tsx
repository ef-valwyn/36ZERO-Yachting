import AddLeadForm from '../../_components/AddLeadForm';

export default function AddLeadPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add lead</h1>
        <p className="mt-1 text-sm text-white/60">
          One-off entry for inbound emails, referrals, direct outreach, etc.
          For paper-collected IMHS show leads, use “IMHS bulk” instead.
        </p>
      </div>
      <AddLeadForm />
    </div>
  );
}
