import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export interface PendingPayment {
  paymentId: number;
  methodType: "PIX" | "CARD" | "BOLETO";
  status: "PENDING" | "OVERDUE" | "PAID" | string;
  amountCents: number;
  currency: string;
  paymentLink?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  pixExpiresAt?: string | null;
}

export function usePendingPayment() {
  const { token, loading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery<PendingPayment | null>({
    queryKey: ["billing", "pending-payment"],
    queryFn: async () => {
      const res = await api.get<PendingPayment>("/me/billing/pending-payment");
      // 204 No Content → axios returns empty string or null body
      return res.data || null;
    },
    enabled: !!token && !authLoading,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  return {
    pendingPayment: data ?? null,
    isLoading,
    error: error ? "Falha ao verificar pagamento pendente." : null,
  };
}
