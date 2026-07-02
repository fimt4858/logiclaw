import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { DEFAULT_SETTINGS, SITE_NAME } from "@/lib/constants";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "법은 어렵고 복잡하지만, 해결은 신뢰에서 시작됩니다. 민사, 형사, 가사, 부동산, 회생 전문 법률사무소.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <Header />
        {children}
        <Footer
          phone={DEFAULT_SETTINGS.phone}
          address={DEFAULT_SETTINGS.address}
          copyright={DEFAULT_SETTINGS.copyright}
        />
      </body>
    </html>
  );
}
