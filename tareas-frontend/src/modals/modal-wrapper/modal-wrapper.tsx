import { Modal, Box } from "@mui/material";

export interface ModalWrapperProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function ModalWrapper({
  open,
  onClose,
  children,
  title,
  size = "md",
  showHeader = true,
  className = "",
}: ModalWrapperProps) {
  const maxWidth = size === "sm" ? "300px" : size === "lg" ? "900px" : "600px";

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      }}
    >
      <Box
        className={`bg-body rounded-2 ${className}`}
        style={{ width: maxWidth }}
      >
        <div className="modal-content rounded shadow-sm">
          {showHeader && title && (
            <div className="modal-header d-flex justify-content-between align-items-center">
              <h5 className="modal-title p-2">{title}</h5>
              <button
                type="button"
                className="btn-close p-2"
                onClick={onClose}
              ></button>
            </div>
          )}
          <hr />
          <div className="modal-body overflow" style={{}}>
            {children}
          </div>
        </div>
      </Box>
    </Modal>
  );
}
