import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/endpoints";
import { getErrorMessage } from "../../api/getErrorMessage";
import type { TempUpdate } from "../../api/types";
import {
  Button,
  Card,
  ErrorText,
  H1,
  Input,
  Muted,
  Row,
  Spacer,
} from "../../components/Primitives";
import { queryKeys } from "../../query/queryKeys";

export function ProfilePage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<TempUpdate>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    managerId: null,
  });
  const [success, setSuccess] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.getProfile(),
  });

  const saveProfileMutation = useMutation({
    mutationFn: (payload: TempUpdate) => api.patchProfile(payload),
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setForm({
      firstName: profileQuery.data.firstName,
      lastName: profileQuery.data.lastName,
      email: profileQuery.data.email,
      password: "",
      managerId: profileQuery.data.managerId,
    });
  }, [profileQuery.data]);

  const busy = profileQuery.isFetching;
  const saving = saveProfileMutation.isPending;

  const error = saveProfileMutation.error
    ? getErrorMessage(saveProfileMutation.error, "Failed to update profile")
    : profileQuery.error
      ? getErrorMessage(profileQuery.error, "Failed to load profile")
      : null;

  async function save() {
    setSuccess(null);

    const payload: TempUpdate = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      managerId: form.managerId,
    };

    if (form.password && form.password.trim()) {
      payload.password = form.password;
    }

    try {
      const updated = await saveProfileMutation.mutateAsync(payload);

      queryClient.setQueryData(queryKeys.profile, updated);

      setForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        password: "",
        managerId: updated.managerId,
      });

      setSuccess("Profile updated.");
    } catch {
    }
  }

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <div>
          <H1>Profile</H1>
          <Muted>View and update your account details.</Muted>
        </div>
        <Row>
          <Button
            onClick={() => {
              setSuccess(null);
              void profileQuery.refetch();
            }}
            disabled={busy || saving}
          >
            {busy ? "Refreshing..." : "Refresh"}
          </Button>
        </Row>
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

      {success ? (
        <>
          <Card>
            <Muted>{success}</Muted>
          </Card>
          <Spacer h={12} />
        </>
      ) : null}

      <Card>
        <Row>
          <div style={{ flex: 1, minWidth: 240 }}>
            <Muted>First name</Muted>
            <Spacer h={6} />
            <Input
              value={form.firstName ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
              disabled={busy || saving}
            />
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <Muted>Last name</Muted>
            <Spacer h={6} />
            <Input
              value={form.lastName ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
              disabled={busy || saving}
            />
          </div>
        </Row>

        <Spacer h={12} />

        <div>
          <Muted>Email</Muted>
          <Spacer h={6} />
          <Input
            type="email"
            value={form.email ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={busy || saving}
          />
        </div>

        <Spacer h={12} />

        <div>
          <Muted>New password</Muted>
          <Spacer h={6} />
          <Input
            type="password"
            value={form.password ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="Leave blank to keep current password"
            disabled={busy || saving}
          />
        </div>

        <Spacer h={16} />

        <Row>
          <Button onClick={() => void save()} disabled={busy || saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </Row>
      </Card>
    </div>
  );
}
