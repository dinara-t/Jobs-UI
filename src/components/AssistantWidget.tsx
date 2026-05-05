import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useMatch } from "react-router-dom";
import styled from "styled-components";
import { api } from "../api/endpoints";
import { getErrorMessage } from "../api/getErrorMessage";
import type {
  AssistantAction,
  ChatContext,
  ClarificationPrompt,
  PendingAction,
} from "../api/types";
import { useAuth } from "../state/AuthContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { ErrorText, Input } from "./Primitives";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  suggestedActions?: AssistantAction[];
  clarificationPrompts?: ClarificationPrompt[];
};

const Shell = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
`;

const Launcher = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  border-radius: 999px;
  min-height: 52px;
  padding: 0 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;

const Panel = styled.div`
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 120px));
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgElevated};
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TitleWrap = styled.div`
  display: grid;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 1.05rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.div`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  min-width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 800;
  cursor: pointer;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const QuickButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 0.82rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.65;
    cursor: default;
  }
`;

const Messages = styled.div`
  overflow: auto;
  padding: 16px;
  display: grid;
  gap: 10px;
`;

const Bubble = styled.div<{ $role: "assistant" | "user" }>`
  justify-self: ${({ $role }) =>
    $role === "user" ? "end" : "start"};
  max-width: 92%;
  border-radius: 18px;
  padding: 12px 14px;
  white-space: pre-wrap;
  line-height: 1.45;
  border: 1px solid ${({ theme, $role }) =>
    $role === "user" ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $role }) =>
    $role === "user" ? theme.colors.primary : theme.colors.card};
  color: ${({ theme, $role }) =>
    $role === "user" ? theme.colors.primaryText : theme.colors.text};
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

const Composer = styled.form`
  padding: 14px 16px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
`;

const SendButton = styled.button`
  min-width: 96px;
  border: 0;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-weight: 800;
  cursor: pointer;
  padding: 0 16px;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
`;

const Footer = styled.div`
  padding: 0 16px 14px;
`;

function makeMessage(
  role: "assistant" | "user",
  text: string,
  suggestedActions?: AssistantAction[],
  clarificationPrompts?: ClarificationPrompt[],
): ChatMessage {
  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    role,
    text,
    suggestedActions,
    clarificationPrompts,
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

export function AssistantWidget() {
  const { isAuthed } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  const match = useMatch("/jobs/:id");

  const currentJobId = useMemo(() => {
    const raw = match?.params?.id;
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [match?.params?.id]);

  const initialAssistantText = currentJobId
    ? `You are viewing job ${currentJobId}. Ask me to show job details, available temps, suggest the best temp, assign a temp, or unassign the current temp.`
    : "Ask me about jobs and temps. I can show details, suggest the best temp, check availability, assign, or unassign.";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    makeMessage("assistant", initialAssistantText),
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [lastSuggestedTempId, setLastSuggestedTempId] = useState<number | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (!prev.length) {
        return [makeMessage("assistant", initialAssistantText)];
      }

      const first = prev[0];
      if (first?.role === "assistant") {
        return [{ ...first, text: initialAssistantText }, ...prev.slice(1)];
      }

      return prev;
    });
  }, [initialAssistantText]);

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    setPendingAction(null);
  }, [location.pathname]);

  if (!isAuthed) {
    return null;
  }

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
      currentJobId,
      lastSuggestedTempId,
    };
  }

  async function sendMessage(raw: string) {
    const message = raw.trim();

    if (!message || busy || confirmBusy) {
      return;
    }

    setBusy(true);
    setError(null);
    setMessages((prev) => [...prev, makeMessage("user", message)]);
    setInput("");

    try {
      const response = await api.chat({
        message,
        context: buildChatContext(),
      });

      const reply = response.reply || "No reply returned.";

      setMessages((prev) => [
        ...prev,
        makeMessage(
          "assistant",
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
      const friendly = getErrorMessage(err, "Failed to contact assistant");
      setError(friendly);
      setMessages((prev) => [
        ...prev,
        makeMessage("assistant", `Error: ${friendly}`),
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
        makeMessage(
          "assistant",
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
      const friendly = getErrorMessage(err, "Failed to complete assistant action");
      setPendingAction(null);
      setError(friendly);
      setMessages((prev) => [
        ...prev,
        makeMessage("assistant", `Error: ${friendly}`),
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
    <Shell>
      {!open ? (
        <Launcher type="button" onClick={() => setOpen(true)}>
          Open assistant
        </Launcher>
      ) : (
        <Panel>
          <Header>
            <TitleWrap>
              <Title>Assistant</Title>
              <Subtitle>
                {currentJobId
                  ? `Scoped to job ${currentJobId}`
                  : "Use chat to explore jobs and temps"}
              </Subtitle>
            </TitleWrap>

            <HeaderActions>
              <IconButton type="button" onClick={() => setOpen(false)}>
                ×
              </IconButton>
            </HeaderActions>
          </Header>

          <QuickActions>
            {currentJobId ? (
              <>
                <QuickButton
                  type="button"
                  disabled={busy || confirmBusy}
                  onClick={() => void sendMessage("Show details for this job")}
                >
                  Job details
                </QuickButton>
                <QuickButton
                  type="button"
                  disabled={busy || confirmBusy}
                  onClick={() => void sendMessage("Show available temps for this job")}
                >
                  Available temps
                </QuickButton>
                <QuickButton
                  type="button"
                  disabled={busy || confirmBusy}
                  onClick={() => void sendMessage("Suggest the best temp for this job")}
                >
                  Best temp
                </QuickButton>
              </>
            ) : (
              <>
                <QuickButton
                  type="button"
                  disabled={busy || confirmBusy}
                  onClick={() => void sendMessage("Show jobs")}
                >
                  Jobs
                </QuickButton>
                <QuickButton
                  type="button"
                  disabled={busy || confirmBusy}
                  onClick={() => void sendMessage("Show temps")}
                >
                  Temps
                </QuickButton>
              </>
            )}
          </QuickActions>

          <Messages ref={messagesRef}>
            {messages.map((message) => (
              <div key={message.id}>
                <Bubble $role={message.role}>{message.text}</Bubble>

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
              </div>
            ))}
          </Messages>

          <Composer onSubmit={(event) => void handleSubmit(event)}>
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={currentJobId ? `Ask about job ${currentJobId}` : "Ask the assistant"}
              disabled={busy || confirmBusy}
            />
            <SendButton type="submit" disabled={busy || confirmBusy || !input.trim()}>
              {busy ? "Sending..." : "Send"}
            </SendButton>
          </Composer>

          <Footer>{error ? <ErrorText>{error}</ErrorText> : null}</Footer>
        </Panel>
      )}

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
    </Shell>
  );
}