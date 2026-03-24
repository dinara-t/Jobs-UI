import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import { getErrorMessage } from "../../../api/getErrorMessage";
import type { Job, Temp } from "../../../api/types";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import {
  Button,
  Card,
  ErrorText,
  Grid,
  H1,
  H2,
  Muted,
  Row,
  Select,
  Spacer,
} from "../../../components/Primitives";
import { Toast } from "../../../components/Toast";
import { queryKeys } from "../../../query/queryKeys";

const TwoCol = styled.div`
  display: grid;
  gap: 18px;
`;

const Section = styled.div`
  display: grid;
  gap: 8px;
`;

const SectionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  opacity: 0.9;
`;

const CurrentAssignmentBox = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgElevated};
  border-radius: 14px;
  padding: 14px 16px;
`;

type PendingAction = "assign" | "unassign" | null;

type ToastState = {
  open: boolean;
  type: "success" | "error";
  title: string;
  message: string;
};

function displayName(job: Job) {
  return job.title ?? job.name ?? `Job #${job.id}`;
}

function assigned(job: Job) {
  return job.assignedTemp ?? job.temp;
}

function tempLabel(temp: Temp) {
  return `${temp.firstName} ${temp.lastName} (#${temp.id}) - Jobs taken: ${temp.jobCount ?? 0}`;
}

function fullTempName(temp: { firstName: string; lastName: string }) {
  return `${temp.firstName} ${temp.lastName}`;
}

