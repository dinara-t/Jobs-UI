import { useEffect, useRef, useState } from "react";
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
import { Button, Card, ErrorText, H2, Input, Muted, Spacer } from "./Primitives";
import { ConfirmDialog } from "./ConfirmDialog";

type Props = {
  jobId: number;
};

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  suggestedActions?: AssistantAction[];
  clarificationPrompts?: ClarificationPrompt[];
};

const Messages = styled.div`
  max-height: 360px;
  overflow: auto;
  display: grid;
  gap: 10px;
`;

const MessageCard = styled.div<{ $role: "assistant" | "user" }>`
  justify-self: ${({ $role }) => ($role === "user" ? "end" : "start")};
  max-width: 92%;
  border-radius: 18px;
  padding: 12px 14px;
  white-space: pre-wrap;
  line-height: 1.45;
  border: 1px solid
    ${({ theme, $role }) =>
      $role === "user" ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $role }) =>
    $role === "user" ? theme.colors.primary : theme.colors.card};
  color: ${({ theme, $role }) =>
    $role === "user" ? theme.colors.primaryText : theme.colors.text};
`;

const Composer = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const ChipButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 999px;
  padding: 7px 11px;
  font-size: 0.78rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: default;
  }
`;

function makeAssistantMessage(
  text: string,
  suggestedActions?: AssistantAction[],
  clarificationPrompts?: ClarificationPrompt[],
): Message {
  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    role: "assistant",
    text,
    suggestedActions,
    clarificationPrompts,
  };
}

function makeUserMessage(text: string): Message {
  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    role: "user",
    text,
  };
}

function extractSuggestedTempId(reply: string): number | null {
  const match = reply.match(/\btemp\s+#?(\d+)\b/i);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function toConfirmMessage(action: PendingAction) {
  if (action.type === "assign_temp_to_job") {
    return `__confirm_assign__ temp ${action.tempId} to job ${action.jobId}`;
  }

  return `__confirm_unassign__ job ${action.jobId}`;
}

export function JobAssistant({ jobId }: Props) {
  const queryClient = useQueryClient();
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    makeAssistantMessage(
      `You are viewing job ${jobId}. Ask me to show job details, available temps, suggest the best temp, assign a temp, or unassign the current temp.`,
      [
        {
          type: "send_message",
          label: "Job details",
          message: "Show details for this job",
        },
        {
          type: "send_message",
          label: "Available temps",
          message: "Show available temps for this job",
        },
        {
          type: "send_message",
          label: "Best temp",
          message: "Suggest the best temp for this job",
        },
      ],
    ),
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [lastSuggestedTempId, setLastSuggestedTempId] = useState<number | null>(null);

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

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
      setPendingAction(null);
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
            onClick={() => void sendMessage("Unassign the current temp from this job")}
            disabled={busy || confirmBusy}
          >
            Unassign
          </Button>
        </Actions>

        <Spacer h={14} />

        <Messages ref={messagesRef}>
          {messages.map((message) => (
            <MessageCard key={message.id} $role={message.role}>
              {message.text}

              {message.suggestedActions?.length ? (
                <Chips>
                  {message.suggestedActions.map((action, index) => (
                    <ChipButton
                      key={`${message.id}-action-${index}`}
                      type="button"
                      disabled={busy || confirmBusy}
                      onClick={() => void runAssistantAction(action)}
                    >
                      {action.label}
                    </ChipButton>
                  ))}
                </Chips>
              ) : null}

              {message.clarificationPrompts?.length ? (
                <Chips>
                  {message.clarificationPrompts.map((prompt) => (
                    <ChipButton
                      key={prompt.id}
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