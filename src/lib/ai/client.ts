import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// ANTHROPIC_API_KEY는 SDK가 환경 변수에서 읽는다.
// 30초 안에 끝내는 게 목표라 한 번만 다시 시도한다.
export const anthropic = new Anthropic({ timeout: 60_000, maxRetries: 1 });

export const NEWS_MODEL = "claude-haiku-4-5";
