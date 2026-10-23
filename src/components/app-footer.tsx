// 모든 화면 공통 푸터. 루트 레이아웃에 두어 로그인 전후 모두 화면 맨 아래에 붙는다.
export function AppFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-slate-400">
        <p>Copyright 2026 AI 뉴스 수집기.</p>
        <p>
          Powered by <span className="font-medium text-slate-700 dark:text-slate-200">Claude</span>.
        </p>
      </div>
    </footer>
  );
}
