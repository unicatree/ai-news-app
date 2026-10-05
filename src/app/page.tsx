import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { AutoOpenSignIn } from "@/components/auto-open-sign-in";

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
        <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span className="font-bold">AI 뉴스 수집기</span>
          <UserButton />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 text-zinc-500">
          {/* 메인 화면(뉴스 가져오기, 탭, 카드 그리드)은 PRD 3단계에서 구현 */}
          로그인되었습니다.
        </main>
      </Show>
    </>
  );
}
