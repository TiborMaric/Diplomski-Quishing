/**
 * Tiny typed message reader.
 *
 * All UI strings live in `messages/hr.json`. Look them up with `t("a.b.c")`.
 * If the key is missing, the key itself is returned (so missing strings are
 * visible during development rather than silently empty).
 *
 * Sprint 0: synchronous, dictionary-only. No pluralisation, no interpolation.
 * If we need ICU MessageFormat or runtime locale switching later, swap this
 * out — call sites just use `t()`.
 */

import hr from "@/messages/hr.json";

type Messages = typeof hr;

type DotKey<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? DotKey<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type MessageKey = DotKey<Messages>;

// Two overloads: typed `MessageKey` for static call sites (autocomplete +
// type safety on the keys defined in hr.json) and `string` for dynamic
// lookups where the key is built at runtime (e.g. validation error keys
// returned from a Server Action).
export function t(key: MessageKey): string;
export function t(key: string): string;
export function t(key: string): string {
  const parts = key.split(".");
  let cursor: unknown = hr;
  for (const part of parts) {
    if (
      cursor !== null &&
      typeof cursor === "object" &&
      part in (cursor as Record<string, unknown>)
    ) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof cursor === "string" ? cursor : key;
}
