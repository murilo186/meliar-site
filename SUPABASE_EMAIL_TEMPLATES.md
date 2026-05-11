# Supabase Email Templates (Meliar)

Modelos prontos em português para colar nos templates de e-mail do Supabase Auth.

Paleta usada:
- `#f74780` (accent)
- `#111111` (texto)
- `#ffe4ec` (fundo suave)
- `#ffffff` (fundo principal)

## 1) Confirmar cadastro (Confirm signup)

```html
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#ffe4ec;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #f3d5df;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f74780;">Meliar</p>
                <h2 style="margin:0 0 12px;font-size:24px;line-height:1.2;color:#111111;">Confirme seu cadastro</h2>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#333333;">Para ativar sua conta, confirme seu e-mail no botão abaixo.</p>
                <p style="margin:0 0 20px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 18px;background:#f74780;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Confirmar e-mail</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">Se você não criou esta conta, pode ignorar este e-mail.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## 2) Confirmar alteração de e-mail (Confirm Change of Email)

```html
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#fff7fa;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #f3d5df;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f74780;">Segurança da conta • Meliar</p>
                <h2 style="margin:0 0 12px;font-size:24px;line-height:1.2;color:#111111;">Autorize a troca de e-mail</h2>
                <div style="margin:0 0 16px;padding:12px;border:1px solid #f4c9d8;background:#fff1f6;">
                  <p style="margin:0 0 6px;font-size:13px;line-height:1.5;color:#333333;"><strong>E-mail atual:</strong> {{ .Email }}</p>
                  <p style="margin:0;font-size:13px;line-height:1.5;color:#333333;"><strong>Novo e-mail:</strong> {{ .NewEmail }}</p>
                </div>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#333333;">Para concluir essa alteração, confirme no botão abaixo.</p>
                <p style="margin:0 0 20px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 18px;background:#f74780;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Autorizar alteração de e-mail</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">Não foi você? Ignore este e-mail e entre em contato com o suporte da loja.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## 3) Redefinir senha (Reset Password)

```html
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#ffe4ec;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #f3d5df;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f74780;">Meliar</p>
                <h2 style="margin:0 0 12px;font-size:24px;line-height:1.2;color:#111111;">Redefina sua senha</h2>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#333333;">Clique no botão abaixo para criar uma nova senha para sua conta.</p>
                <p style="margin:0 0 20px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 18px;background:#f74780;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">Redefinir senha</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">Se você não solicitou a redefinição, ignore este e-mail.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## 4) Confirmação de senha alterada (Your password has been changed)

```html
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#ffe4ec;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #f3d5df;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f74780;">Meliar</p>
                <h2 style="margin:0 0 12px;font-size:24px;line-height:1.2;color:#111111;">Sua senha foi alterada</h2>
                <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#333333;">Este e-mail confirma que a senha da conta <strong>{{ .Email }}</strong> foi alterada.</p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">Se você não reconhece essa ação, entre em contato com o suporte imediatamente.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## 5) Confirmação de e-mail alterado (Your email address has been changed)

```html
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#ffe4ec;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #f3d5df;">
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f74780;">Meliar</p>
                <h2 style="margin:0 0 12px;font-size:24px;line-height:1.2;color:#111111;">Seu e-mail foi alterado</h2>
                <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#333333;">O e-mail da sua conta foi atualizado de <strong>{{ .OldEmail }}</strong> para <strong>{{ .Email }}</strong>.</p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#666666;">Se você não reconhece essa ação, entre em contato com o suporte imediatamente.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```
