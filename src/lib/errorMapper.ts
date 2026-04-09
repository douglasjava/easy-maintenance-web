import { isAxiosError } from "axios";

export interface MappedError {
  global: string | null;
  fields: Record<string, string>;
  retryable: boolean;
}

const FIELD_MESSAGES: Record<string, string> = {
  doc: "CPF ou CNPJ inválido. Verifique os dígitos.",
  billingEmail: "E-mail de cobrança inválido.",
  name: "Nome é obrigatório.",
  code: "Nome da organização já está em uso. Escolha outro.",
  zipCode: "CEP inválido. Informe 8 dígitos.",
};

const PROBLEM_BASE = "https://easy-maintenance/api/problems/";

function extractSlug(type: string | undefined): string {
  if (!type) return "unexpected";
  return type.startsWith(PROBLEM_BASE)
    ? type.slice(PROBLEM_BASE.length)
    : "unexpected";
}

export function mapError(error: unknown): MappedError {
  // Not an axios error — treat as unexpected (e.g. programming error thrown in try block)
  if (!isAxiosError(error)) {
    return {
      global: "Erro inesperado. Tente novamente.",
      fields: {},
      retryable: true,
    };
  }

  // Sem resposta da API — erro de rede
  if (!error.response) {
    return {
      global: "Sem conexão. Verifique sua internet e tente novamente.",
      fields: {},
      retryable: true,
    };
  }

  const data = (error.response.data ?? {}) as {
    type?: string;
    violations?: Array<{ field: string; message: string }>;
  };
  const slug = extractSlug(data.type);

  if (slug === "validation-error") {
    const fields: Record<string, string> = {};
    for (const v of data.violations ?? []) {
      fields[v.field] = FIELD_MESSAGES[v.field] ?? v.message;
    }
    return { global: null, fields, retryable: false };
  }

  if (slug === "conflict") {
    return {
      global: "Este dado já está cadastrado.",
      fields: {},
      retryable: false,
    };
  }

  if (slug === "service-unavailable") {
    return {
      global: "Serviço temporariamente indisponível. Tente novamente em alguns minutos.",
      fields: {},
      retryable: true,
    };
  }

  if (slug === "rate-limit-exceeded") {
    return {
      global: "Muitas tentativas. Aguarde e tente novamente.",
      fields: {},
      retryable: true,
    };
  }

  if (slug === "subscription-denied") {
    return {
      global: "Seu plano não permite esta operação. Verifique sua assinatura.",
      fields: {},
      retryable: false,
    };
  }

  return {
    global: "Erro inesperado. Tente novamente.",
    fields: {},
    retryable: true,
  };
}
