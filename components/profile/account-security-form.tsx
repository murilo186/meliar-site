"use client";

import { FormEvent, useState } from "react";
import { Pencil } from "lucide-react";
import { createSupabaseBrowserClientOrNull } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccountSecurityFormProps {
  currentEmail: string;
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
}

function getSiteUrl() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

function buildEmailChangeRedirectUrl() {
  const baseUrl = getSiteUrl();
  if (!baseUrl) {
    return undefined;
  }

  const redirectUrl = new URL("/login", baseUrl);
  redirectUrl.searchParams.set("auth", "email-change-confirmed");
  return redirectUrl.toString();
}

function buildPasswordResetRedirectUrl() {
  const baseUrl = getSiteUrl();
  if (!baseUrl) {
    return undefined;
  }

  return new URL("/redefinir-senha", baseUrl).toString();
}

type EditableField = "name" | "phone" | "email" | null;

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

export function AccountSecurityForm({
  currentEmail,
  initialFirstName,
  initialLastName,
  initialPhone,
}: AccountSecurityFormProps) {
  const [openField, setOpenField] = useState<EditableField>(null);
  const [savedFirstName, setSavedFirstName] = useState(initialFirstName);
  const [savedLastName, setSavedLastName] = useState(initialLastName);
  const [savedPhone, setSavedPhone] = useState(initialPhone);
  const [nameFirstDraft, setNameFirstDraft] = useState(initialFirstName);
  const [nameLastDraft, setNameLastDraft] = useState(initialLastName);
  const [phoneDraft, setPhoneDraft] = useState(initialPhone);
  const [nextEmail, setNextEmail] = useState("");
  const [nameFeedback, setNameFeedback] = useState<string | null>(null);
  const [phoneFeedback, setPhoneFeedback] = useState<string | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<string | null>(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [passwordResetFeedback, setPasswordResetFeedback] = useState<string | null>(null);
  const [lastPasswordResetRequestAt, setLastPasswordResetRequestAt] = useState<number | null>(null);

  const fullName = [savedFirstName, savedLastName].filter(Boolean).join(" ").trim();

  function handleToggle(field: Exclude<EditableField, null>) {
    setNameFeedback(null);
    setPhoneFeedback(null);
    setEmailFeedback(null);
    if (field === "name") {
      setNameFirstDraft(savedFirstName);
      setNameLastDraft(savedLastName);
    }
    if (field === "phone") {
      setPhoneDraft(savedPhone);
    }
    setOpenField((current) => (current === field ? null : field));
  }

  async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameFeedback(null);

    const normalizedFirstName = nameFirstDraft.trim();
    const normalizedLastName = nameLastDraft.trim();

    if (!normalizedFirstName) {
      setNameFeedback("Informe pelo menos o nome.");
      return;
    }

    setIsUpdatingName(true);

    try {
      const supabase = createSupabaseBrowserClientOrNull();
      if (!supabase) {
        setNameFeedback("Configuração de acesso inválida. Verifique o arquivo .env.local.");
        setIsUpdatingName(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNameFeedback("Sua sessão expirou. Faça login novamente.");
        setIsUpdatingName(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: normalizedFirstName,
          last_name: normalizedLastName || null,
        })
        .eq("id", user.id);

      if (error) {
        setNameFeedback("Não foi possível atualizar o nome. Tente novamente.");
        setIsUpdatingName(false);
        return;
      }

      setSavedFirstName(normalizedFirstName);
      setSavedLastName(normalizedLastName);
      setNameFeedback("Nome atualizado.");
      setIsUpdatingName(false);
    } catch {
      setNameFeedback("Não foi possível atualizar o nome. Tente novamente.");
      setIsUpdatingName(false);
    }
  }

  async function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhoneFeedback(null);

    const normalizedPhone = phoneDraft.trim();
    if (!normalizedPhone) {
      setPhoneFeedback("Informe um telefone.");
      return;
    }

    setIsUpdatingPhone(true);

    try {
      const supabase = createSupabaseBrowserClientOrNull();
      if (!supabase) {
        setPhoneFeedback("Configuração de acesso inválida. Verifique o arquivo .env.local.");
        setIsUpdatingPhone(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPhoneFeedback("Sua sessão expirou. Faça login novamente.");
        setIsUpdatingPhone(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          phone: normalizedPhone,
        })
        .eq("id", user.id);

      if (error) {
        setPhoneFeedback("Não foi possível atualizar o telefone. Tente novamente.");
        setIsUpdatingPhone(false);
        return;
      }

      setSavedPhone(normalizedPhone);
      setPhoneFeedback("Telefone atualizado.");
      setIsUpdatingPhone(false);
    } catch {
      setPhoneFeedback("Não foi possível atualizar o telefone. Tente novamente.");
      setIsUpdatingPhone(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailFeedback(null);

    const normalizedNextEmail = nextEmail.trim().toLowerCase();
    const normalizedCurrentEmail = currentEmail.trim().toLowerCase();

    if (!normalizedNextEmail) {
      setEmailFeedback("Informe um novo e-mail.");
      return;
    }

    if (normalizedNextEmail === normalizedCurrentEmail) {
      setEmailFeedback("Digite um e-mail diferente do atual.");
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const supabase = createSupabaseBrowserClientOrNull();
      if (!supabase) {
        setEmailFeedback("Configuração de acesso inválida. Verifique o arquivo .env.local.");
        setIsUpdatingEmail(false);
        return;
      }

      const redirectTo = buildEmailChangeRedirectUrl();
      const { error } = await supabase.auth.updateUser(
        {
          email: normalizedNextEmail,
        },
        {
          emailRedirectTo: redirectTo,
        },
      );

      if (error) {
        setEmailFeedback("Não foi possível solicitar a alteração de e-mail. Tente novamente.");
        setIsUpdatingEmail(false);
        return;
      }

      setEmailFeedback(
        "Solicitação enviada. Confira sua caixa de entrada para confirmar a troca de e-mail.",
      );
      setNextEmail("");
      setIsUpdatingEmail(false);
    } catch {
      setEmailFeedback("Não foi possível solicitar a alteração de e-mail. Tente novamente.");
      setIsUpdatingEmail(false);
    }
  }

  async function handlePasswordResetRequest() {
    setPasswordResetFeedback(null);

    const now = Date.now();
    if (lastPasswordResetRequestAt && now - lastPasswordResetRequestAt < 60_000) {
      setPasswordResetFeedback(
        "Aguarde alguns segundos antes de solicitar outro e-mail de redefinição.",
      );
      setIsResetDialogOpen(false);
      return;
    }

    if (!currentEmail) {
      setPasswordResetFeedback("Não foi possível identificar o e-mail da conta.");
      setIsResetDialogOpen(false);
      return;
    }

    setIsSendingResetLink(true);

    try {
      const supabase = createSupabaseBrowserClientOrNull();
      if (!supabase) {
        setPasswordResetFeedback("Configuração de acesso inválida. Verifique o arquivo .env.local.");
        setIsSendingResetLink(false);
        setIsResetDialogOpen(false);
        return;
      }

      const redirectTo = buildPasswordResetRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(currentEmail, {
        ...(redirectTo ? { redirectTo } : {}),
      });

      if (error) {
        setPasswordResetFeedback("Não foi possível enviar o e-mail agora. Tente novamente.");
        setIsSendingResetLink(false);
        setIsResetDialogOpen(false);
        return;
      }

      setLastPasswordResetRequestAt(now);
      setPasswordResetFeedback("Enviamos o link de redefinição para o e-mail da sua conta.");
      setIsSendingResetLink(false);
      setIsResetDialogOpen(false);
    } catch {
      setPasswordResetFeedback("Não foi possível enviar o e-mail agora. Tente novamente.");
      setIsSendingResetLink(false);
      setIsResetDialogOpen(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="border border-black/10">
        <div className="flex items-center justify-between gap-2 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="text-sm font-medium text-black">{fullName || "Não informado"}</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("name")}
            aria-label="Editar nome"
            className="rounded-none border border-black/20 p-2 text-melier-ink hover:bg-[#ffe4ec]"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        {openField === "name" ? (
          <form
            className="space-y-3 border-t border-black/10 p-3"
            onSubmit={handleNameSubmit}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                autoComplete="given-name"
                placeholder="Nome"
                required
                value={nameFirstDraft}
                onChange={(event) => setNameFirstDraft(event.target.value)}
                className="h-10 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
              />
              <input
                type="text"
                autoComplete="family-name"
                placeholder="Sobrenome"
                value={nameLastDraft}
                onChange={(event) => setNameLastDraft(event.target.value)}
                className="h-10 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
              />
            </div>
            {nameFeedback ? <p className="text-xs text-muted-foreground">{nameFeedback}</p> : null}
            <Button className="h-10 rounded-none px-4" disabled={isUpdatingName} type="submit">
              {isUpdatingName ? "Salvando..." : "Salvar nome"}
            </Button>
          </form>
        ) : null}
      </div>

      <div className="border border-black/10">
        <div className="flex items-center justify-between gap-2 p-3">
          <div>
            <p className="text-xs text-muted-foreground">Telefone</p>
            <p className="text-sm font-medium text-black">{savedPhone || "Não informado"}</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("phone")}
            aria-label="Editar telefone"
            className="rounded-none border border-black/20 p-2 text-melier-ink hover:bg-[#ffe4ec]"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        {openField === "phone" ? (
          <form
            className="space-y-3 border-t border-black/10 p-3"
            onSubmit={handlePhoneSubmit}
          >
            <input
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              required
              maxLength={15}
              value={phoneDraft}
              onChange={(event) => setPhoneDraft(formatPhone(event.target.value))}
              className="h-10 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
            />
            {phoneFeedback ? <p className="text-xs text-muted-foreground">{phoneFeedback}</p> : null}
            <Button className="h-10 rounded-none px-4" disabled={isUpdatingPhone} type="submit">
              {isUpdatingPhone ? "Salvando..." : "Salvar telefone"}
            </Button>
          </form>
        ) : null}
      </div>

      <div className="border border-black/10">
        <div className="flex items-center justify-between gap-2 p-3">
          <div>
            <p className="text-xs text-muted-foreground">E-mail</p>
            <p className="text-sm font-medium text-black">{currentEmail || "Não informado"}</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle("email")}
            aria-label="Editar e-mail"
            className="rounded-none border border-black/20 p-2 text-melier-ink hover:bg-[#ffe4ec]"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        {openField === "email" ? (
          <form
            className="space-y-3 border-t border-black/10 p-3"
            onSubmit={handleEmailSubmit}
          >
            <input
              type="email"
              autoComplete="email"
              placeholder="Novo e-mail"
              required
              value={nextEmail}
              onChange={(event) => setNextEmail(event.target.value)}
              className="h-10 w-full rounded-none border border-black/30 px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-melier-rose"
            />
            {emailFeedback ? <p className="text-xs text-muted-foreground">{emailFeedback}</p> : null}
            <Button className="h-10 rounded-none px-4" disabled={isUpdatingEmail} type="submit">
              {isUpdatingEmail ? "Salvando..." : "Solicitar troca de e-mail"}
            </Button>
          </form>
        ) : null}
      </div>

      <div className="border border-black/10 bg-[#fff7fa] p-3">
        <p className="text-sm text-melier-ink">
          Para alterar sua senha, use o fluxo de redefinição por e-mail.
        </p>
        <Button
          className="mt-3 h-10 rounded-none px-4"
          onClick={() => setIsResetDialogOpen(true)}
          type="button"
          variant="outline"
        >
          Redefinir senha por e-mail
        </Button>
        {passwordResetFeedback ? (
          <p className="mt-2 text-xs text-muted-foreground">{passwordResetFeedback}</p>
        ) : null}
      </div>

      <Dialog onOpenChange={setIsResetDialogOpen} open={isResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar redefinição de senha</DialogTitle>
            <DialogDescription>
              Deseja enviar um e-mail de redefinição de senha para {currentEmail}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="rounded-none"
              disabled={isSendingResetLink}
              onClick={() => setIsResetDialogOpen(false)}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              className="rounded-none"
              disabled={isSendingResetLink}
              onClick={() => {
                void handlePasswordResetRequest();
              }}
              type="button"
            >
              {isSendingResetLink ? "Enviando..." : "Confirmar envio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
