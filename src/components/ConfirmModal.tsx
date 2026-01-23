interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
                                         show,
                                         title,
                                         message,
                                         confirmLabel = "Confirmar",
                                         cancelLabel = "Cancelar",
                                         loading = false,
                                         onConfirm,
                                         onCancel,
                                     }: ConfirmModalProps) {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered" style={{ zIndex: 1060 }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onCancel}
                            disabled={loading}
                        />
                    </div>

                    <div className="modal-body">
                        {typeof message === "string" ? (
                            <p className="mb-0">{message}</p>
                        ) : (
                            message
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? "Processando..." : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>

            {/* backdrop */}
            <div className="modal-backdrop fade show" onClick={onCancel} style={{ zIndex: 1050 }} />
        </div>
    );
}
