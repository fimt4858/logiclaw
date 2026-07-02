import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://logiclaw.co.kr"),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "법률사무소 신뢰 - 신뢰할 수 있는 전문성을 바탕으로 최적의 법률 솔루션을 제공합니다",
  openGraph: {
    title: SITE_NAME,
    description:
      "법률사무소 신뢰 - 신뢰할 수 있는 전문성을 바탕으로 최적의 법률 솔루션을 제공합니다",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>{children}</body>
    </html>
  );
}
