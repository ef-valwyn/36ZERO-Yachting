'use client';

interface Note {
  id: string;
  body: string;
  createdAt: string;
  authorEmail: string | null;
  authorFirstName: string | null;
  authorLastName: string | null;
  hubspotSynced: boolean;
}

function displayAuthor(n: Note): string {
  const full = [n.authorFirstName, n.authorLastName].filter(Boolean).join(' ');
  return full || n.authorEmail || 'Unknown';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function NotesThread({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-white/40">No notes yet. Add the first one above.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {notes.map((n) => (
        <li key={n.id} className="border-l-2 border-brand-blue/40 pl-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="font-medium text-white/80">{displayAuthor(n)}</span>
            <span>·</span>
            <span>{formatTimestamp(n.createdAt)}</span>
            {!n.hubspotSynced && (
              <span
                className="rounded-full border border-accent-gold/40 bg-accent-gold/10 px-2 py-0.5 text-[10px] text-accent-gold"
                title="Pending sync to HubSpot"
              >
                CRM pending
              </span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-white/90">{n.body}</p>
        </li>
      ))}
    </ul>
  );
}
