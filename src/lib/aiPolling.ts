import { api } from "./apiClient";

export type AiJobStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

export interface AiJobStatusResponse {
    jobId: string;
    status: AiJobStatus;
    result: unknown;
    error: string | null;
    createdAt: string;
    completedAt: string | null;
}

/**
 * Polls GET /ai/jobs/{jobId} until status is DONE or FAILED.
 * Returns the result payload on success, throws on failure or timeout.
 */
export async function pollAiJob<T = unknown>(
    jobId: string,
    maxAttempts = 30,
    intervalMs = 2000
): Promise<T> {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
        const { data } = await api.get<AiJobStatusResponse>(`ai/jobs/${jobId}`);
        if (data.status === "DONE") {
            return data.result as T;
        }
        if (data.status === "FAILED") {
            throw new Error(data.error ?? "Processamento da IA falhou");
        }
    }
    throw new Error("Timeout aguardando resposta da IA. Tente novamente.");
}
