import { useWorkflow } from "@/state/context";
import { Button } from "@/components/shared/Button";
import { Textarea } from "@/components/shared/Input";
import styles from "./ClarifyScreen.module.css";

export function ClarifyScreen() {
  const { state, dispatch, submitAnswersAndNegotiate } = useWorkflow();
  const questions = state.analysis?.questions ?? [];

  const answeredCount = questions.filter((q) => q.answer?.trim()).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className={styles.screen}>
      <h2 className={styles.heading}>
        I need {questions.length} answer{questions.length !== 1 ? "s" : ""}{" "}
        before this scope is credible.
      </h2>
      <p className={styles.subheading}>
        These questions could materially change what ships. Skip them and the
        scope stays ambiguous.
      </p>

      <div className={styles.questions}>
        {questions.map((q, i) => (
          <div key={q.id} className={styles.question}>
            <div className={styles.questionHeader}>
              <p className={styles.questionNumber}>
                Question {i + 1} of {questions.length}
              </p>
              <p className={styles.questionText}>{q.question}</p>
              <p className={styles.questionWhy}>
                <span className={styles.whyLabel}>Why it matters: </span>
                {q.whyItMatters}
              </p>
            </div>
            <div className={styles.questionBody}>
              <Textarea
                id={`question-${q.id}`}
                value={q.answer ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "ANSWER_QUESTION",
                    questionId: q.id,
                    answer: e.target.value,
                  })
                }
                placeholder="Your answer..."
                aria-label={`Answer to: ${q.question}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          onClick={submitAnswersAndNegotiate}
          disabled={!allAnswered}
        >
          Renegotiate →
        </Button>
      </div>
    </div>
  );
}
