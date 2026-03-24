import { Link, NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../state/AuthContext";

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: ${({ theme }) => theme.colors.bgElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Brand = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  letter-spacing: 0.2px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Tab = styled(NavLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.muted};
  padding: 8px 10px;
  border-radius: 10px;
  font-weight: 600;

  &.active {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.card};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  border: 0;
  border-radius: 10px;
  padding: 9px 12px;
  font-weight: 700;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
`;

export function Navbar() {
  const { isAuthed, logout } = useAuth();
  const nav = useNavigate();

  return (
    <Bar>
      <Inner>
        <Brand to="/">Job Assignment</Brand>
        <Nav>
          {isAuthed ? (
            <>
              <Tab to="/jobs">Jobs</Tab>
              <Tab to="/temps">Temps</Tab>
              <Tab to="/profile">Profile</Tab>
              <Button
                onClick={async () => {
                  await logout();
                  nav("/login", { replace: true });
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Tab to="/login">Login</Tab>
          )}
        </Nav>
      </Inner>
    </Bar>
  );
}
