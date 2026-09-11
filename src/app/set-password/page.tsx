import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetPasswordForm from "./SetPasswordForm";

// 초대 링크(/auth/confirm)를 거쳐 로그인 세션이 생긴 사용자만 접근할 수 있습니다.
export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SetPasswordForm />;
}
