import { useState, useEffect } from "react";
import styles from "./AiStatus.module.css";

type Status = "checking" | "connected" | "disconnected";

export function AiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.ai ? "connected" : "disconnected"))
      .catch(() => setStatus("disconnected"));
  }, []);

  if (status === "checking") return null;

  return (
    <span className={styles.status}>
      <span
        className={
          status === "connected" ? styles.dotConnected : styles.dotDisconnected
        }
        aria-hidden="true"
      />
      {status === "connected" ? "AI Online" : "AI Offline"}
    </span>
  );
}
