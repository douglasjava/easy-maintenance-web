"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import {categoryLabelMap, statusMap} from "@/lib/enums/labels";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

type User = {
    id: string;
    name: string;
    email: string;
    status: string;
    organizationCodes: []
};

export default function PrivateUsersListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [page, size]);

    async function fetchUsers() {
        try {
            setLoading(true);
            const adminToken = window.localStorage.getItem("adminToken");
            if (!adminToken) {
                toast.error("Token de administrador não encontrado");
                return;
            }

            const { data } = await api.get("/private/admin/users", {
                params: { page, size },
                headers: { "X-Admin-Token": adminToken },
            });

            setUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("Error fetching users", err);
            toast.error("Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Usuários
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Gerenciar usuários do sistema.
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <Link className="btn btn-outline-secondary" href="/private/dashboard">
                        ← Voltar para Dashboard
                    </Link>
                    <Link className="btn btn-primary" href="/private/users/new">
                        + Criar Usuário
                    </Link>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th className="text-center">Empresas Vinculadas</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4">Carregando...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted">Nenhum usuário encontrado</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="fw-semibold">{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.status === 'ACTIVE' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'}`}>
                                                    {statusMap[user.status]}
                                                </span>
                                            </td>
                                            <td className="text-center">{user.organizationCodes?.length || 0}</td>
                                            <td className="text-end">
                                                <Link
                                                    href={`/private/users/${user.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Ver Perfil
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer bg-white border-0 py-3">
                    <Pagination
                        page={page}
                        size={size}
                        totalPages={totalPages}
                        onChange={setPage}
                        onSizeChange={setSize}
                    />
                </div>
            </div>
        </section>
    );
}