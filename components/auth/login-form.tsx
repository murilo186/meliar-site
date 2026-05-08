"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function handlePasswordKeyEvent(event: KeyboardEvent<HTMLInputElement>) {
    setIsCapsLockOn(event.getModifierState("CapsLock"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const isInvalidCredentials = error.message
          .toLowerCase()
          .includes("invalid login credentials");
        setFeedback(
          isInvalidCredentials
            ? "Credenciais inválidas. Verifique e-mail e senha."
            : "Não foi possível entrar agora. Tente novamente.",
        );
        setIsSubmitting(false);
        return;
      }

      if (!user) {
        setFeedback("Não foi possível entrar agora. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const destination = profile?.role === "admin" ? "/admin" : "/";
      router.push(destination);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const isConfigIssue =
        message.includes("missing supabase public env") ||
        message.includes("invalid api key") ||
        message.includes("failed to fetch");

      setFeedback(
        isConfigIssue
          ? "Configuração de acesso inválida. Verifique o arquivo .env.local."
          : "Não foi possível entrar agora. Tente novamente.",
      );
      if (process.env.NODE_ENV !== "production") {
        console.error("Login error details:", error);
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-14 w-full rounded-none border border-black/35 bg-white px-4 text-lg outline-none placeholder:text-muted-foreground focus:border-melier-rose"
        />
      </div>

      <div className="relative">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Senha"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={handlePasswordKeyEvent}
          onKeyUp={handlePasswordKeyEvent}
          className="h-14 w-full rounded-none border border-black/35 bg-white px-4 pr-12 text-lg outline-none placeholder:text-muted-foreground focus:border-melier-rose"
        />
        <button
          type="button"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-melier-ink/80"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {isCapsLockOn ? (
        <p className="text-xs text-amber-700">Caps Lock ativado.</p>
      ) : null}

      {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}

      <Button className="h-14 w-full rounded-none text-lg" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <div className="space-y-2 pt-1">
        <p className="text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link className="font-semibold text-melier-rose hover:underline" href="/create-account">
            Criar conta
          </Link>
        </p>
        <Link
          className="inline-block text-sm text-melier-ink underline underline-offset-2 hover:text-melier-rose"
          href="/esqueci-senha"
        >
          Esqueceu a senha?
        </Link>
      </div>
    </form>
  );
}
