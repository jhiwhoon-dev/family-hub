# 우리 가족 홈 (Family Hub)

가족 전용 웹사이트: 가보고 싶은 장소(네이버 지도 연동), 가족 일정, 관심 뉴스를 한 곳에서 관리합니다.

## 기술 스택

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (Postgres DB + 이메일/비밀번호 인증 + Row Level Security)
- **NAVER Cloud Platform Maps API** (Web Dynamic Map) — 지도 표시
- **rss-parser** — 관심 뉴스 RSS 수집

> ⚠️ 이 코드는 Claude가 만든 샌드박스 환경에서 npm 레지스트리 접근이 막혀 있어
> `npm install` / `npm run build` 로 실제 설치·빌드 테스트를 하지 못한 상태로
> 작성되었습니다. 소스 코드 자체는 실제 동작하는 Next.js + Supabase 패턴을 그대로
> 따랐지만, 로컬(또는 배포 환경)에서 처음 설치할 때 사소한 타입 오류나 버전 충돌이
> 있을 수 있으니 아래 순서대로 확인해주세요.

## 1. 로컬 설치

```bash
npm install
cp .env.local.example .env.local   # 값 채우기 (아래 2, 3단계 참고)
npm run dev
```

`npm install` 후 `npm run build` 를 한 번 실행해서 타입 에러가 없는지 확인하는 걸 권장합니다.

## 2. Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com) 에서 무료 프로젝트를 생성합니다.
2. **SQL Editor** 에서 `supabase/schema.sql` 파일 내용을 그대로 붙여넣고 실행합니다.
   - 가족 구성원 프로필, 장소/일정/뉴스 테이블과 Row Level Security 정책이 한 번에 생성됩니다.
3. **Project Settings > API** 에서 `Project URL`, `anon public key` 를 복사해
   `.env.local` 의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 에 넣습니다.
4. **가족 계정 만들기**: Authentication > Users > **Invite user** 로 가족 구성원의
   이메일을 하나씩 초대합니다. 초대 메일의 링크로 비밀번호를 설정하면 바로 로그인할
   수 있습니다. (회원가입 폼을 따로 만들지 않은 이유: 외부인이 가입하는 것을 막기
   위해서입니다. 필요하면 나중에 초대 코드 기반 회원가입을 추가할 수 있어요.)

## 3. 네이버 지도(NCP Maps) API 키 발급

1. [NAVER Cloud Platform 콘솔](https://console.ncloud.com/maps/application) 에 가입/로그인합니다.
2. **Application 등록** > 사용할 서비스에서 **Web Dynamic Map** 을 선택합니다.
3. 서비스 URL(예: `http://localhost:3000`, 배포 후에는 실제 도메인)을 등록합니다.
4. 발급된 **Client ID** 를 `.env.local` 의 `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 에 넣습니다.

무료 사용량: Web Dynamic Map 월 600만 건(지도 로딩 시에만 카운트, 이후 확대/마커
조작은 무료), Geocoding 월 300만 건 — 가족 단위 사용량에는 사실상 무제한입니다.

장소 등록 시 위도/경도를 직접 입력해야 지도에 표시됩니다. 네이버 지도 앱/웹에서
장소를 검색 후 "공유 > 링크 복사"를 하면 링크 안에 좌표가 포함되어 있어 확인할 수
있습니다. (추후 여유가 되면 Geocoding API를 붙여 주소만 입력해도 좌표를 자동으로
채우도록 개선할 수 있습니다.)

## 4. 관심 뉴스 설정

뉴스 페이지에서 "관심 키워드/피드 추가"로 RSS 주소를 등록하면 됩니다. 네이버는
더 이상 공개 뉴스 검색 RSS를 제공하지 않으므로, 기본 예시로 구글 뉴스 검색 RSS
(`https://news.google.com/rss/search?q=키워드&hl=ko&gl=KR&ceid=KR:ko`)를 사용합니다.
언론사가 자체 RSS 주소를 제공하면 그 주소를 바로 등록해도 됩니다.

"새로고침" 버튼을 누르면 등록된 모든 피드를 가져와 새 기사를 저장합니다. 매일 자동으로
갱신하고 싶다면 Vercel 배포 후 `vercel.json` 에 아래처럼 Cron을 추가해 `/api/news/refresh`
를 주기적으로 호출할 수 있습니다.

```json
{
  "crons": [{ "path": "/api/news/refresh", "schedule": "0 7 * * *" }]
}
```

(Cron으로 호출할 경우, 현재 라우트는 로그인 세션을 요구하므로 인증 없이도 동작하도록
서비스 롤 키를 사용하는 별도 처리를 추가하는 게 좋습니다. 우선은 가족이 뉴스 페이지에
접속해서 수동으로 새로고침하는 방식으로도 충분합니다.)

## 5. 배포 (Vercel 추천)

1. GitHub 저장소를 만들고 이 프로젝트를 푸시합니다.
2. [vercel.com](https://vercel.com) 에서 저장소를 Import 합니다.
3. Environment Variables 에 `.env.local` 의 세 값을 그대로 등록합니다.
4. 배포 후 실제 도메인을 NCP Maps 콘솔의 서비스 URL에도 추가합니다(안 하면 지도가
   로드되지 않습니다).

## 폴더 구조

```
src/
  app/
    login/                가족 로그인
    (protected)/           로그인해야 접근 가능한 영역
      dashboard/            홈 - 요약 대시보드
      places/                가보고 싶은 곳 (지도 + 목록 + 등록/수정)
      events/                가족 일정 (D-day 목록 + 등록/수정)
      news/                  관심 뉴스 (RSS 피드 + 기사 목록)
    api/news/refresh/       RSS 수집 API
  components/               NavBar, NaverMap, CategoryBadge 등 공용 컴포넌트
  lib/supabase/             Supabase 클라이언트 (브라우저/서버/미들웨어)
  types/database.ts         테이블 타입 정의
supabase/schema.sql         DB 스키마 + RLS 정책 (Supabase SQL Editor에 붙여넣기)
```

## 접근 권한 설계

현재는 "로그인한 가족 구성원은 모든 데이터를 보고/쓸 수 있다"는 정책(RLS)으로
되어 있습니다. 가족끼리는 서로 믿고 쓰는 공용 공간이라는 전제입니다. 만약 "내가
등록한 건 나만 수정/삭제 가능"하게 하고 싶다면 `supabase/schema.sql` 의 update/delete
정책에서 `auth.role() = 'authenticated'` 부분을 `auth.uid() = created_by` 로 바꾸면 됩니다.

## 향후 확장 아이디어

- 장소 등록 시 주소 → 좌표 자동 변환 (Geocoding API 연동)
- 가족 앨범/사진 갤러리 (Supabase Storage 활용)
- 방명록/댓글, 간단 투표 기능
- 구글 캘린더 구독(iCal) 연동
- 일정에 대한 가족 알림 (이메일 또는 카카오 알림톡)
