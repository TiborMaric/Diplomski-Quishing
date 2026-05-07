"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { hashFullName, encryptString, toBytea } from "@/lib/crypto";
import { getServiceClient } from "@/lib/supabase/server";

export type FormState = {
  errors?: {
    firstName?: string;
    lastName?: string;
    form?: string;
  };
};

// Croatian-friendly: Latin letters with diacritics, spaces, hyphens, apostrophes.
// Must start with a letter (not a separator) to avoid " M".
const nameRegex = /^[A-Za-zČĆĐŠŽčćđšž][A-Za-zČĆĐŠŽčćđšž\s\-']*$/;

const NameSchema = z
  .string()
  .trim()
  .min(2, { message: "errors.tooShort" })
  .max(60, { message: "errors.tooLong" })
  .regex(nameRegex, { message: "errors.invalidChars" });

const SubmitSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
});

const SIXTY_DAYS_SECONDS = 60 * 60 * 24 * 60;

export async function submitEntry(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Honeypot — if filled, pretend success without writing anything.
  const honeypot = formData.get("tvrtka");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    redirect("/debrief");
  }

  // 2. Validate input (returns Croatian error keys if invalid).
  const parsed = SubmitSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      errors: {
        firstName: fieldErrors.firstName?.[0],
        lastName: fieldErrors.lastName?.[0],
      },
    };
  }

  const { firstName, lastName } = parsed.data;

  // 3. Read or generate session_token.
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get("qsh_session")?.value;
  if (!sessionToken) {
    sessionToken = randomUUID();
    cookieStore.set({
      name: "qsh_session",
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SIXTY_DAYS_SECONDS,
    });
  }

  // 4. Compute pseudonym + encrypted blobs and insert.
  const fullNameHash = hashFullName(firstName, lastName);
  const firstNameEnc = encryptString(firstName);
  const lastNameEnc = encryptString(lastName);

  const supabase = getServiceClient();
  const { error } = await supabase.from("form_submissions").insert({
    session_token: sessionToken,
    full_name_hash: fullNameHash,
    first_name_enc: toBytea(firstNameEnc),
    last_name_enc: toBytea(lastNameEnc),
  });

  if (error) {
    // Bubble to error boundary — dropped data points are worse than a visible error.
    throw new Error(`form_submissions insert failed: ${error.message}`);
  }

  // 5. Redirect (303 See Other — prevents back-button POST replay).
  redirect("/debrief");
}
