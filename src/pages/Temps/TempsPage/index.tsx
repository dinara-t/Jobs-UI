import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import type { PageResponse, Temp } from "../../../api/types";
import {
  Button,
  Card,
  ErrorText,
  H1,
  H2,
  Muted,
  Row,
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

const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
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
  const [page, setPage] = useState(0);
  const size = 10;

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const data = await api.listTemps({ page, size });
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
    void load();
  }, [page]);

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <div>
          <H1>Temps</H1>
          <Muted>Browse visible temps in your reporting tree.</Muted>
        </div>

        <Button onClick={load} disabled={busy}>
          {busy ? "Refreshing..." : "Refresh"}
        </Button>
      </Row>

      <Spacer h={16} />

      <Card>
        <Pager>
          <Muted>
            {busy
              ? "Loading temps..."
              : `Showing ${pageData.items.length} of ${pageData.totalItems} temps`}
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
    </div>
  );
}
