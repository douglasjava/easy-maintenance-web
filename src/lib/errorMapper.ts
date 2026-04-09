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
  const axiosError = error as {
    response?: {
      data?: {
        type?: string;
        violations?: Array<{ field: string; message: string }>;
      };
    };
  };

  // Sem resposta da API — erro de rede
  if (!axiosError?.response) {
    return {
      global: "Sem conexão. Verifique sua internet e tente novamente.",
      fields: {},
      retryable: true,
    };
  }

  const data = axiosError.response.data ?? {};
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

  return {
    global: "Erro inesperado. Tente novamente.",
    fields: {},
    retryable: true,
  };
}
