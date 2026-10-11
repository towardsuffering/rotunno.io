/**
 * Advertising configuration.
 *
 * Ads stay off until `provider` is "adsense" and `client` + the slot ids are filled in.
 * While off, `pnpm dev` shows labelled placeholders so you can judge placement;
 * production builds render nothing, so the live site never shows empty boxes.
 *
 * To go live with Google AdSense:
 *   1. Get approved and copy your publisher id (ca-pub-XXXXXXXXXXXXXXXX) into `client`
 *   2. Create one ad unit per placement below and paste each data-ad-slot id
 *   3. Add /public/ads.txt with the line AdSense gives you
 *   4. Set provider to "adsense"
 */

export type AdPlacement = "feed" | "post-top" | "in-article" | "sidebar" | "post-end";

export const adsConfig = {
  provider: "adsense" as "none" | "adsense",
  client: "ca-pub-1815662567647883",
  slots: {
    feed: "",
    "post-top": "",
    "in-article": "",
    sidebar: "",
    "post-end": "",
  } satisfies Record<AdPlacement, string>,
};

export const adsEnabled = adsConfig.provider === "adsense" && adsConfig.client !== "";
