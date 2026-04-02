"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminOrganizationsService, Organization } from "@/services/private/admin-organizations.service";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

export default function PrivateOrganizationsListPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchOrganizations();
    }, [page, size]);

    async function fetchOrganizations() {
        try {
            setLoading(true);
            const data = await adminOrganizationsService.list({ page, size });

            setOrganizations(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("Error fetching organizations", err);
            toast.error("Erro ao carregar empresas");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <PageHeader 
                title="Empresas" 
                description="Gerenciar todas as organizações"
                backUrl="/private/dashboard"
                actions={
                    <Link className="btn btn-primary btn-sm" href="/private/organizations/new">
                        + Criar Empresa
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
                                    <th>Documento</th>
                                    <th>Cidade</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4">Carregando...</td>
                                    </tr>
                                ) : organizations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted">Nenhuma empresa encontrada</td>
                                    </tr>
                                ) : (
                                    organizations.map((org) => (
                                        <tr key={org.id}>
                                            <td className="fw-semibold">{org.name}</td>
                                            <td><small className="text-muted">{org.doc}</small></td>
                                            <td>{org.city || "-"}</td>
                                            <td className="text-end">
                                                <Link
                                                    href={`/private/organizations/${org.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    Ver detalhes
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