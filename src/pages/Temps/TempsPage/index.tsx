import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import { getErrorMessage } from "../../../api/getErrorMessage";
import type { PageResponse, Temp } from "../../../api/types";
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

const TempTitle = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }
`;

const emptyPage: PageResponse<Temp> = {
  items: [],
  page: 0,
  size: 10,
  totalItems: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

export function TempsPage() {
  const [sortBy, setSortBy] = useState<"id" | "name" | "jobCount">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    setPage(0);
  }, [sortBy, sortDir]);

  const params = useMemo(
    () => ({
      sortBy,
      sortDir,
      page,
      size,
    }),
    [sortBy, sortDir, page],
  );

  const tempsQuery = useQuery({
    queryKey: queryKeys.temps(params),
    queryFn: () => api.listTemps(params),
    placeholderData: keepPreviousData,
  });

  const pageData = tempsQuery.data ?? emptyPage;
  const busy = tempsQuery.isFetching;
  const error = tempsQuery.error
    ? getErrorMessage(tempsQuery.error, "Failed to load temps")
    : null;

  return (
    <div>
      <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <H1>Temps</H1>
          <Muted>Browse visible temps in your reporting tree.</Muted>
        </div>

        <Row style={{ alignItems: "flex-end" }}>
          <div style={{ minWidth: 180 }}>
            <Muted>Sort by</Muted>
            <Spacer h={6} />
            <Select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "id" | "name" | "jobCount")
              }
              disabled={busy}
            >
              <option value="name">Alphabetical</option>
              <option value="id">ID</option>
              <option value="jobCount">Jobs taken</option>
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

          <Button onClick={() => void tempsQuery.refetch()} disabled={busy}>
            {busy ? "Refreshing..." : "Refresh"}
          </Button>
        </Row>
      </Row>

      <Spacer h={16} />

      <Muted>
        {tempsQuery.isLoading ? "Loading temps..." : `Showing ${pageData.totalItems} temps`}
      </Muted>

      {error ? (
        <>
          <Spacer h={12} />
          <Card>
            <ErrorText>{error}</ErrorText>
          </Card>
          <Spacer h={12} />
        </>
      ) : null}

      <Spacer h={12} />

      <List>
        {pageData.items.map((t) => (
          <Card key={t.id}>
            <H2 style={{ marginBottom: 6 }}>
              <TempTitle to={`/temps/${t.id}`}>
                {t.firstName} {t.lastName}
              </TempTitle>
            </H2>
            <Muted>Temp ID: {t.id}</Muted>
            <Spacer h={4} />
            <Muted>Jobs taken: {t.jobCount ?? 0}</Muted>
          </Card>
        ))}
      </List>

      {!tempsQuery.isLoading && pageData.items.length === 0 ? (
        <>
          <Spacer h={14} />
          <Card>
            <Muted>No temps returned by the API.</Muted>
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
