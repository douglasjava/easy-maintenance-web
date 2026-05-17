"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {useRouter} from "next/navigation";
import {api} from "@/lib/apiClient";

export type SubscriptionStatus = "ACTIVE" | "TRIAL_EXPIRED" | "UNKNOWN";

interface AuthContextType {
    token: string | null;
    subscriptionStatus: SubscriptionStatus;
    isBlocked: boolean;
    loading: boolean;
    login: (data: any, remember: boolean) => Promise<void>;
    logout: () => Promise<void>;
    checkSubscription: (tempOrgCode?: string) => Promise<SubscriptionStatus>;
}

const AUTH_FLAG = "isLoggedIn";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode }) {
    /**
     * O JWT real fica em cookie HttpOnly.
     * Como o JavaScript não consegue ler esse cookie, usamos "cookie"
     * apenas como um marcador interno para indicar que existe uma sessão ativa.
     */
    const [token, setToken] = useState<string | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] =
        useState<SubscriptionStatus>("UNKNOWN");
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const isBlocked = subscriptionStatus === "TRIAL_EXPIRED";

    const clearLocalState = useCallback(() => {
        setToken(null);
        setSubscriptionStatus("UNKNOWN");

        if (typeof window === "undefined") return;

        const storages = [window.localStorage, window.sessionStorage];

        storages.forEach((storage) => {
            storage.removeItem(AUTH_FLAG);
            storage.removeItem("userId");
            storage.removeItem("userName");
            storage.removeItem("organizationCode");
            storage.removeItem("organizationName");
        });
    }, []);

    const checkSubscription = useCallback(async (tempOrgCode?: string): Promise<SubscriptionStatus> => {
        try {
            const headers: Record<string, string> = {};
            if (tempOrgCode) {
                headers["X-Org-Id"] = tempOrgCode;
            }

            const {data} = await api.get<{
                accountAccess?: {
                    subscriptionStatus?: string;
                    accessMode?: string;
                };
            }>("/me/access-context", { headers });

            const status = data.accountAccess?.subscriptionStatus;
            const mode = data.accountAccess?.accessMode;

            if (status === "TRIAL_EXPIRED" || mode === "NO_ACCESS") {
                setSubscriptionStatus("TRIAL_EXPIRED");
                return "TRIAL_EXPIRED";
            }

            setSubscriptionStatus("ACTIVE");
            return "ACTIVE";
        } catch (error) {
            /**
             * Não limpamos o estado aqui.
             * Quem chamou decide se deve deslogar ou apenas tratar como UNKNOWN.
             */
            setSubscriptionStatus("UNKNOWN");
            return "UNKNOWN";
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            clearLocalState();
            router.replace("/login");
        }
    }, [clearLocalState, router]);

    const login = useCallback(
        async (data: any, remember: boolean) => {
            if (typeof window === "undefined") return;

            const storage = remember ? window.localStorage : window.sessionStorage;

            /**
             * Primeiro salvamos apenas dados não sensíveis.
             * O token real já foi gravado pelo backend no cookie HttpOnly.
             */
            storage.setItem(AUTH_FLAG, "1");

            if (data?.id) {
                storage.setItem("userId", String(data.id));
            }

            if (data?.name) {
                storage.setItem("userName", String(data.name));
            }

            /**
             * Determina o orgCode disponível para validar /me/access-context.
             *
             * - 1 org: salva no storage imediatamente e usa na validação.
             * - Múltiplas orgs: não salva ainda (usuário ainda vai escolher),
             *   mas injeta a primeira diretamente no header da requisição
             *   para que o backend não retorne 403 por ausência de X-Org-Id.
             */
            let orgCodeForValidation: string | undefined;

            if (data?.organizationCodes?.length === 1) {
                storage.setItem("organizationCode", String(data.organizationCodes[0]));
                orgCodeForValidation = String(data.organizationCodes[0]);
            } else if (data?.organizationCodes?.length > 1) {
                orgCodeForValidation = String(data.organizationCodes[0]);
            }

            sessionStorage.removeItem("trialBannerDismissed");

            /**
             * Usuário de primeiro acesso pode ter um JWT limitado.
             * Nesse caso, não validamos /me/access-context agora,
             * pois essa rota pode retornar 403 antes da troca de senha.
             */
            if (data?.firstAccess) {
                setToken("cookie");
                return;
            }

            /**
             * Ordem correta:
             * 1. Backend grava cookie
             * 2. Front salva dados básicos
             * 3. Front valida /me/access-context com o orgCode correto
             * 4. Só depois libera a aplicação com setToken("cookie")
             */
            const status = await checkSubscription(orgCodeForValidation);

            if (status === "UNKNOWN") {
                clearLocalState();
                throw new Error("Não foi possível validar o contexto de acesso.");
            }

            setToken("cookie");
        },
        [checkSubscription, clearLocalState]
    );

    useEffect(() => {
        const initAuth = async () => {
            if (typeof window === "undefined") {
                setLoading(false);
                return;
            }

            const hasFlag =
                window.localStorage.getItem(AUTH_FLAG) ||
                window.sessionStorage.getItem(AUTH_FLAG);

            if (!hasFlag) {
                setLoading(false);
                return;
            }

            /**
             * Ao recarregar a página, a flag local pode existir,
             * mas o cookie HttpOnly pode ter expirado.
             *
             * Por isso validamos a sessão no backend antes de liberar a aplicação.
             */
            const status = await checkSubscription();

            if (status === "UNKNOWN") {
                clearLocalState();
            } else {
                setToken("cookie");
            }

            setLoading(false);
        };

        initAuth();
    }, [checkSubscription, clearLocalState]);

    return (
        <AuthContext.Provider
            value={{
                token,
                subscriptionStatus,
                isBlocked,
                loading,
                login,
                logout,
                checkSubscription,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }

    return context;
}