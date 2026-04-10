import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobAssistant } from "./JobAssistant";
import { renderWithProviders } from "../test/renderWithProviders";
import { api } from "../api/endpoints";

vi.mock("../api/endpoints", () => ({
  api: {
    chat: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe("JobAssistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders starter chips and sends a quick action message", async () => {
    const user = userEvent.setup();

    mockedApi.chat.mockResolvedValue({
      reply: "Job 12: Solar Installer",
      suggestedActions: [
        {
          type: "send_message",
          label: "Show available temps",
          message: "Show available temps for this job",
        },
      ],
      clarificationPrompts: [],
    });

    renderWithProviders(<JobAssistant jobId={12} />);

    await user.click(screen.getByRole("button", { name: /show job details/i }));

    await waitFor(() => {
      expect(mockedApi.chat).toHaveBeenCalledWith({
        message: "Show details for this job",
        context: {
          currentJobId: 12,
          lastSuggestedTempId: null,
        },
      });
    });

    expect(screen.getByText(/job 12: solar installer/i)).toBeInTheDocument();
  });

  it("stores the suggested temp and uses it when assigning them", async () => {
    const user = userEvent.setup();

    mockedApi.chat
      .mockResolvedValueOnce({
        reply: "Best temp suggestion for job 12 (Solar Installer):\nSarah Lee (Temp 5)",
        suggestedActions: [
          {
            type: "send_message",
            label: "Assign them",
            message: "Assign them",
          },
        ],
        clarificationPrompts: [],
        resolvedEntities: {
          jobId: 12,
          tempId: 5,
          usedCurrentJobContext: true,
          usedLastSuggestedTempContext: false,
        },
      })
      .mockResolvedValueOnce({
        reply: "I can assign temp 5 to job 12. Please confirm to continue.",
        pendingAction: {
          type: "assign_temp_to_job",
          jobId: 12,
          tempId: 5,
          title: "Assign temp",
          message: "Assign temp 5 to job 12?",
          confirmLabel: "Confirm assign",
        },
        suggestedActions: [
          {
            type: "confirm_pending_action",
            label: "Confirm assign",
          },
        ],
        clarificationPrompts: [],
        resolvedEntities: {
          jobId: 12,
          tempId: 5,
          usedCurrentJobContext: true,
          usedLastSuggestedTempContext: true,
        },
      });

    renderWithProviders(<JobAssistant jobId={12} />);

    await user.click(screen.getByRole("button", { name: /suggest best temp/i }));

    await waitFor(() => {
      expect(mockedApi.chat).toHaveBeenNthCalledWith(1, {
        message: "Suggest the best temp for this job",
        context: {
          currentJobId: 12,
          lastSuggestedTempId: null,
        },
      });
    });

    await user.click(screen.getByRole("button", { name: /assign them/i }));

    await waitFor(() => {
      expect(mockedApi.chat).toHaveBeenNthCalledWith(2, {
        message: "Assign them",
        context: {
          currentJobId: 12,
          lastSuggestedTempId: 5,
        },
      });
    });

    expect(screen.getByText(/assign temp 5 to job 12\?/i)).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: /confirm assign/i });
    expect(confirmButtons).toHaveLength(2);
  });

  it("confirms an assignment and sends the internal confirm message", async () => {
    const user = userEvent.setup();

    mockedApi.chat
      .mockResolvedValueOnce({
        reply: "I can assign temp 5 to job 12. Please confirm to continue.",
        pendingAction: {
          type: "assign_temp_to_job",
          jobId: 12,
          tempId: 5,
          title: "Assign temp",
          message: "Assign temp 5 to job 12?",
          confirmLabel: "Confirm assign",
        },
        suggestedActions: [],
        clarificationPrompts: [],
        resolvedEntities: {
          jobId: 12,
          tempId: 5,
          usedCurrentJobContext: true,
          usedLastSuggestedTempContext: true,
        },
      })
      .mockResolvedValueOnce({
        reply: "Assigned Sarah Lee (Temp 5) to job 12 (Solar Installer).",
        suggestedActions: [
          {
            type: "send_message",
            label: "Show job details",
            message: "Show details for this job",
          },
        ],
        clarificationPrompts: [],
      });

    renderWithProviders(<JobAssistant jobId={12} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Assign them");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(mockedApi.chat).toHaveBeenNthCalledWith(1, {
        message: "Assign them",
        context: {
          currentJobId: 12,
          lastSuggestedTempId: null,
        },
      });
    });

    const confirmButtons = await screen.findAllByRole("button", { name: /confirm assign/i });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(mockedApi.chat).toHaveBeenNthCalledWith(2, {
        message: "__confirm_assign__ temp 5 to job 12",
        context: {
          currentJobId: 12,
          lastSuggestedTempId: 5,
        },
      });
    });

    expect(
      screen.getByText(/assigned sarah lee \(temp 5\) to job 12/i),
    ).toBeInTheDocument();
  });

  it("renders clarification prompts from the assistant and sends the selected one", async () => {
    const user = userEvent.setup();

    mockedApi.chat
      .mockResolvedValueOnce({
        reply: "I found more than one matching temp name. Choose the person you meant.",
        suggestedActions: [],
        clarificationPrompts: [
          {
            id: "details-temp-5",
            label: "Sarah Lee (Temp 5)",
            message: "Show temp 5 details",
          },
          {
            id: "details-temp-8",
            label: "Sarah Lim (Temp 8)",
            message: "Show temp 8 details",
          },
        ],
      })
      .mockResolvedValueOnce({
        reply: "Temp 5: Sarah Lee",
        suggestedActions: [],
        clarificationPrompts: [],
        resolvedEntities: {
          tempId: 5,
        },
      });

    renderWithProviders(<JobAssistant jobId={12} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Show Sarah details");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(
      await screen.findByRole("button", { name: /sarah lee \(temp 5\)/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sarah lee \(temp 5\)/i }));

    await waitFor(() => {
      expect(mockedApi.chat).toHaveBeenNthCalledWith(2, {
        message: "Show temp 5 details",
        context: {
          currentJobId: 12,
          lastSuggestedTempId: null,
        },
      });
    });

    expect(screen.getByText(/temp 5: sarah lee/i)).toBeInTheDocument();
  });

  it("shows assistant errors in the UI", async () => {
    const user = userEvent.setup();

    mockedApi.chat.mockRejectedValue(new Error("Network down"));

    renderWithProviders(<JobAssistant jobId={12} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Show details for this job");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText(/error: network down/i)).toBeInTheDocument();
    expect(screen.getByText(/^network down$/i)).toBeInTheDocument();
  });
});