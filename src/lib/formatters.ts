export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export class Formatters {
    static onlyNumbers(value: string): string {
        return value.replace(/\D/g, "");
    }

    static cardNumber(value: string): string {
        return this.onlyNumbers(value)
            .slice(0, 16)
            .replace(/(\d{4})(?=\d)/g, "$1 ");
    }

    static cardExpiry(value: string): string {
        const numbers = this.onlyNumbers(value).slice(0, 4);

        if (numbers.length <= 2) return numbers;

        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    static cardCVC(value: string): string {
        return this.onlyNumbers(value).slice(0, 4);
    }

    static cardHolder(value: string): string {
        return value
            .toUpperCase()
            .replace(/[^\p{L}\s]/gu, "")
            .replace(/\s+/g, " ")
            .trim();
    }

}

