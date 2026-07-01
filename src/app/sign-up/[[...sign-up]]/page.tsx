import { SignUp } from "@clerk/nextjs";

import { PremiumBackground } from "@/components/premium-background";
import { clerkAuthAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <PremiumBackground contentClassName="flex min-h-screen items-center justify-center px-6 py-12">
      <SignUp
        appearance={clerkAuthAppearance}
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </PremiumBackground>
  );
}
