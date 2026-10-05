"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

// 미로그인 사용자가 접속하면 로그인 모달을 바로 띄운다.
export function AutoOpenSignIn() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();
  const handled = useRef(false);

  useEffect(() => {
    if (!isLoaded || isSignedIn || handled.current) return;
    handled.current = true;

    (async () => {
      // 가입하지 않은 소셜 계정으로 로그인하면 OAuth 리다이렉트 후 sign-in이 'transferable' 상태로 남는다.
      // 모달은 리다이렉트로 상태를 잃어 "External Account was not found"를 띄우므로, 여기서 바로 가입으로 전환한다.
      const client = clerk.client;
      if (client?.signIn.firstFactorVerification.status === "transferable") {
        try {
          const signUp = await client.signUp.create({ transfer: true });
          if (signUp.status === "complete") {
            await clerk.setActive({ session: signUp.createdSessionId });
            window.history.replaceState(null, "", "/");
            return;
          }
        } catch (err) {
          console.error("소셜 계정 가입 전환 실패", err);
        }
      }

      // withSignUp: 로그인 모달 안에서 회원가입까지 처리
      clerk.openSignIn({ withSignUp: true });
    })();
  }, [isLoaded, isSignedIn, clerk]);

  // signUp.create()의 봇 방지(Smart CAPTCHA) 위젯이 붙을 자리
  return <div id="clerk-captcha" />;
}
