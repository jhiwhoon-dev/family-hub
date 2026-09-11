import LoginForm from "./LoginForm";

// 로그인 여부에 따라 쿠키를 확인해야 하므로 빌드 시 미리 렌더링하지 않고
// 요청이 들어올 때마다 렌더링합니다. (Supabase 클라이언트가 필요로 하는
// 환경변수가 빌드 시점에 없어도 빌드가 실패하지 않도록 하는 목적도 있습니다.)
export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return <LoginForm initialError={searchParams.error} />;
}
