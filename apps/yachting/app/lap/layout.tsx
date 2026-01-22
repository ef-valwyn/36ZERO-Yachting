// Force dynamic rendering to fix Clerk + Next.js 15 compatibility
export const dynamic = 'force-dynamic';

export default function LapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
