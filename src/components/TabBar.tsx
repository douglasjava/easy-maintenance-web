"use client";
import Link from "next/link";

export default function TabBar() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-white/90 backdrop-blur px-6 py-2 flex justify-around">
            <Link href="/items">Itens</Link>
            <Link href="/items/new">Adicionar</Link>
            <Link href="/">Início</Link>
        </nav>
    );
}
