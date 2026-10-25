import { z } from "zod";

// mirrors server/src/types/auth.types.ts
const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: emailSchema,
  password: z.string().min(8, "At least 8 characters").max(72, "At most 72 characters"),
});

export type LoginInput = z.input<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
