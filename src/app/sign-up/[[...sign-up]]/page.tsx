import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070d] px-6 py-12">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#67e8f9",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </main>
  );
}
