import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { Navbar } from "./Navbar";

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
`;

const Main = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
`;

export function Layout() {
  return (
    <Shell>
      <Navbar />
      <Main>
        <Outlet />
      </Main>
    </Shell>
  );
}
