"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

type Organization = {
    id: string;
    code: string;
    name: string;
    plan: string;
    city?: string;
    status?: string;
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
            const adminToken = window.localStorage.getItem("adminToken");
            if (!adminToken) {
                toast.error("Admin token not found");
                return;
            }

            const { data } = await api.get("/private/admin/organizations", {
                params: { page, size },
                headers: { "X-Admin-Token": adminToken },
            });

            setOrganizations(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            console.error("Error fetching organizations", err);
            toast.error("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                        Empresas
                    </h1>
                    <p className="text-muted mt-1 mb-0">
                        Gerenciar todas as organizações
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <Link className="btn btn-outline-secondary" href="/private/dashboard">
                        ← Voltar para Dashboard
                    </Link>
                    <Link className="btn btn-primary" href="/private/organizations/new">
                        + Criar uma Empresa
                    </Link>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>Plan</th>
                                    <th>City</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">Loading...</td>
                                    </tr>
                                ) : organizations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted">No organizations found.</td>
                                    </tr>
                                ) : (
                                    organizations.map((org) => (
                                        <tr key={org.id}>
                                            <td className="fw-semibold">{org.name}</td>
                                            <td><small className="text-muted">{org.code}</small></td>
                                            <td>
                                                <span className={`badge ${org.plan === 'FREE' ? 'bg-secondary' : 'bg-primary'}`}>
                                                    {org.plan}
                                                </span>
                                            </td>
                                            <td>{org.city || "-"}</td>
                                            <td>
                                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <Link
                                                    href={`/private/organizations/${org.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    View Details
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