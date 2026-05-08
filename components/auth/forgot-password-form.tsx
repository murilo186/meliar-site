"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setDone(false);

    try {
      const supabase = createSupabaseBrowserClientOrNull();
      if (!supabase) {
        setFeedback("Configuração de acesso inválida. Verifique o arquivo .env.local.");
        setIsSubmitting(false);
        return;
      }
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/redefinir-senha`,
      });

      if (error) {
        setFeedback("Não foi possível enviar o e-mail agora. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      setDone(true);
      setIsSubmitting(false);
    } catch {
      setFeedback("Não foi possível enviar o e-mail agora. Tente novamente.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
        />
      </div>

      {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}
      {done ? (
        <p className="text-sm text-melier-ink">
          Se o e-mail existir, você receberá um link para redefinir sua senha.
        </p>
      ) : null}

      <Button className="h-11 w-full rounded-none" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Lembrou da senha?{" "}
        <Link className="font-semibold text-melier-rose hover:underline" href="/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
