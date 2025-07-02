import { z } from "zod";

// Zod schemas for validation
export const BitWardenAuthResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string().optional(),
  refresh_token: z.string().optional(),
});

export const BitWardenFolderSchema = z.object({
  id: z.string().nullable(),
  name: z.string(),
  object: z.literal("folder"),
});

export const BitWardenFieldSchema = z.object({
  name: z.string(),
  value: z.string(),
  type: z.number(),
  //   linkedId: z.number().nullable(),
});

export const BitWardenUriSchema = z.object({
  uri: z.string(),
  match: z.number().nullable(),
});

export const BitWardenLoginSchema = z.object({
  username: z.string().nullable(),
  password: z.string().nullable(),
  totp: z.string().nullable(),
  passwordRevisionDate: z.string().nullable(),
  uris: z.array(BitWardenUriSchema).nullable(),
});

export const BitWardenSecureNoteSchema = z.object({
  type: z.number(),
});

export const BitWardenCardSchema = z.object({
  cardholderName: z.string().nullable(),
  brand: z.string().nullable(),
  number: z.string().nullable(),
  expMonth: z.string().nullable(),
  expYear: z.string().nullable(),
  code: z.string().nullable(),
});

export const BitWardenIdentitySchema = z.object({
  title: z.string().nullable(),
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  address1: z.string().nullable(),
  address2: z.string().nullable(),
  address3: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postalCode: z.string().nullable(),
  country: z.string().nullable(),
  company: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  ssn: z.string().nullable(),
  username: z.string().nullable(),
  passportNumber: z.string().nullable(),
  licenseNumber: z.string().nullable(),
});

export const BitWardenItemSchema = z.object({
  id: z.string(),
  organizationId: z.string().nullable(),
  folderId: z.string().nullable(),
  type: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), // 1: Login, 2: Secure Note, 3: Card, 4: Identity
  name: z.string(),
  notes: z.string().nullable(),
  favorite: z.boolean(),
  fields: z.array(BitWardenFieldSchema).optional(),
  login: BitWardenLoginSchema.optional(),
  secureNote: BitWardenSecureNoteSchema.optional(),
  card: BitWardenCardSchema.optional(),
  identity: BitWardenIdentitySchema.optional(),
  attachments: z.array(z.any()).optional(),
  revisionDate: z.string(),
  creationDate: z.string(),
  deletedDate: z.string().nullable(),
  object: z.literal("item"),
});

export const BitWardenListResponseSchema = <T extends z.ZodType>(
  itemSchema: T
): z.ZodObject<{
  object: z.ZodLiteral<"list">;
  data: z.ZodArray<T>;
}> =>
  z.object({
    object: z.literal("list"),
    data: z.array(itemSchema),
  });

// Type exports for use in other files
export type BitWardenAuthResponse = z.infer<typeof BitWardenAuthResponseSchema>;
export type BitWardenFolder = z.infer<typeof BitWardenFolderSchema>;
export type BitWardenItem = z.infer<typeof BitWardenItemSchema>;
export type BitWardenField = z.infer<typeof BitWardenFieldSchema>;
export type BitWardenLogin = z.infer<typeof BitWardenLoginSchema>;
export type BitWardenUri = z.infer<typeof BitWardenUriSchema>;
export type BitWardenSecureNote = z.infer<typeof BitWardenSecureNoteSchema>;
export type BitWardenCard = z.infer<typeof BitWardenCardSchema>;
export type BitWardenIdentity = z.infer<typeof BitWardenIdentitySchema>;
export type BitWardenListResponse<T> = z.infer<
  ReturnType<typeof BitWardenListResponseSchema<z.ZodType<T>>>
>;
