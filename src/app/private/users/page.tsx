"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminUsersService, AdminUser } from "@/services/private/admin-users.service";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

export default function PrivateUsersListPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
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
            const data = await adminUsersService.list({ page, size });

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
            <PageHeader 
                title="Usuários" 
                description="Gerenciar usuários do sistema."
                backUrl="/private/dashboard"
                actions={
                    <Link className="btn btn-primary btn-sm" href="/private/users/new">
                        + Criar Usuário
                    </Link>
                }
            />

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
                                                <StatusBadge status={user.status} />
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