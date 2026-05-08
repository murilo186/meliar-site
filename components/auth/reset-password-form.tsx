"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFeedback("Não foi possível redefinir a senha. Abra o link novamente.");
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
      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="password">
          Nova senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          placeholder="Digite a nova senha"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="confirmPassword">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          placeholder="Confirme a nova senha"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="h-11 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
        />
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
    </form>
  );
}
