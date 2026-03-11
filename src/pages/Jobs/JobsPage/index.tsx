import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import type { Job } from "../../../api/types";
import {
  Button,
  Card,
  H1,
  H2,
  Muted,
  Row,
  Spacer,
  Select,
  ErrorText,
} from "../../../components/Primitives";

const List = styled.div`
  display: grid;
  gap: 12px;
`;

const JobLine = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const JobTitle = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }
`;

function displayName(job: Job) {
  return job.title ?? job.name ?? `Job #${job.id}`;
}

function assignedName(job: Job) {
  const t = job.assignedTemp ?? job.temp;
  if (!t) return "Unassigned";
  return `${t.firstName} ${t.lastName}`;
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedFilter, setAssignedFilter] = useState<
    "all" | "assigned" | "unassigned"
  >("all");

  const assignedParam = useMemo(() => {
    if (assignedFilter === "all") return undefined;
    return assignedFilter === "assigned";
  }, [assignedFilter]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const data = await api.listJobs(assignedParam);
      setJobs(data);
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Failed to load jobs");
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [assignedParam]);

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <div>
          <H1>Jobs</H1>
          <Muted>
            Browse jobs. The API controls which jobs you’re allowed to see.
          </Muted>
        </div>
        <Row>
          <div style={{ minWidth: 220 }}>
            <Select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
            </Select>
          </div>
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

      <List>
        {jobs.map((j) => (
          <Card key={j.id}>
            <JobLine>
              <div style={{ minWidth: 0 }}>
                <H2 style={{ marginBottom: 6 }}>
                  <JobTitle to={`/jobs/${j.id}`}>{displayName(j)}</JobTitle>
                </H2>
                <Muted>
                  Assigned: <strong>{assignedName(j)}</strong>
                </Muted>
                {j.startDate && j.endDate ? (
                  <>
                    <Spacer h={6} />
                    <Muted>
                      Dates: {j.startDate} → {j.endDate}
                    </Muted>
                  </>
                ) : null}
                {j.client || j.location ? (
                  <>
                    <Spacer h={6} />
                    <Muted>
                      {j.client ? `Client: ${j.client}` : null}
                      {j.client && j.location ? " • " : null}
                      {j.location ? `Location: ${j.location}` : null}
                    </Muted>
                  </>
                ) : null}
              </div>
              <Button as={Link as any} to={`/jobs/${j.id}`}>
                Open
              </Button>
            </JobLine>
          </Card>
        ))}
      </List>

      {!busy && jobs.length === 0 ? (
        <>
          <Spacer h={14} />
          <Card>
            <Muted>No jobs returned by the API.</Muted>
          </Card>
        </>
      ) : null}
    </div>
  );
}
