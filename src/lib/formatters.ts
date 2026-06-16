export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

// ISO date-only strings (YYYY-MM-DD) must be parsed without timezone conversion.
// new Date("2026-06-13") is treated as UTC midnight, which shifts the displayed
// date one day back in UTC-3 timezones (Brazil). We split manually instead.
function parseDateSafe(date: string | Date): Date {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return typeof date === "string" ? new Date(date) : date;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(parseDateSafe(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(parseDateSafe(date));
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

