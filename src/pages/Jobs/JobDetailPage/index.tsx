import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import type { Job, Temp } from "../../../api/types";
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

const TwoCol = styled.div`
  display: grid;
  gap: 12px;
`;

function displayName(job: Job) {
  return job.title ?? job.name ?? `Job #${job.id}`;
}

function assigned(job: Job) {
  return job.assignedTemp ?? job.temp;
}

export function JobDetailPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const nav = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [temps, setTemps] = useState<Temp[]>([]);
  const [selectedTempId, setSelectedTempId] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAssigned = useMemo(() => {
    const t = job ? assigned(job) : null;
    return t?.id ?? null;
  }, [job]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const j = await api.getJob(jobId);
      setJob(j);

      try {
        const available = await api.listTemps(jobId);
        setTemps(available);
      } catch {
        const all = await api.listTemps();
        setTemps(all);
      }
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Failed to load job");
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(jobId) || jobId <= 0) return;
    load();
  }, [jobId]);

  useEffect(() => {
    if (currentAssigned) setSelectedTempId(currentAssigned);
    else setSelectedTempId("");
  }, [currentAssigned]);

  async function assignTemp() {
    if (selectedTempId === "" || !job) return;
    setBusy(true);
    setError(null);
    try {
      const usesAssignedTempId = job.assignedTemp !== undefined;
      const patch = usesAssignedTempId
        ? { assignedTempId: selectedTempId }
        : { tempId: selectedTempId };
      const updated = await api.patchJob(jobId, patch as any);
      setJob(updated);
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Assign failed");
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function unassignTemp() {
    if (!job) return;
    setBusy(true);
    setError(null);
    try {
      const usesAssignedTempId = job.assignedTemp !== undefined;
      const patch = usesAssignedTempId
        ? { assignedTempId: null }
        : { tempId: 0 };
      const updated = await api.patchJob(jobId, patch as any);
      setJob(updated);
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Unassign failed");
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!job && error) {
    return (
      <Card>
        <ErrorText>{error}</ErrorText>
        <Spacer h={10} />
        <Button as={Link as any} to="/jobs">
          Back to Jobs
        </Button>
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
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <div>
          <H1>{displayName(job)}</H1>
          <Muted>
            Job ID: {job.id} • Assigned:{" "}
            <strong>{t ? `${t.firstName} ${t.lastName}` : "Unassigned"}</strong>
          </Muted>
        </div>
        <Row>
          <Button onClick={() => nav("/jobs")}>Back</Button>
          <Button onClick={load} disabled={busy}>
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
          <H2>Details</H2>
          {job.startDate && job.endDate ? (
            <>
              <Muted>
                Dates: {job.startDate} → {job.endDate}
              </Muted>
              <Spacer h={8} />
            </>
          ) : null}

          {job.client || job.location ? (
            <>
              <Muted>{job.client ? `Client: ${job.client}` : null}</Muted>
              <Muted>{job.location ? `Location: ${job.location}` : null}</Muted>
              <Spacer h={8} />
            </>
          ) : null}

          {job.description ? <Muted>{job.description}</Muted> : null}
        </Card>

        <Card>
          <H2>Assign temp</H2>
          <Muted>
            Select an available temp (if the API supports availability
            filtering).
          </Muted>
          <Spacer h={10} />

          <TwoCol>
            <Select
              value={selectedTempId}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedTempId(v === "" ? "" : Number(v));
              }}
            >
              <option value="">Unassigned</option>
              {temps.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.firstName} {x.lastName} (#{x.id})
                </option>
              ))}
            </Select>

            <Row style={{ justifyContent: "space-between" }}>
              <Button
                $variant="primary"
                onClick={assignTemp}
                disabled={busy || selectedTempId === ""}
              >
                Assign
              </Button>
              <Button
                $variant="danger"
                onClick={unassignTemp}
                disabled={busy || !t}
              >
                Unassign
              </Button>
            </Row>
          </TwoCol>

          <Spacer h={10} />
          <Muted>
            Note: assignment is sent via <strong>PATCH /jobs/{job.id}</strong>.
          </Muted>
        </Card>
      </Grid>
    </div>
  );
}
