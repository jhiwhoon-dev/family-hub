// 네이버 지도(NCP Maps) JS SDK의 최소 타입 선언
// 전체 타입이 필요하면 @types/navermaps 패키지를 추가로 설치해도 됩니다.
export {};

declare global {
  interface Window {
    naver: any;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const naver: any;
}
