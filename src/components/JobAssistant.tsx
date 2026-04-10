import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { api } from "../api/endpoints";
import { getErrorMessage } from "../api/getErrorMessage";
import type {
  AssistantAction,
  ChatContext,
  ClarificationPrompt,
  PendingAction,
} from "../api/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button, Card, ErrorText, H2, Input, Muted, Spacer } from "./Primitives";

type Props = {
  jobId: number;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  suggestedActions?: AssistantAction[];
  clarificationPrompts?: ClarificationPrompt[];
};

const Messages = styled.div`
  display: grid;
  gap: 10px;
`;

const MessageCard = styled.div<{ $role: "user" | "assistant" }>`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $role }) =>
    $role === "user" ? theme.colors.input : theme.colors.card};
`;

const Composer = styled.form`
  display: grid;
  gap: 10px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const ChipButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

let nextId = 1;

function makeUserMessage(text: string): ChatMessage {
  return {
    id: nextId++,
    role: "user",
    text,
  };
}

function makeAssistantMessage(
  text: string,
  suggestedActions?: AssistantAction[],
  clarificationPrompts?: ClarificationPrompt[],
): ChatMessage {
  return {
    id: nextId++,
    role: "assistant",
    text,
    suggestedActions,
    clarificationPrompts,
  };
}

function toConfirmMessage(action: PendingAction): string {
  if (action.type === "assign_temp_to_job") {
    return `__confirm_assign__ temp ${action.tempId} to job ${action.jobId}`;
  }

  return `__confirm_unassign__ job ${action.jobId}`;
}

function extractSuggestedTempId(text: string): number | null {
  const directMatch = text.match(/\(Temp\s+(\d+)\)/i);
  if (directMatch) {
    return Number(directMatch[1]);
  }

  const fallbackMatch = text.match(/\bTemp\s+(\d+)\b/i);
  if (fallbackMatch) {
    return Number(fallbackMatch[1]);
  }

  return null;
}

export function JobAssistant({ jobId }: Props) {
  const queryClient = useQueryClient();

  const [input, setInput] = useState("");
  const [lastSuggestedTempId, setLastSuggestedTempId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeAssistantMessage(
      [
        `Ask about job ${jobId}.`,
        `Examples:`,
        `- Show details for this job`,
        `- Show available temps for this job`,
        `- Suggest the best temp for this job`,
        `- Why is temp 5 unavailable for this job?`,
        `- Assign temp 5 here`,
        `- Assign them`,
      ].join("\n"),
      [
        { type: "send_message", label: "Show job details", message: "Show details for this job" },
        {
          type: "send_message",
          label: "Show available temps",
          message: "Show available temps for this job",
        },
        {
          type: "send_message",
          label: "Suggest best temp",
          message: "Suggest the best temp for this job",
        },
      ],
    ),
  ]);
  const [busy, setBusy] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  async function invalidateRelatedData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["jobs"] }),
      queryClient.invalidateQueries({ queryKey: ["temps"] }),
      queryClient.invalidateQueries({ queryKey: ["temp"] }),
      queryClient.invalidateQueries({ queryKey: ["job"] }),
      queryClient.invalidateQueries({ queryKey: ["availableTemps"] }),
      queryClient.invalidateQueries({ queryKey: ["profile"] }),
    ]);
  }

  function buildChatContext(): ChatContext {
    return {
      currentJobId: jobId,
      lastSuggestedTempId,
    };
  }

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();

    if (!message || busy || confirmBusy) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessages((prev) => [...prev, makeUserMessage(message)]);
    setInput("");

    try {
      const response = await api.chat({
        message,
        context: buildChatContext(),
      });

      const reply = response.reply || "No reply returned.";

      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(
          reply,
          response.suggestedActions,
          response.clarificationPrompts,
        ),
      ]);
      setPendingAction(response.pendingAction ?? null);

      const suggestedTempId = extractSuggestedTempId(reply);
      if (suggestedTempId != null) {
        setLastSuggestedTempId(suggestedTempId);
      }

      if (response.pendingAction?.type === "assign_temp_to_job") {
        setLastSuggestedTempId(response.pendingAction.tempId);
      }

      if (response.resolvedEntities?.tempId != null) {
        setLastSuggestedTempId(response.resolvedEntities.tempId);
      }
    } catch (err) {
      const messageText = getErrorMessage(err, "Failed to contact assistant");
      setError(messageText);
      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(`Error: ${messageText}`),
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    setConfirmBusy(true);
    setError(null);

    try {
      const response = await api.chat({
        message: toConfirmMessage(pendingAction),
        context: buildChatContext(),
      });

      const reply = response.reply || "No reply returned.";

      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(
          reply,
          response.suggestedActions,
          response.clarificationPrompts,
        ),
      ]);
      setPendingAction(null);

      const suggestedTempId = extractSuggestedTempId(reply);
      if (suggestedTempId != null) {
        setLastSuggestedTempId(suggestedTempId);
      }

      await invalidateRelatedData();
    } catch (err) {
      const messageText = getErrorMessage(err, "Failed to complete assistant action");
      setError(messageText);
      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(`Error: ${messageText}`),
      ]);
    } finally {
      setConfirmBusy(false);
    }
  }

  async function runAssistantAction(action: AssistantAction) {
    if (action.type === "confirm_pending_action") {
      await confirmPendingAction();
      return;
    }

    await sendMessage(action.message);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage(input);
  }

  return (
    <>
      <Card>
        <H2>Job assistant</H2>
        <Spacer h={8} />
        <Muted>
          This assistant uses your MCP server and current signed-in session.
        </Muted>

        <Spacer h={14} />

        <Actions>
          <Button
            type="button"
            onClick={() => void sendMessage("Show details for this job")}
            disabled={busy || confirmBusy}
          >
            Job details
          </Button>
          <Button
            type="button"
            onClick={() => void sendMessage("Show available temps for this job")}
            disabled={busy || confirmBusy}
          >
            Available temps
          </Button>
          <Button
            type="button"
            onClick={() => void sendMessage("Suggest the best temp for this job")}
            disabled={busy || confirmBusy}
          >
            Best temp
          </Button>
          <Button
            type="button"
            onClick={() => void sendMessage("Why is temp 5 unavailable for this job?")}
            disabled={busy || confirmBusy}
          >
            Explain availability
          </Button>
          <Button
            type="button"
            onClick={() => void sendMessage("Assign them")}
            disabled={busy || confirmBusy || lastSuggestedTempId == null}
          >
            Assign last suggestion
          </Button>
        </Actions>

        <Spacer h={14} />

        <Messages>
          {messages.map((message) => (
            <MessageCard key={message.id} $role={message.role}>
              <strong>{message.role === "user" ? "You" : "Assistant"}</strong>
              <Spacer h={6} />
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {message.text}
              </div>

              {message.role === "assistant" &&
              ((message.suggestedActions?.length ?? 0) > 0 ||
                (message.clarificationPrompts?.length ?? 0) > 0) ? (
                <Chips>
                  {message.suggestedActions?.map((action, index) => (
                    <ChipButton
                      key={`${message.id}-action-${index}-${action.label}`}
                      type="button"
                      disabled={busy || confirmBusy}
                      onClick={() => void runAssistantAction(action)}
                    >
                      {action.label}
                    </ChipButton>
                  ))}

                  {message.clarificationPrompts?.map((prompt) => (
                    <ChipButton
                      key={`${message.id}-prompt-${prompt.id}`}
                      type="button"
                      disabled={busy || confirmBusy}
                      onClick={() => void sendMessage(prompt.message)}
                    >
                      {prompt.label}
                    </ChipButton>
                  ))}
                </Chips>
              ) : null}
            </MessageCard>
          ))}
        </Messages>

        <Spacer h={14} />

        <Composer onSubmit={(event) => void handleSubmit(event)}>
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Ask about job ${jobId}`}
            disabled={busy || confirmBusy}
          />
          <Button
            $variant="primary"
            type="submit"
            disabled={busy || confirmBusy || !input.trim()}
          >
            {busy ? "Sending..." : "Send"}
          </Button>
        </Composer>

        {error ? (
          <>
            <Spacer h={10} />
            <ErrorText>{error}</ErrorText>
          </>
        ) : null}
      </Card>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction?.title ?? "Confirm action"}
        message={pendingAction?.message ?? ""}
        confirmLabel={pendingAction?.confirmLabel ?? "Confirm"}
        confirmVariant={
          pendingAction?.type === "unassign_temp_from_job" ? "danger" : "primary"
        }
        busy={confirmBusy}
        onConfirm={() => void confirmPendingAction()}
        onCancel={() => {
          if (!confirmBusy) {
            setPendingAction(null);
          }
        }}
      />
    </>
  );
}