"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function CreateAccountForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) {
      return digits ? `(${digits}` : "";
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    setDone(false);

    const supabase = createSupabaseBrowserClientOrNull();
    if (!supabase) {
      setFeedback("Configuração de acesso inválida. Verifique o arquivo .env.local.");
      setIsSubmitting(false);
      return;
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const emailRedirectUrl = new URL("/login", baseUrl);
    emailRedirectUrl.searchParams.set("auth", "signup-confirmed");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: emailRedirectUrl.toString(),
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    });

    if (error) {
      setFeedback("Não foi possível criar a conta. Revise os dados e tente de novo.");
      setIsSubmitting(false);
      return;
    }

    setDone(true);
    setIsSubmitting(false);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" htmlFor="firstName">
            Nome
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            placeholder="Nome"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="h-11 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold" htmlFor="lastName">
            Sobrenome
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Sobrenome"
            required
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="h-11 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="phone">
          Telefone
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          required
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          maxLength={15}
          className="h-11 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
        />
      </div>

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

      <div className="space-y-1.5">
        <label className="text-sm font-semibold" htmlFor="password">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            placeholder="Crie uma senha"
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

      {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}
      {done ? (
        <p className="text-sm text-melier-ink">
          Conta criada. Confira seu e-mail para confirmar o cadastro.
        </p>
      ) : null}

      <Button className="h-11 w-full rounded-none" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link className="font-semibold text-melier-rose hover:underline" href="/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
