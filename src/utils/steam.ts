export interface SteamModStats {
  publishedfileid: string;
  subscriptions: number;
  favorited: number;
  views: number;
  time_updated: number;
}

export async function getSteamWorkshopStats(
  workshopIds: (string | undefined)[],
): Promise<Record<string, SteamModStats>> {
  const validIds = workshopIds.filter((id): id is string => Boolean(id));
  if (validIds.length === 0) return {};

  const body = new URLSearchParams();
  body.append("itemcount", validIds.length.toString());
  validIds.forEach((id, idx) => {
    body.append(`publishedfileids[${idx}]`, id);
  });

  try {
    const res = await fetch(
      "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
    );
    const data = await res.json();
    const details = data?.response?.publishedfiledetails ?? [];

    return Object.fromEntries(
      details
        .filter((item: any) => item.result === 1)
        .map((item: any) => [
          item.publishedfileid,
          {
            publishedfileid: item.publishedfileid,
            subscriptions: item.subscriptions ?? 0,
            favorited: item.favorited ?? 0,
            views: item.views ?? 0,
            time_updated: item.time_updated ?? 0,
          },
        ]),
    );
  } catch (err) {
    console.error("Failed to fetch Steam Workshop stats:", err);
    return {};
  }
}