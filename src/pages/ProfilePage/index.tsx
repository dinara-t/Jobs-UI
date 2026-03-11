import { useEffect, useState } from "react";
import { api } from "../../api/endpoints";
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

export function ProfilePage() {
  const [form, setForm] = useState<TempUpdate>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    managerId: null,
  });
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const profile = await api.getProfile();
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        password: "",
        managerId: profile.managerId,
      });
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Failed to load profile");
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: TempUpdate = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        managerId: form.managerId,
      };

      if (form.password && form.password.trim()) {
        payload.password = form.password;
      }

      const updated = await api.patchProfile(payload);

      setForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        password: "",
        managerId: updated.managerId,
      });

      setSuccess("Profile updated.");
    } catch (err: any) {
      const msg =
        typeof err?.body === "string"
          ? err.body
          : (err?.body?.message ?? "Failed to update profile");
      setError(msg);
    } finally {
      setSaving(false);
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
          <Button onClick={load} disabled={busy || saving}>
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
          <Button onClick={save} disabled={busy || saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </Row>
      </Card>
    </div>
  );
}
