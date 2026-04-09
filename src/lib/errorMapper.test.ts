import { AxiosError } from "axios";
import { mapError } from "./errorMapper";

function makeAxiosError(type: string, violations?: Array<{ field: string; message: string }>) {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    {
      data: { type: `https://easy-maintenance/api/problems/${type}`, violations },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
    }
  );
}

describe("mapError", () => {
  it("returns generic error for non-axios errors", () => {
    const result = mapError(new Error("not axios"));
    expect(result.global).toBe("Erro inesperado. Tente novamente.");
    expect(result.retryable).toBe(true);
    expect(result.fields).toEqual({});
  });

  it("returns network error message when axios error has no response", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK");
    const result = mapError(error);
    expect(result.global).toBe("Sem conexão. Verifique sua internet e tente novamente.");
    expect(result.retryable).toBe(true);
    expect(result.fields).toEqual({});
  });

  it("maps validation-error with known field to PT message", () => {
    const error = makeAxiosError("validation-error", [
      { field: "doc", message: "invalid document" },
    ]);
    const result = mapError(error);
    expect(result.global).toBeNull();
    expect(result.fields.doc).toBe("CPF ou CNPJ inválido. Verifique os dígitos.");
    expect(result.retryable).toBe(false);
  });

  it("falls back to backend message for unknown field in validation-error", () => {
    const error = makeAxiosError("validation-error", [
      { field: "unknownField", message: "campo inválido do backend" },
    ]);
    const result = mapError(error);
    expect(result.fields.unknownField).toBe("campo inválido do backend");
  });

  it("maps validation-error with multiple fields", () => {
    const error = makeAxiosError("validation-error", [
      { field: "doc", message: "invalid" },
      { field: "billingEmail", message: "invalid email" },
    ]);
    const result = mapError(error);
    expect(result.fields.doc).toBe("CPF ou CNPJ inválido. Verifique os dígitos.");
    expect(result.fields.billingEmail).toBe("E-mail de cobrança inválido.");
    expect(result.global).toBeNull();
  });

  it("maps conflict to specific message, not retryable", () => {
    const error = makeAxiosError("conflict");
    const result = mapError(error);
    expect(result.global).toBe("Este dado já está cadastrado.");
    expect(result.retryable).toBe(false);
    expect(result.fields).toEqual({});
  });

  it("maps service-unavailable as retryable", () => {
    const error = makeAxiosError("service-unavailable");
    const result = mapError(error);
    expect(result.global).toBe("Serviço temporariamente indisponível. Tente novamente em alguns minutos.");
    expect(result.retryable).toBe(true);
  });

  it("maps rate-limit-exceeded as retryable", () => {
    const error = makeAxiosError("rate-limit-exceeded");
    const result = mapError(error);
    expect(result.global).toBe("Muitas tentativas. Aguarde e tente novamente.");
    expect(result.retryable).toBe(true);
  });

  it("maps subscription-denied as non-retryable", () => {
    const error = makeAxiosError("subscription-denied");
    const result = mapError(error);
    expect(result.global).toBe("Seu plano não permite esta operação. Verifique sua assinatura.");
    expect(result.retryable).toBe(false);
  });

  it("returns generic retryable error for unknown problem type", () => {
    const error = makeAxiosError("some-unknown-type");
    const result = mapError(error);
    expect(result.global).toBe("Erro inesperado. Tente novamente.");
    expect(result.retryable).toBe(true);
  });
});
