import { useEffect } from "react";
import styled from "styled-components";

const ToastWrap = styled.div<{ $type: "success" | "error" }>`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1100;
  min-width: 280px;
  max-width: 420px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid
    ${({ theme, $type }) =>
      $type === "success" ? "rgba(34, 197, 94, 0.35)" : "rgba(255, 86, 86, 0.35)"};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);

  &::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 5px;
    border-radius: 14px 0 0 14px;
    background: ${({ $type }) => ($type === "success" ? "#22c55e" : "#ff5656")};
  }
`;

const Title = styled.div`
  font-weight: 800;
  margin-bottom: 4px;
`;

const Message = styled.div`
  color: ${({ theme }) => theme.colors.muted};
`;

type ToastProps = {
  open: boolean;
  type?: "success" | "error";
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
};

export function Toast({
  open,
  type = "success",
  title,
  message,
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <ToastWrap $type={type}>
      <Title>{title}</Title>
      <Message>{message}</Message>
    </ToastWrap>
  );
}