import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase의 초대/비밀번호 재설정 이메일 링크가 도착하는 곳입니다.
// (Supabase 대시보드 > Authentication > Email Templates 에서 "Invite user" 템플릿의
// 링크가 이 라우트를 가리키도록 수정해야 정상적으로 동작합니다. README 참고.)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/set-password";

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    // 디버깅을 위해 실패 사유를 함께 남깁니다 (로그인 화면에 표시됩니다).
    const failUrl = new URL("/login", origin);
    failUrl.searchParams.set("error", `초대 확인 실패: ${error.message}`);
    return NextResponse.redirect(failUrl);
  }

  // token_hash/type 자체가 없는 경우 (링크가 잘못되었거나 우리 라우트를 거치지 않은 경우)
  const missingParamsUrl = new URL("/login", origin);
  missingParamsUrl.searchParams.set(
    "error",
    `링크에 필요한 정보가 없습니다 (token_hash: ${token_hash ? "있음" : "없음"}, type: ${type ?? "없음"})`
  );
  return NextResponse.redirect(missingParamsUrl);
}
