import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import '../style/GlobalModal.css';

interface ModalOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface ModalContextType {
    showConfirm: (options: ModalOptions) => Promise<boolean>;
    showAlert: (options: ModalOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'alert';
        options: ModalOptions;
        resolveInfo: ((value: boolean | void) => void) | null;
    }>({
        isOpen: false,
        type: 'alert',
        options: { title: '', message: '' },
        resolveInfo: null
    });

    const showConfirm = (options: ModalOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'confirm',
                options,
                resolveInfo: resolve as (value: boolean | void) => void
            });
        });
    };

    const showAlert = (options: ModalOptions): Promise<void> => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'alert',
                options,
                resolveInfo: resolve as (value: boolean | void) => void
            });
        });
    };

    const handleClose = (result: boolean) => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (modalState.resolveInfo) {
            modalState.resolveInfo(result);
        }
    };

    return (
        <ModalContext.Provider value={{ showConfirm, showAlert }}>
            {children}
            {modalState.isOpen && (
                <div className="global-modal-overlay">
                    <div className="global-modal-box">
                        <div className="global-modal-header">
                            <h2>
                                {modalState.options.danger && modalState.type === 'confirm' && '⚠️ '}
                                {modalState.options.title}
                            </h2>
                        </div>
                        <div className="global-modal-body">
                            {modalState.options.message}
                        </div>
                        <div className="global-modal-actions">
                            {modalState.type === 'confirm' && (
                                <button className="global-btn global-btn-cancel" onClick={() => handleClose(false)}>
                                    {modalState.options.cancelText || 'Cancel'}
                                </button>
                            )}
                            <button
                                className={`global-btn ${modalState.options.danger ? 'global-btn-danger' : 'global-btn-confirm'}`}
                                onClick={() => handleClose(true)}
                            >
                                {modalState.options.confirmText || 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
