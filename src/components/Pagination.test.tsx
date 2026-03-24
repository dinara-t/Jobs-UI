import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./Pagination";
import { renderWithProviders } from "../test/renderWithProviders";

describe("Pagination", () => {
  it("does not render when totalPages is 1 or less", () => {
    const { container } = renderWithProviders(
      <Pagination
        page={0}
        totalPages={1}
        hasPrevious={false}
        hasNext={false}
        onPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders page buttons for a small page count", () => {
    renderWithProviders(
      <Pagination
        page={1}
        totalPages={4}
        hasPrevious
        hasNext
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
  });

  it("renders ellipsis for larger page counts", () => {
    renderWithProviders(
      <Pagination
        page={4}
        totalPages={10}
        hasPrevious
        hasNext
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("calls onPageChange with zero-based page index when a page is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    renderWithProviders(
      <Pagination
        page={0}
        totalPages={4}
        hasPrevious={false}
        hasNext
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange for previous and next buttons", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    renderWithProviders(
      <Pagination
        page={2}
        totalPages={5}
        hasPrevious
        hasNext
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /prev/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("disables navigation buttons when busy", () => {
    renderWithProviders(
      <Pagination
        page={1}
        totalPages={5}
        hasPrevious
        hasNext
        busy
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });
});