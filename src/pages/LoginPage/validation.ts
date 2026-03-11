import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
