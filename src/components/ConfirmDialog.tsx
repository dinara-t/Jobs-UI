import { ReactNode } from "react";
import styled from "styled-components";
import { Button, Card, H2, Muted, Row, Spacer } from "./Primitives";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(4, 10, 24, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
`;

const DialogCard = styled(Card)`
  width: min(100%, 460px);
  padding: 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
`;

const Actions = styled(Row)`
  justify-content: flex-end;
`;

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger" | "ghost";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <Overlay
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <DialogCard onClick={(e) => e.stopPropagation()}>
        <H2>{title}</H2>
        <Spacer h={10} />
        {typeof message === "string" ? <Muted>{message}</Muted> : message}
        <Spacer h={18} />

        <Actions>
          <Button onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button $variant={confirmVariant} onClick={onConfirm} disabled={busy}>
            {busy ? "Working..." : confirmLabel}
          </Button>
        </Actions>
      </DialogCard>
    </Overlay>
  );
}