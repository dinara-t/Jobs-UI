import styled from "styled-components";

export const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 48px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
`;

export const H1 = styled.h1`
  margin: 0;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.1;
`;

export const H2 = styled.h2`
  margin: 0;
  font-size: clamp(20px, 3vw, 28px);
  line-height: 1.2;
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

export const Spacer = styled.div<{ h?: number }>`
  height: ${({ h }) => h ?? 12}px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  option {
    background: #1e2433;
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Button = styled.button<{
  $variant?: "primary" | "ghost" | "danger";
}>`
  border: 1px solid ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.primary
      : $variant === "danger"
        ? theme.colors.danger
        : theme.colors.border};
  background: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.primary
      : $variant === "danger"
        ? theme.colors.danger
        : theme.colors.card};
  color: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.primaryText
      : $variant === "danger"
        ? theme.colors.dangerText
        : theme.colors.text};
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    filter 0.2s ease,
    transform 0.05s ease,
    background 0.2s ease,
    border-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
    filter: saturate(0.7);
  }
`;

export const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
`;

export const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 600;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 860px) {
    grid-template-columns: 1fr 1fr;
  }
`;