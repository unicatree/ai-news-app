import { clerkMiddleware } from "@clerk/nextjs/server";

// 인증 검사는 여기서 하지 않는다. 보호가 필요한 페이지·API·Server Action에서 각각 검사한다.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
  ],
};
