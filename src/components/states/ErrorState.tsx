import { Button } from "@/components/shared/Button";
import styles from "./ErrorState.module.css";

type Props = {
  heading?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  heading = "Negotiation Interrupted.",
  message = "Your brief is safe. Try again.",
  onRetry,
}: Props) {
  return (
    <div className={styles.screen}>
      <div className={styles.container} role="alert">
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.message}>{message}</p>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>

    </div>
  );
}
