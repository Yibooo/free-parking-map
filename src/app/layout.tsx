import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "無料駐車場マップ | 家族のお出かけサポート",
  description:
    "東京都内の駐車場付き施設を地図で探せる。家族のお出かけに便利な無料・格安駐車場情報。",
  openGraph: {
    title: "無料駐車場マップ",
    description: "東京都内の駐車場付き施設を地図で探せる家族向けWebアプリ",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
