import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
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
  const [pageData, setPageData] = useState<PageResponse<Temp>>(emptyPage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"id" | "name" | "jobCount">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const size = 10;

  async function load() {
    setBusy(true);
    setError(null);

    try {
      const data = await api.listTemps({
        sortBy,
        sortDir,
        page,
        size,
      });
      setPageData(data);
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Failed to load temps");
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setPage(0);
  }, [sortBy, sortDir]);

  useEffect(() => {
    void load();
  }, [sortBy, sortDir, page]);

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

          <Button onClick={load} disabled={busy}>
            {busy ? "Refreshing..." : "Refresh"}
          </Button>
        </Row>
      </Row>

      <Spacer h={16} />

      <Muted>
        {busy ? "Loading temps..." : `Showing ${pageData.totalItems} temps`}
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

      {!busy && pageData.items.length === 0 ? (
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