import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { AppHeader } from "@/components/app-header";
import { AutoOpenSignIn } from "@/components/auto-open-sign-in";
import { NewsBoard } from "@/components/news-board";
import { sampleNews } from "@/lib/sample-news";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <AutoOpenSignIn />
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
          <h1 className="text-3xl font-bold">AI 뉴스 수집기</h1>
          <p className="max-w-md text-zinc-600 dark:text-zinc-400">
            해외 AI 뉴스를 모아 한국어로 요약해 드립니다. 로그인 후 이용해 주세요.
          </p>
          <div className="flex gap-3">
            <SignInButton mode="modal" withSignUp>
              <button className="h-11 rounded-full bg-foreground px-6 font-medium text-background">
                로그인
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="h-11 rounded-full border border-zinc-300 px-6 font-medium dark:border-zinc-700">
                회원가입
              </button>
            </SignUpButton>
          </div>
        </main>
      </Show>

      <Show when="signed-in">
        <AppHeader />
        <main className="flex-1">
          {/* TODO(PRD 3단계): /api/news/fetch 구현 후 예시 데이터 제거 */}
          <NewsBoard initialItems={sampleNews} isSample />
        </main>
      </Show>
    </>
  );
}
