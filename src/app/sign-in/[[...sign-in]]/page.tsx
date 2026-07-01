import { SignIn } from "@clerk/nextjs";

import { PremiumBackground } from "@/components/premium-background";

export default function SignInPage() {
  return (
    <PremiumBackground contentClassName="flex min-h-screen items-center justify-center px-6 py-12">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#67e8f9",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </PremiumBackground>
  );
}
