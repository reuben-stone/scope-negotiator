import type { ScopeItem, ScopeClassification } from "@/types/domain";
import { useWorkflow } from "@/state/context";
import { Button } from "@/components/shared/Button";
import styles from "./NegotiateScreen.module.css";

const COLUMNS: {
  key: ScopeClassification;
  label: string;
  headerClass: string;
}[] = [
  { key: "ship", label: "Ship", headerClass: styles.columnHeaderShip },
  {
    key: "negotiate",
    label: "Negotiate",
    headerClass: styles.columnHeaderNegotiate,
  },
  { key: "cut", label: "Cut", headerClass: styles.columnHeaderCut },
];

const COLUMN_ORDER: Record<ScopeClassification, number> = {
  ship: 0,
  negotiate: 1,
  cut: 2,
};

const MOVE_TARGETS: Record<ScopeClassification, ScopeClassification[]> = {
  ship: ["negotiate", "cut"],
  negotiate: ["ship", "cut"],
  cut: ["ship", "negotiate"],
};

function ScopeCard({
  item,
  onMove,
}: {
  item: ScopeItem;
  onMove: (to: ScopeClassification) => void;
}) {
  const targets = MOVE_TARGETS[item.currentClassification];

  return (
    <div className={item.userOverride ? styles.cardOverride : styles.card}>
      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>{item.title}</h4>
        <p className={styles.cardDescription}>{item.description}</p>
        <div className={styles.cardMeta}>
          <span className={styles.badge}>
            Effort: {item.effort.toUpperCase()}
          </span>
          <span className={styles.badge}>
            Risk: {item.risk.toUpperCase()}
          </span>
          {item.userOverride && (
            <span className={styles.overrideBadge}>User Override</span>
          )}
        </div>
      </div>
      <div className={styles.cardActions}>
        {targets.map((target) => (
          <button
            key={target}
            className={styles.moveButton}
            onClick={() => onMove(target)}
            aria-label={`Move "${item.title}" to ${target}`}
          >
            {COLUMN_ORDER[target] < COLUMN_ORDER[item.currentClassification] ? "←" : "→"} {target}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NegotiateScreen() {
  const { state, dispatch, moveScopeItem, lockScope } = useWorkflow();
  const items = state.proposal?.items ?? [];

  const overrideCount = items.filter((i) => i.userOverride).length;

  return (
    <div className={styles.screen}>
      {/* Local nav */}
      <div className={styles.localNav}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => dispatch({ type: "BACK_TO_CLARIFY" })}
        >
          ← Back
        </button>
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading}>
          {items.length} items. Your call.
        </h2>
        <p className={styles.subheading}>
          AI recommended this breakdown. Move items between columns to override.
          {overrideCount > 0 &&
            ` ${overrideCount} override${overrideCount !== 1 ? "s" : ""} applied.`}
        </p>

        <div className={styles.board}>
          {COLUMNS.map((col) => {
            const colItems = items.filter(
              (i) => i.currentClassification === col.key
            );
            return (
              <div key={col.key} className={styles.column}>
                <div className={col.headerClass}>
                  <span className={styles.columnLabel}>{col.label}</span>
                  <span className={styles.columnCount}>{colItems.length}</span>
                </div>
                <div className={styles.columnBody}>
                  {colItems.length === 0 ? (
                    <p className={styles.empty}>Empty</p>
                  ) : (
                    colItems.map((item) => (
                      <ScopeCard
                        key={item.id}
                        item={item}
                        onMove={(to) => moveScopeItem(item.id, to)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={lockScope}>
          Lock Scope →
        </Button>
      </div>

    </div>
  );
}
