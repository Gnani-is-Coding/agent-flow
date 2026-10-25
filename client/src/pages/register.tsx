import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { useAuthForm } from "@/hooks/useAuthForm";
import { ROUTES } from "@/lib/routes";
import { registerSchema, type RegisterInput } from "@/lib/schemas";

const INITIAL: RegisterInput = { name: "", email: "", password: "" };

export default function RegisterPage() {
  const { fieldErrors, formError, submitting, bind, handleSubmit } = useAuthForm(registerSchema, "/auth/register", INITIAL);

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start automating with AI-generated workflows."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerHref={ROUTES.login}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />
        <TextField label="Name" name="name" autoComplete="name" error={fieldErrors.name} {...bind("name")} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={fieldErrors.email} {...bind("email")} />
        <TextField label="Password" name="password" type="password" autoComplete="new-password" error={fieldErrors.password} {...bind("password")} />
        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
