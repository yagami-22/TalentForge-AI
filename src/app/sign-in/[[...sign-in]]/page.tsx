import { SignIn } from "@clerk/nextjs";

import { PremiumBackground } from "@/components/premium-background";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <PremiumBackground contentClassName="flex min-h-screen items-center justify-center px-6 py-12">
      <SignIn
        appearance={clerkAuthAppearance}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </PremiumBackground>
  );
}
