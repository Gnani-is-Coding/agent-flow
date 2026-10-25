import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { useAuthForm } from "@/hooks/useAuthForm";
import { ROUTES } from "@/lib/routes";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { Router, useRouter } from "next/router";
import { useEffect } from "react";

const INITIAL: LoginInput = { email: "", password: "" };

export default function LoginPage() {
  const { fieldErrors, formError, submitting, bind, handleSubmit } = useAuthForm(loginSchema, "/auth/login", INITIAL);

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to manage your workflows."
      footerText="No account yet?"
      footerLinkLabel="Create one"
      footerHref={ROUTES.register}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={fieldErrors.email} {...bind("email")} />
        <TextField label="Password" name="password" type="password" autoComplete="current-password" error={fieldErrors.password} {...bind("password")} />
        <Button type="submit" loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
