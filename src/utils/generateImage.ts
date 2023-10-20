import { ImageResponse } from "@vercel/og";
import type { ReactElement } from "react";
import boldFontData from "../fonts/Satoshi-Bold.otf.bin";
import extraBoldFontData from "../fonts/Satoshi-ExtraBold.otf.bin";

export const generateImage = (element: ReactElement) => {
  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Satoshi",
        data: boldFontData,
        weight: 700,
        style: "normal",
      },
      {
        name: "Satoshi",
        data: extraBoldFontData,
        weight: 830 as any,
        style: "normal",
      },
    ],
    emoji: "noto",
  });
};
