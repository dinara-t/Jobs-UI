import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { api } from "../../../api/endpoints";
import { getErrorMessage } from "../../../api/getErrorMessage";
import type { TempWithJobs } from "../../../api/types";
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
import { queryKeys } from "../../../query/queryKeys";

const Jobs = styled.div`
  display: grid;
  gap: 10px;
`;

const JobLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: 800;

  &:hover {
    text-decoration: underline;
  }
`;

export function TempDetailPage() {
  const { id } = useParams();
  const tempId = Number(id);
  const validTempId = Number.isFinite(tempId) && tempId > 0;

  const tempQuery = useQuery<TempWithJobs>({
    queryKey: queryKeys.temp(tempId),
    queryFn: () => api.getTemp(tempId),
    enabled: validTempId,
  });

  const temp = tempQuery.data ?? null;
  const busy = tempQuery.isFetching;
  const error = tempQuery.error
    ? getErrorMessage(tempQuery.error, "Failed to load temp")
    : !validTempId
      ? "Invalid temp id"
      : null;

  if (!temp && error) {
    return (
      <Card>
        <ErrorText>{error}</ErrorText>
        <Spacer h={10} />
        <Button as={Link as any} to="/temps">
          Back to Temps
        </Button>
      </Card>
    );
  }

  if (!temp) {
    return (
      <Card>
        <Muted>Loading...</Muted>
      </Card>
    );
  }

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <div>
          <H1>
            {temp.firstName} {temp.lastName}
          </H1>
          <Muted>Temp ID: {temp.id}</Muted>
        </div>
        <Row>
          <Button as={Link as any} to="/temps">
            Back
          </Button>
          <Button onClick={() => void tempQuery.refetch()} disabled={busy}>
            {busy ? "Refreshing..." : "Refresh"}
          </Button>
        </Row>
      </Row>

      <Spacer h={16} />

      <Card>
        <H2>Assigned jobs</H2>
        <Spacer h={10} />
        <Jobs>
          {temp.jobs.length === 0 ? <Muted>No jobs assigned.</Muted> : null}
          {temp.jobs.map((j) => (
            <Card key={j.id}>
              <H2 style={{ marginBottom: 6 }}>
                <JobLink to={`/jobs/${j.id}`}>{j.name}</JobLink>
              </H2>
              <Muted>
                Dates: {j.startDate} → {j.endDate}
              </Muted>
            </Card>
          ))}
        </Jobs>
      </Card>
    </div>
  );
}
