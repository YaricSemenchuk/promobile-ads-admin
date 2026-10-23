import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { Button, TextInput } from "../../components/ui";
import styles from "./styles.module.scss";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ok = await login(email, password);
      if (!ok) throw new Error();
      navigate("/revenue", { replace: true });
    } catch {
      setError("Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>Promobile Admin</h1>
        <TextInput
          block
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <TextInput
          block
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className={styles.error}>{error}</div>}
        <Button variant="primary" block type="submit" disabled={submitting} className={styles.submit}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
