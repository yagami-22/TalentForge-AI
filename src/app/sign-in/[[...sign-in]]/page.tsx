import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070d] px-6 py-12">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#67e8f9",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
