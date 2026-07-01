import { SignUp } from "@clerk/nextjs";

import { PremiumBackground } from "@/components/premium-background";

export default function SignUpPage() {
  return (
    <PremiumBackground contentClassName="flex min-h-screen items-center justify-center px-6 py-12">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#67e8f9",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </PremiumBackground>
  );
}
