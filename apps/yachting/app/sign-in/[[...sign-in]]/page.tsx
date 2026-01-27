import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/60',
              socialButtonsBlockButton:
                'bg-white/10 border-white/20 text-white hover:bg-white/20',
              socialButtonsBlockButtonText: 'text-white font-medium',
              dividerLine: 'bg-white/20',
              dividerText: 'text-white/40',
              formFieldLabel: 'text-white/80',
              formFieldInput:
                'bg-white/10 border-white/20 text-white placeholder:text-white/40',
              formButtonPrimary:
                'bg-brand-blue hover:bg-brand-blue/90 text-white',
              footerActionLink: 'text-brand-blue hover:text-brand-blue/80',
              identityPreviewEditButton: 'text-brand-blue',
              formFieldAction: 'text-brand-blue',
              alert: 'bg-red-500/10 border-red-500/20 text-red-400',
            },
          }}
        />
      </div>
    </main>
  );
}
