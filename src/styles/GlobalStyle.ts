import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body { height: 100%; }

  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }

  a { color: inherit; }
  button, input, select { font: inherit; }
`;
