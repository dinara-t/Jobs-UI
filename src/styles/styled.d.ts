import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      bg: string;
      bgElevated: string;
      card: string;
      border: string;
      text: string;
      muted: string;
      input: string;
      primary: string;
      primaryText: string;
      danger: string;
      dangerText: string;
    };
  }
}
