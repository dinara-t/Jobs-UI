import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import type { Temp } from "../../../api/types";
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

export function TempsPage() {
  const [temps, setTemps] = useState<Temp[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const data = await api.listTemps();
      setTemps(data);
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
    load();
  }, []);

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <div>
          <H1>Temps</H1>
          <Muted>View temps and their assigned jobs.</Muted>
        </div>
        <Button onClick={load} disabled={busy}>
          {busy ? "Refreshing..." : "Refresh"}
        </Button>
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
        {temps.map((t) => (
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

      {!busy && temps.length === 0 ? (
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
