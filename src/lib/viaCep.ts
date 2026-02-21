import axios from "axios";

export type ViaCepAddress = {
  cep: string;
  street: string; // logradouro
  neighborhood: string; // bairro
  city: string; // localidade
  state: string; // uf
  complement?: string; // complemento
};

/**
 * Consulta o serviço público ViaCEP e normaliza o retorno.
 * - Aceita CEP com ou sem máscara.
 * - Retorna `null` quando o CEP for inválido, inexistente ou houver erro de rede.
 */
export async function fetchViaCep(rawCep: string): Promise<ViaCepAddress | null> {
  const cep = (rawCep || "").replace(/\D/g, "");
  if (cep.length !== 8) return null;

  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (!data || data.erro) return null;

    return {
      cep,
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: (data.uf || "").toUpperCase(),
      complement: data.complemento || "",
    };
  } catch {
    return null;
  }
}
