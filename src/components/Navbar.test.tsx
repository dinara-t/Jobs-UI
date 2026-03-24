import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "./Navbar";
import { renderWithProviders } from "../test/renderWithProviders";

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../state/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { useAuth } from "../state/AuthContext";

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Login when user is not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthed: false,
      isReady: true,
      currentUser: null,
      refreshSession: vi.fn(),
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithProviders(<Navbar />);

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /jobs/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /temps/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /profile/i })).not.toBeInTheDocument();
  });

  it("shows authenticated navigation items when user is logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthed: true,
      isReady: true,
      currentUser: {
        id: 1,
        firstName: "Dinara",
        lastName: "Tiumina",
        email: "dinara@example.com",
        managerId: null,
        jobCount: 0,
      },
      refreshSession: vi.fn(),
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithProviders(<Navbar />);

    expect(screen.getByRole("link", { name: /jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /temps/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument();
  });

  it("logs out and redirects to login when logout is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      isAuthed: true,
      isReady: true,
      currentUser: {
        id: 1,
        firstName: "Dinara",
        lastName: "Tiumina",
        email: "dinara@example.com",
        managerId: null,
        jobCount: 0,
      },
      refreshSession: vi.fn(),
      login: vi.fn(),
      logout: mockLogout.mockResolvedValue(undefined),
    });

    renderWithProviders(<Navbar />);

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});