import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import type { Job, PageResponse } from "../../../api/types";
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

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

function displayName(job: Job) {
  return job.title ?? job.name ?? `Job #${job.id}`;
}

function assignedName(job: Job) {
  const t = job.assignedTemp ?? job.temp;
  if (!t) return "Unassigned";
  return `${t.firstName} ${t.lastName}`;
}

const emptyPage: PageResponse<Job> = {
  items: [],
  page: 0,
  size: 10,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

export function JobsPage() {
  const [pageData, setPageData] = useState<PageResponse<Job>>(emptyPage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignedFilter, setAssignedFilter] = useState<
    "all" | "assigned" | "unassigned"
  >("all");
  const [page, setPage] = useState(0);
  const size = 10;

  const assignedParam = useMemo(() => {
    if (assignedFilter === "all") return undefined;
    return assignedFilter === "assigned";
  }, [assignedFilter]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const data = await api.listJobs({
        assigned: assignedParam,
        page,
        size,
      });
      setPageData(data);
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
    setPage(0);
  }, [assignedParam]);

  useEffect(() => {
    void load();
  }, [assignedParam, page]);

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <div>
          <H1>Jobs</H1>
          <Muted>Browse jobs.</Muted>
        </div>

        <div style={{ minWidth: 220 }}>
          <Muted>Filter</Muted>
          <Spacer h={6} />
          <Select
            value={assignedFilter}
            onChange={(e) =>
              setAssignedFilter(
                e.target.value as "all" | "assigned" | "unassigned",
              )
            }
            disabled={busy}
          >
            <option value="all">All visible jobs</option>
            <option value="assigned">Assigned only</option>
            <option value="unassigned">Unassigned only</option>
          </Select>
        </div>
      </Row>

      <Spacer h={16} />

      <Card>
        <Pager>
          <Muted>
            {busy
              ? "Loading jobs..."
              : `Showing ${pageData.items.length} of ${pageData.totalItems} jobs`}
          </Muted>

          <Row>
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={busy || !pageData.hasPrevious}
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={busy || !pageData.hasNext}
            >
              Next
            </Button>
          </Row>
        </Pager>

        <Spacer h={8} />
        <Muted>
          Page {pageData.totalPages === 0 ? 0 : pageData.page + 1} of{" "}
          {pageData.totalPages}
        </Muted>
      </Card>

      {error ? (
        <>
          <Spacer h={12} />
          <Card>
            <ErrorText>{error}</ErrorText>
          </Card>
        </>
      ) : null}

      <Spacer h={12} />

      <List>
        {pageData.items.map((job) => (
          <Card key={job.id}>
            <JobLine>
              <div>
                <H2 style={{ marginBottom: 6 }}>
                  <JobTitle to={`/jobs/${job.id}`}>{displayName(job)}</JobTitle>
                </H2>
                <Muted>
                  Dates: {job.startDate} → {job.endDate}
                </Muted>
                <Spacer h={4} />
                <Muted>Assigned: {assignedName(job)}</Muted>
              </div>

              <Button as={Link as any} to={`/jobs/${job.id}`}>
                View
              </Button>
            </JobLine>
          </Card>
        ))}
      </List>

      {!busy && pageData.items.length === 0 ? (
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
