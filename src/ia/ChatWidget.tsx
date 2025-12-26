"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./ChatWidget.module.css";
import { api } from "@/lib/apiClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "O que vence no proximos 30 dias?",
  "O que está atrasado e é mais critico?",
  "Me faça um plano semanal",
  "Escreva uma mensagem para solicitar orçamento",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [open, messages.length]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendQuestion(text?: string) {
    const question = (text ?? input).trim();
    if (!question) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    try {
      // The api client already applies base URL, org header and Authorization if available.
      const res = await api.post("ai/assistant", { question });
      const answer: string = res?.data?.answer ?? "Sem resposta.";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Erro ao consultar assistente.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ocorreu um erro ao buscar a resposta. Detalhes: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSend) void sendQuestion();
  }

  return (
    <div className={styles.wrapper}>
      {/* Floating Action Button */}
      <button
        type="button"
        aria-label="Abrir Samu Assistente"
        className={styles.fabButton}
        onClick={() => setOpen((v) => !v)}
        title={open ? "Fechar Samu Assistente" : "Abrir Samu Assistente"}
      >
        <Image src="/samu-atende.png" alt="Samu Assistente" width={64} height={64} className={styles.fabImg} />
      </button>

      {/* Panel */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Samu Assistente">
          <div className={styles.header}>
            <Image src="/samu-atende.png" alt="Samu Assistente" width={28} height={28} className={styles.headerImg} />
            <div className={styles.title}>Samu Assistente</div>
            <div style={{ marginLeft: "auto" }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div className={styles.body} ref={bodyRef}>
            {/* Quick actions */}
            <div className={styles.quickActions}>
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={styles.quickButton}
                  onClick={() => sendQuestion(q)}
                  disabled={loading}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.length === 0 && (
                <div className={styles.loading}>
                  Faça uma pergunta para começar. Ex.: "Quais itens preciso trocar nos proximos meses"
                </div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`${styles.msgRow} ${m.role === "user" ? styles.msgUser : styles.msgAssistant}`}>
                  <div className={styles.msg}>{m.content}</div>
                </div>
              ))}
              {loading && <div className={styles.loading}>Consultando o assistente...</div>}
            </div>
          </div>

          {/* Footer */}
          <form className={styles.footer} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              placeholder="Digite sua pergunta"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button className={styles.sendBtn} type="submit" disabled={!canSend}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
