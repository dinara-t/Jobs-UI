import { Link } from "react-router-dom";
import { Button, Card, H1, Muted, Spacer } from "../../components/Primitives";

export function NotFoundPage() {
  return (
    <Card>
      <H1>Not found</H1>
      <Muted>This route doesn’t exist.</Muted>
      <Spacer h={12} />
      <Button as={Link as any} to="/">
        Go home
      </Button>
    </Card>
  );
}
