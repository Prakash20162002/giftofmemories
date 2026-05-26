import { createContext, useContext, useState } from "react";
import ConfirmDialog from "../components/admin/ConfirmDialog";

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    message: "",
    resolveFn: null,
  });

  const confirm = (message) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        message,
        resolveFn: resolve,
      });
    });
  };

  const handleConfirm = () => {
    if (dialogState.resolveFn) {
      dialogState.resolveFn(true);
    }
    setDialogState({
      isOpen: false,
      message: "",
      resolveFn: null,
    });
  };

  const handleCancel = () => {
    if (dialogState.resolveFn) {
      dialogState.resolveFn(false);
    }
    setDialogState({
      isOpen: false,
      message: "",
      resolveFn: null,
    });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        message={dialogState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};
