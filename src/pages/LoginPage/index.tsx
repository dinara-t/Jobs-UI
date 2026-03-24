import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styled from "styled-components";
import { useAuth } from "../../state/AuthContext";
import { getErrorMessage } from "../../api/getErrorMessage";
import {
  Card,
  H1,
  Input,
  Button,
  Spacer,
  ErrorText,
  Muted,
} from "../../components/Primitives";
import { loginSchema, type LoginFormData } from "./validation";

const Wrap = styled.div`
  max-width: 520px;
  margin: 40px auto;
`;

const Form = styled.form`
  display: grid;
  gap: 10px;
`;

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const to = (loc.state as { from?: string } | null)?.from ?? "/jobs";

  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    setBusy(true);

    try {
      await login({
        username: data.username,
        password: data.password,
      });
      nav(to, { replace: true });
    } catch (error) {
      setLoginError(getErrorMessage(error, "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrap>
      <H1>Login</H1>
      <Card>
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <Muted>Email</Muted>
            <Spacer h={6} />
            <Input
              {...register("username")}
              type="email"
              autoComplete="username"
              aria-invalid={errors.username ? "true" : "false"}
            />
            {errors.username ? (
              <>
                <Spacer h={4} />
                <ErrorText>{errors.username.message}</ErrorText>
              </>
            ) : null}
          </div>

          <div>
            <Muted>Password</Muted>
            <Spacer h={6} />
            <Input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password ? (
              <>
                <Spacer h={4} />
                <ErrorText>{errors.password.message}</ErrorText>
              </>
            ) : null}
          </div>

          {loginError ? (
            <>
              <Spacer h={4} />
              <ErrorText>{loginError}</ErrorText>
            </>
          ) : null}

          <Spacer h={6} />

          <Button $variant="primary" type="submit" disabled={busy || !isValid}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </Form>
      </Card>

      <Spacer h={12} />

      <Muted>
        Use a temp email and password from the seeded data, for example
        admin@example.com / admin12345.
      </Muted>
    </Wrap>
  );
}
