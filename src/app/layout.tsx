import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 가족 홈",
  description: "가족 전용 - 가보고 싶은 장소, 일정, 관심 뉴스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
