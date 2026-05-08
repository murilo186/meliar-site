import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Redefinir senha" subtitle="Digite e confirme sua nova senha.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
