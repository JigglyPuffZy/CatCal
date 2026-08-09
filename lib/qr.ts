/** Extract cat id from a CatCal QR payload (e.g. catcal://cat/cat-123). */
export function parseCatQrPayload(data: string): string | null {
  const trimmed = data.trim();
  if (!trimmed) return null;

  const deepLink = trimmed.match(/^catcal:\/\/cat\/([^/?#\s]+)/i);
  if (deepLink?.[1]) return decodeURIComponent(deepLink[1]);

  return null;
}

export function buildCatQrPayload(catId: string): string {
  return `catcal://cat/${catId}`;
}
