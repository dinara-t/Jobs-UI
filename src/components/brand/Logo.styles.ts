import styled from "styled-components";

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
`;

export const BrandIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.35);
`;

export const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1;
`;

export const BrandEyebrow = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
`;

export const BrandTitle = styled.span`
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f8fafc;
`;

export const BrandAccent = styled.span`
  background: linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 45%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;