import { type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost";
  size?: "default" | "small";
};

export function Button({
  variant = "default",
  size = "default",
  className,
  ...props
}: Props) {
  const classes = [
    styles.button,
    variant !== "default" && styles[variant],
    size !== "default" && styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...props} />;
}
