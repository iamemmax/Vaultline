import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name").max(100),
  phone: z.string().min(7, "Enter a valid phone number").max(20),
  country: z.string().min(2, "Country is required"),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().url("Enter a valid image URL"),
});
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
