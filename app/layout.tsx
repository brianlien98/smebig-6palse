import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMEbig War Room",
  description: "品牌六脈戰情室",
  icons: {
    icon: "/ICON.png", // 這裡指定您的圖片路徑
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}