export function JobDetailPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const validJobId = Number.isFinite(jobId) && jobId > 0;
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const [selectedTempId, setSelectedTempId] = useState<number | "">("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const jobQuery = useQuery({
    queryKey: queryKeys.job(jobId),
    queryFn: () => api.getJob(jobId),
    enabled: validJobId,
  });

  const availableTempsQuery = useQuery({
    queryKey: queryKeys.availableTemps(jobId),
    queryFn: async () => {
      try {
        return await api.listTemps({
          jobId,
          sortBy: "jobCount",
          sortDir: "asc",
          page: 0,
          size: 100,
        });
      } catch {
        return api.listTemps({
          sortBy: "jobCount",
          sortDir: "asc",
          page: 0,
          size: 100,
        });
      }
    },
    enabled: validJobId,
  });

  const job = jobQuery.data ?? null;
  const temps = availableTempsQuery.data?.items ?? [];
  const currentAssigned = job ? assigned(job)?.id ?? null : null;
  const selectedTemp =
    selectedTempId === ""
      ? null
      : temps.find((temp) => temp.id === selectedTempId) ?? null;

  const busy =
    jobQuery.isFetching ||
    availableTempsQuery.isFetching ||
    pendingAction !== null;

  const error = actionError
    ?? (jobQuery.error
      ? getErrorMessage(jobQuery.error, "Failed to load job")
      : availableTempsQuery.error
        ? getErrorMessage(availableTempsQuery.error, "Failed to load temps")
        : !validJobId
          ? "Invalid job id"
          : null);

  async function refresh() {
    setActionError(null);
    await Promise.all([jobQuery.refetch(), availableTempsQuery.refetch()]);
  }

  async function invalidateRelatedData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["jobs"] }),
      queryClient.invalidateQueries({ queryKey: ["temps"] }),
      queryClient.invalidateQueries({ queryKey: ["temp"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.availableTemps(jobId) }),
    ]);
  }

  async function assignTemp() {
    if (!job || !selectedTemp) return;

    setActionError(null);

    try {
      const updated = await api.patchJob(job.id, {
        tempId: selectedTemp.id,
      });

      queryClient.setQueryData(queryKeys.job(job.id), updated);
      await invalidateRelatedData();

      setSelectedTempId("");
      setPendingAction(null);
      setToast({
        open: true,
        type: "success",
        title: "Assignment updated",
        message: `${fullTempName(selectedTemp)} has been assigned to ${displayName(job)}.`,
      });
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to assign temp"));
      setPendingAction(null);
      setToast({
        open: true,
        type: "error",
        title: "Assignment failed",
        message: `Failed to assign ${selectedTemp ? fullTempName(selectedTemp) : "temp"} to ${displayName(job)}.`,
      });
    }
  }

  async function unassignTemp() {
    if (!job) return;

    const assignedTemp = assigned(job);
    setActionError(null);

    try {
      const updated = await api.patchJob(job.id, { tempId: 0 });

      queryClient.setQueryData(queryKeys.job(job.id), updated);
      await invalidateRelatedData();

      setSelectedTempId("");
      setPendingAction(null);
      setToast({
        open: true,
        type: "success",
        title: "Assignment removed",
        message: `${assignedTemp ? fullTempName(assignedTemp) : "The temp"} has been unassigned from ${displayName(job)}.`,
      });
    } catch (error) {
      setActionError(getErrorMessage(error, "Failed to unassign temp"));
      setPendingAction(null);
      setToast({
        open: true,
        type: "error",
        title: "Unassignment failed",
        message: `Failed to unassign ${assignedTemp ? fullTempName(assignedTemp) : "the temp"} from ${displayName(job)}.`,
      });
    }
  }

  if (!job && error) {
    return (
      <Card>
        <ErrorText>{error}</ErrorText>
        <Spacer h={10} />
        <Row>
          <Button as={Link as any} to="/jobs">
            Back to Jobs
          </Button>
          <Button onClick={() => nav(-1)}>Go Back</Button>
        </Row>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card>
        <Muted>Loading...</Muted>
      </Card>
    );
  }

  const t = assigned(job);

  return (
    <>
      <div>
        <Row style={{ justifyContent: "space-between" }}>
          <div>
            <H1>{displayName(job)}</H1>
            <Muted>Job ID: {job.id}</Muted>
          </div>
          <Row>
            <Button as={Link as any} to="/jobs">
              Back
            </Button>
            <Button onClick={() => void refresh()} disabled={busy}>
              {busy ? "Refreshing..." : "Refresh"}
            </Button>
          </Row>
        </Row>

        <Spacer h={16} />

        {error ? (
          <>
            <Card>
              <ErrorText>{error}</ErrorText>
            </Card>
            <Spacer h={12} />
          </>
        ) : null}

        <Grid>
          <Card>
            <H2>Job details</H2>
            <Spacer h={10} />
            <Muted>Start date: {job.startDate}</Muted>
            <Spacer h={6} />
            <Muted>End date: {job.endDate}</Muted>
            <Spacer h={6} />
            <Muted>
              Assigned temp: {t ? `${t.firstName} ${t.lastName} (#${t.id})` : "Unassigned"}
            </Muted>
          </Card>

          <Card>
            <H2>Assignment</H2>
            <Spacer h={10} />

            <TwoCol>
              <Section>
                <Muted>Assign new temp</Muted>
                <Select
                  value={selectedTempId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedTempId(value === "" ? "" : Number(value));
                  }}
                  disabled={busy}
                >
                  <option value="">Select a temp</option>
                  {temps
                    .filter((x) => x.id !== currentAssigned)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {tempLabel(x)}
                      </option>
                    ))}
                </Select>

                <Row>
                  <Button
                    $variant="primary"
                    onClick={() => setPendingAction("assign")}
                    disabled={busy || selectedTempId === ""}
                  >
                    Assign
                  </Button>
                </Row>
              </Section>

              <SectionDivider />

              <Section>
                <Muted>Currently assigned</Muted>

                <CurrentAssignmentBox>
                  <Muted>
                    {t ? `${t.firstName} ${t.lastName} (#${t.id})` : "Unassigned"}
                  </Muted>
                </CurrentAssignmentBox>

                <Row>
                  <Button
                    $variant="danger"
                    onClick={() => setPendingAction("unassign")}
                    disabled={busy || !t}
                  >
                    Unassign
                  </Button>
                </Row>
              </Section>
            </TwoCol>

            <Spacer h={10} />
            <Muted>
              Note: assignment is sent via <strong>PATCH /jobs/{job.id}</strong>.
            </Muted>
          </Card>
        </Grid>
      </div>

      <ConfirmDialog
        open={pendingAction === "assign"}
        title="Confirm assignment"
        message={
          selectedTemp
            ? `Assign ${fullTempName(selectedTemp)} to ${displayName(job)}?`
            : "No temp selected."
        }
        confirmLabel="Confirm"
        confirmVariant="primary"
        busy={false}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void assignTemp()}
      />

      <ConfirmDialog
        open={pendingAction === "unassign"}
        title="Confirm unassignment"
        message={
          t
            ? `Unassign ${fullTempName(t)} from ${displayName(job)}?`
            : "No assigned temp found."
        }
        confirmLabel="Unassign"
        confirmVariant="danger"
        busy={false}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void unassignTemp()}
      />

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
}
