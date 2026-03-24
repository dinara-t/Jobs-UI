import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Primitives";
import { renderWithProviders } from "../test/renderWithProviders";

describe("Primitives Button", () => {
  it("renders button text", () => {
    renderWithProviders(<Button>Click me</Button>);

    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("renders as disabled when disabled prop is passed", () => {
    renderWithProviders(<Button disabled>Disabled</Button>);

    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled();
  });

  it("renders as an anchor when used with the as prop", () => {
    renderWithProviders(
      <Button as="a" href="/jobs">
        Go to jobs
      </Button>,
    );

    expect(screen.getByRole("link", { name: /go to jobs/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    let clicked = 0;

    renderWithProviders(<Button onClick={() => clicked++}>Press</Button>);

    await user.click(screen.getByRole("button", { name: /press/i }));

    expect(clicked).toBe(1);
  });
});