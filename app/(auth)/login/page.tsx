// app/(auth)/login/page.tsx
import { Suspense } from "react";
import { Spinner } from "@/components/Spinner";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner label="Loading..." fullScreen />}>
      <LoginForm />
    </Suspense>
  );
}