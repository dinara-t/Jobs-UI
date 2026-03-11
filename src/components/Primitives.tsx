import styled from "styled-components";

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 16px;
`;

export const H1 = styled.h1`
  font-size: 28px;
  margin: 0 0 14px 0;
  letter-spacing: -0.2px;
`;

export const H2 = styled.h2`
  font-size: 18px;
  margin: 0 0 10px 0;
`;

export const Row = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
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
  border: 1px solid ${({ theme }) => theme.colors.border};
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
  border-color: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.primary
      : $variant === "danger"
        ? theme.colors.danger
        : theme.colors.border};
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
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
    grid-template-columns: 1.2fr 0.8fr;
  }
`;
