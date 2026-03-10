import { z } from "zod";
import { emailRegex, usernameRegex } from "./regex";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .regex(emailRegex, "Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(50, "Password must be less than 50 characters");

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(
    usernameRegex,
    "Username can only contain lowercase letters, numbers, _ and .",
  );
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ILoginForm = z.infer<typeof loginSchema>;
export type ISignupForm = z.infer<typeof signupSchema>;

/**
 * Validate a zod schema and show first error via toast.
 * Returns true if valid, false if invalid.
 */
