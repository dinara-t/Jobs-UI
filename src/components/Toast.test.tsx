import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import { Toast } from "./Toast";
import { renderWithProviders } from "../test/renderWithProviders";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not render when open is false", () => {
    renderWithProviders(
      <Toast
        open={false}
        title="Success"
        message="Saved"
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByText("Success")).not.toBeInTheDocument();
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("renders title and message when open", () => {
    renderWithProviders(
      <Toast
        open
        title="Assigned"
        message="Temp assigned successfully"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Assigned")).toBeInTheDocument();
    expect(screen.getByText("Temp assigned successfully")).toBeInTheDocument();
  });

  it("calls onClose after the duration", () => {
    const onClose = vi.fn();

    renderWithProviders(
      <Toast
        open
        title="Assigned"
        message="Temp assigned successfully"
        duration={1500}
        onClose={onClose}
      />,
    );

    vi.advanceTimersByTime(1499);
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});