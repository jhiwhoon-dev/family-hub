import NavBar from "@/components/NavBar";

// 로그인한 사용자별 데이터(쿠키/세션, Supabase 조회 결과)를 다루는 화면이라
// 빌드 시점에 미리 정적으로 생성하지 않고 매 요청마다 렌더링합니다.
// (Supabase 환경변수가 빌드 시점에 없어도 `next build`가 실패하지 않게 합니다.)
export const dynamic = "force-dynamic";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
    </div>
  );
}
