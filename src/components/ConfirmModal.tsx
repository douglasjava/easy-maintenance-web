import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    zIndex?: number;
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
                                         zIndex = 1060,
                                     }: ConfirmModalProps) {
    useEffect(() => {
        if (show) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }

        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [show]);

    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === "Escape" && !loading && show) {
                onCancel();
            }
        }

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [loading, show, onCancel]);

    if (!show) return null;

    const backdropZIndex = zIndex - 1;

    return createPortal(
        <>
            <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                        <div className="modal-header border-0 bg-light p-4">
                            <h5 className="modal-title fw-bold">{title}</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onCancel}
                                disabled={loading}
                            />
                        </div>

                        <div className="modal-body p-4 text-center py-5">
                            <div className="mb-4 text-danger bg-danger-subtle d-inline-flex p-3 rounded-circle mx-auto">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            </div>
                            <div className="px-3">
                                {typeof message === "string" ? (
                                    <p className="mb-0 text-muted">{message}</p>
                                ) : (
                                    message
                                )}
                            </div>
                        </div>

                        <div className="modal-footer border-0 p-4 pt-0 gap-2 flex-column flex-sm-row">
                            <button
                                className="btn btn-light rounded-pill px-4 fw-bold flex-grow-1"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                {cancelLabel}
                            </button>
                            <button
                                className="btn btn-danger rounded-pill px-4 fw-bold flex-grow-1 shadow-sm"
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processando...
                                    </>
                                ) : confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* backdrop */}
            <div 
                className="modal-backdrop fade show" 
                onClick={() => !loading && onCancel()} 
                style={{ zIndex: backdropZIndex }} 
            />
        </>,
        document.body
    );
}
