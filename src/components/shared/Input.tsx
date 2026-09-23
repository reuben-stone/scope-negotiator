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

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: InputProps) {
  return (
    <input
      className={`${styles.input} ${className || ""}`}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  large?: boolean;
};

export function Textarea({ large, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={`${large ? styles.textareaLarge : styles.textarea} ${className || ""}`}
      {...props}
    />
  );
}
