// 같은 기사를 같은 URL로 보기 위해 쿼리스트링(utm_* 포함)·해시·끝 슬래시를 없앤다.
export function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.search = "";
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}
