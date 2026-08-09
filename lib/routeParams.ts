/** Normalize Expo Router search params (string | string[] | undefined). */
export function getRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value[0] : value;
}
