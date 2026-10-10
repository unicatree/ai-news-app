import { AppHeader } from "@/components/app-header";

// 헤더를 레이아웃에 두어 loading.tsx가 보이는 동안에도 헤더가 유지되게 한다.
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </main>
    </>
  );
}
