import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-panel px-4 py-10">
      <SignIn />
    </div>
  );
}
