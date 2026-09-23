import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import styles from "./Input.module.css";

type FieldWrapperProps = {
  label: string;
  hint?: string;
  optional?: boolean;
  htmlFor: string;
  children: React.ReactNode;
};

export function FieldGroup({
  label,
  hint,
  optional,
  htmlFor,
  children,
}: FieldWrapperProps) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {optional && <span className={styles.optional}> — OPTIONAL</span>}
      </label>
      {hint && <p className={styles.hint}>{hint}</p>}
      {children}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "secondary";
};

export function TextInput({ variant = "default", className, ...props }: InputProps) {
  const cls = variant === "secondary" ? styles.inputSecondary : styles.input;
  return (
    <input
      className={`${cls} ${className || ""}`}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  large?: boolean;
};

export function Textarea({ large, className, ...props }: TextareaProps) {
  const cls = large ? styles.textareaLarge : styles.textarea;
  return (
    <textarea
      className={`${cls} ${className || ""}`}
      {...props}
    />
  );
}
