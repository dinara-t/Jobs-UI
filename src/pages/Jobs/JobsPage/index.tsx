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
  ErrorText,
  H1,
  H2,
  Muted,
  Row,
  Select,
  Spacer,
} from "../../../components/Primitives";
import { queryKeys } from "../../../query/queryKeys";

const List = styled.div`
  display: grid;
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

const JobLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

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
  const [assignedFilter, setAssignedFilter] = useState<"all" | "unassigned" | "assigned">("all");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    setPage(0);
  }, [assignedFilter, sortBy, sortDir]);

  const params = useMemo(
    () => ({
      assigned:
        assignedFilter === "all"
          ? undefined
          : assignedFilter === "assigned",
      sortBy,
      sortDir,
      page,
      size,
    }),
    [assignedFilter, sortBy, sortDir, page],
  );

  const jobsQuery = useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: () => api.getJobs(params),
    placeholderData: keepPreviousData,
  });

  const pageData = jobsQuery.data ?? emptyPage;
  const busy = jobsQuery.isFetching;
  const error = jobsQuery.error
    ? getErrorMessage(jobsQuery.error, "Failed to load jobs")
    : null;

  return (
    <div>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <H1>Jobs</H1>
          <Muted>Browse jobs.</Muted>
        </div>

        <Row style={{ flexWrap: "wrap" }}>
          <div>
            <Muted>Filter</Muted>
            <Spacer h={6} />
            <Select
              value={assignedFilter}
              onChange={(e) =>
                setAssignedFilter(e.target.value as "all" | "unassigned" | "assigned")
              }
            >
              <option value="all">All visible jobs</option>
              <option value="unassigned">Unassigned only</option>
              <option value="assigned">Assigned only</option>
            </Select>
          </div>

          <div>
            <Muted>Sort by</Muted>
            <Spacer h={6} />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "name")}
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
            </Select>
          </div>

          <div>
            <Muted>Direction</Muted>
            <Spacer h={6} />
            <Select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Select>
          </div>

          <div>
            <Muted>&nbsp;</Muted>
            <Spacer h={6} />
            <Button onClick={() => void jobsQuery.refetch()} disabled={busy}>
              {busy ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
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
        {pageData.items.map((job: Job) => (
          <Card key={job.id}>
            <H2 style={{ marginBottom: 6 }}>
              <JobTitle to={`/jobs/${job.id}`}>{job.name}</JobTitle>
            </H2>

            <JobLine>
              <Muted>Job ID: {job.id}</Muted>
              <Muted>
                Dates: {job.startDate} → {job.endDate}
              </Muted>
              <Muted>
                Assigned to:{" "}
                {job.temp ? `${job.temp.firstName} ${job.temp.lastName}` : "Unassigned"}
              </Muted>
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