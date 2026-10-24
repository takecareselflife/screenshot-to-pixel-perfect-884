/**
 * Visual guides (illustrated infographics) shown next to the assistant.
 * Images live in CDN storage; the pointer files keep the URLs.
 */
import condomGuide from "@/assets/condom-guide.jpeg.asset.json";
import hpvGuide from "@/assets/hpv-vaccine-guide.jpeg.asset.json";

export type Guide = {
  id: "condom" | "hpv";
  title: string;
  blurb: string;
  alt: string;
  src: string;
};

export const guides: Guide[] = [
  {
    id: "condom",
    title: "Condom guide",
    blurb: "What it protects against and how to use it, step by step.",
    alt: "Illustrated guide titled 'Condom — protection at every stage'. It says condoms prevent STIs and unplanned pregnancy, and shows four steps: open the package carefully without sharp objects, put it on an erect penis before any sexual contact, unroll it all the way to the base, then after sex remove it carefully, tie a knot, wrap it in paper and throw it in the trash.",
    src: condomGuide.url,
  },
  {
    id: "hpv",
    title: "HPV vaccine guide",
    blurb: "What HPV can cause and who the vaccine is for.",
    alt: "Illustrated guide titled 'HPV vaccine — more protection for your future'. It says the vaccine is safe and helps prevent several cancers and genital warts, lists what HPV can cause (cervical cancer, anal cancer, penile cancer, genital warts), and notes it is recommended for boys and girls ideally between 9 and 14, is more effective before sexual life starts, and is given in 2 doses six months apart.",
    src: hpvGuide.url,
  },
];

export function guideById(id?: "condom" | "hpv") {
  return guides.find((g) => g.id === id);
}
