import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import { getErrorMessage } from "../../../api/getErrorMessage";
import type { Job, PageResponse } from "../../../api/types";
import { Pagination } from "../../../components/Pagination";
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
import { queryKeys } from "../../../query/queryKeys";

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
  const [assignedFilter, setAssignedFilter] = useState<
    "all" | "assigned" | "unassigned"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    setPage(0);
  }, [assignedFilter, sortBy, sortDir]);

  const assignedParam =
    assignedFilter === "all" ? undefined : assignedFilter === "assigned";

  const params = useMemo(
    () => ({
      assigned: assignedParam,
      sortBy,
      sortDir,
      page,
      size,
    }),
    [assignedParam, sortBy, sortDir, page],
  );

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: () => api.listJobs(params),
    placeholderData: keepPreviousData,
  });

  const pageData = jobsQuery.data ?? emptyPage;
  const busy = jobsQuery.isFetching;
  const error = jobsQuery.error
    ? getErrorMessage(jobsQuery.error, "Failed to load jobs")
    : null;

  return (
    <div>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <H1>Jobs</H1>
          <Muted>Browse jobs.</Muted>
        </div>

        <Row style={{ alignItems: "flex-end" }}>
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

          <div style={{ minWidth: 180 }}>
            <Muted>Sort by</Muted>
            <Spacer h={6} />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "name")}
              disabled={busy}
            >
              <option value="date">Date</option>
              <option value="name">Alphabetical</option>
            </Select>
          </div>

          <div style={{ minWidth: 160 }}>
            <Muted>Direction</Muted>
            <Spacer h={6} />
            <Select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
              disabled={busy}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Select>
          </div>

          <Button onClick={() => void jobsQuery.refetch()} disabled={busy}>
            {busy ? "Refreshing..." : "Refresh"}
          </Button>
        </Row>
      </Row>

      <Spacer h={16} />

      <Muted>
        {jobsQuery.isLoading ? "Loading jobs..." : `Showing ${pageData.totalItems} jobs`}
      </Muted>

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

      {!jobsQuery.isLoading && pageData.items.length === 0 ? (
        <>
          <Spacer h={14} />
          <Card>
            <Muted>No jobs returned by the API.</Muted>
          </Card>
        </>
      ) : null}

      <Spacer h={16} />

      <Pagination
        page={pageData.page}
        totalPages={pageData.totalPages}
        hasPrevious={pageData.hasPrevious}
        hasNext={pageData.hasNext}
        busy={busy}
        onPageChange={setPage}
      />
    </div>
  );
}
