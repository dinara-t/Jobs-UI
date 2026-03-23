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
        const available = await api.listTemps({ jobId, page: 0, size: 100 });
        setTemps(available.items);
      } catch {
        const all = await api.listTemps({ page: 0, size: 100 });
        setTemps(all.items);
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

  async function assignTemp() {
    if (!job || selectedTempId === "") return;

    setBusy(true);
    setError(null);

    try {
      const updated = await api.patchJob(job.id, {
        tempId: Number(selectedTempId),
      });
      setJob(updated);
      setSelectedTempId("");
      await load();
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Failed to assign temp");
      setError(msg);
      setBusy(false);
    }
  }

  async function unassignTemp() {
    if (!job) return;

    setBusy(true);
    setError(null);

    try {
      const updated = await api.patchJob(job.id, { tempId: 0 });
      setJob(updated);
      setSelectedTempId("");
      await load();
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Failed to unassign temp");
      setError(msg);
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(jobId) || jobId <= 0) return;
    void load();
  }, [jobId]);

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
          <H2>Job details</H2>
          <Spacer h={10} />
          <Muted>Start date: {job.startDate}</Muted>
          <Spacer h={6} />
          <Muted>End date: {job.endDate}</Muted>
          <Spacer h={6} />
          <Muted>
            Assigned temp:{" "}
            {t ? `${t.firstName} ${t.lastName} (#${t.id})` : "Unassigned"}
          </Muted>
        </Card>

        <Card>
          <H2>Assignment</H2>
          <Spacer h={10} />

          <TwoCol>
            <div>
              <Muted>Assign temp</Muted>
              <Spacer h={6} />
              <Select
                value={selectedTempId}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedTempId(value === "" ? "" : Number(value));
                }}
                disabled={busy}
              >
                <option value="">Select a temp</option>
                {temps.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.firstName} {x.lastName} (#{x.id})
                  </option>
                ))}
              </Select>
            </div>

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
