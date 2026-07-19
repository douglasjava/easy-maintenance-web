/**
 * Máscara de telefone BR aplicada durante a digitação (format-as-you-type).
 * Aceita celular (11 dígitos, com 9º dígito) e fixo (10 dígitos). A normalização
 * final para E.164 acontece no backend (PhoneNumberNormalizer) — aqui é só exibição.
 */
export function maskBRPhoneInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;

    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);

    if (rest.length <= 4) {
        return `(${ddd}) ${rest}`;
    }

    if (digits.length <= 10) {
        // fixo: (DD) XXXX-XXXX
        return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }

    // celular: (DD) 9XXXX-XXXX
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/**
 * Converte um telefone armazenado em E.164 (+5531972139145) para exibição mascarada,
 * usado para pré-preencher o campo ao carregar o perfil.
 */
export function e164ToDisplayMask(e164OrRaw: string | null | undefined): string {
    if (!e164OrRaw) return "";
    const digits = e164OrRaw.replace(/\D/g, "");
    const withoutCountryCode =
        digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
    return maskBRPhoneInput(withoutCountryCode);
}
