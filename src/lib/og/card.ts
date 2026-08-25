import config from "@/config/config.json";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { loadKoreanSubset } from "./font";

const WIDTH = 1200;
const HEIGHT = 630;

// Matches the site: monochrome, generous margins, type doing the work.
const COLORS = {
  background: "#ffffff",
  title: "#040404",
  meta: "#717171",
  rule: "#eaeaea",
};

interface OgCard {
  title: string;
  meta: string;
}

/**
 * satori accepts plain `{type, props}` objects, so no JSX runtime is needed —
 * but its signature is typed as `ReactNode`, which a bare object literal does
 * not satisfy. Returning `any` keeps the call sites readable.
 */
const box = (style: Record<string, unknown>, children: unknown): any => ({
  type: "div",
  props: { style, children },
});

export async function renderOgImage({ title, meta }: OgCard): Promise<Buffer> {
  const brand = config.site.title;
  const [bold, regular] = await Promise.all([
    loadKoreanSubset(title + brand, 700),
    loadKoreanSubset(meta + brand, 400),
  ]);

  const svg = await satori(
    box(
      {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: COLORS.background,
        padding: "72px 80px",
        fontFamily: "Noto Sans KR",
      },
      [
        box(
          {
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.title,
          },
          brand,
        ),
        box(
          {
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.35,
            color: COLORS.title,
            // Long titles must not push the meta row off the card.
            maxHeight: 350,
            overflow: "hidden",
          },
          title,
        ),
        box(
          {
            display: "flex",
            fontSize: 26,
            fontWeight: 400,
            color: COLORS.meta,
            borderTop: `2px solid ${COLORS.rule}`,
            paddingTop: 24,
          },
          meta,
        ),
      ],
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
        { name: "Noto Sans KR", data: regular, weight: 400, style: "normal" },
      ],
    },
  );

  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng(),
  );
}
