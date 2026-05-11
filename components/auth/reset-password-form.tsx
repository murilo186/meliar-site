"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const errorCode = searchParams.get("error_code");
  const hasExpiredLink = errorCode === "otp_expired";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setDone(false);

    if (password.length < 6) {
      setFeedback("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFeedback("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClientOrNull();
      if (!supabase) {
        setFeedback("Configuração de acesso inválida. Verifique o arquivo .env.local.");
        setIsSubmitting(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setFeedback("Link inválido ou expirado. Solicite um novo e-mail de redefinição.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFeedback("Não foi possível redefinir a senha. Solicite um novo link.");
        setIsSubmitting(false);
        return;
      }

      setDone(true);
      setIsSubmitting(false);
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1200);
    } catch {
      setFeedback("Não foi possível redefinir a senha. Abra o link novamente.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {hasExpiredLink ? (
        <p className="border border-melier-rose/30 bg-[#ffe4ec] px-3 py-2 text-sm text-melier-ink">
          Este link de redefinição expirou ou já foi usado. Solicite um novo e-mail para continuar.
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="password">
          Nova senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            placeholder="Digite a nova senha"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-none border border-black/30 px-3 pr-11 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-melier-ink/80"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="confirmPassword">
          Confirmar senha
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            placeholder="Confirme a nova senha"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-11 w-full rounded-none border border-black/30 px-3 pr-11 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-melier-ink/80"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}
      {done ? <p className="text-sm text-melier-ink">Senha atualizada. Redirecionando...</p> : null}

      <Button className="h-11 w-full rounded-none" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Salvando..." : "Atualizar senha"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Voltar para{" "}
        <Link className="font-semibold text-melier-rose hover:underline" href="/login">
          Entrar
        </Link>
      </p>
      <p className="text-sm text-muted-foreground">
        Link expirado?{" "}
        <Link className="font-semibold text-melier-rose hover:underline" href="/esqueci-senha">
          Pedir novo e-mail
        </Link>
      </p>
    </form>
  );
}
