# Slack 알림 설정 가이드

예약 등록 시 Slack 채널에 자동으로 알림이 전송됩니다.

## 로컬 개발 환경

### 1. Slack Webhook URL 설정

`supabase/.env.local` 파일을 생성하고 다음을 입력:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**주의:** `.env.local` 파일은 절대 GitHub에 커밋하지 않습니다.
`.gitignore`에 `.env.*`이 이미 등록되어 있습니다.

### 2. 로컬 테스트

```bash
npm run dev
```

브라우저에서 예약 추가 → "예약하기" 클릭 → Slack 채널에서 알림 확인

## 배포 환경 (Vercel)

### 1. Supabase Secret 등록

Supabase 대시보드:
1. 프로젝트 → **Project Settings** → **API**
2. 왼쪽 메뉴 → **Edge Functions Secrets**
3. **Create a new secret**
   - Key: `SLACK_WEBHOOK_URL`
   - Value: (실제 Webhook URL)

### 2. Edge Function 배포

```bash
supabase functions deploy notify-booking-slack
```

(또는 Supabase 대시보드의 Edge Functions 섹션에서 배포)

### 3. 환경변수 설정 안 함

Vercel의 `.env` 에는 `SLACK_WEBHOOK_URL` 을 설정하지 않습니다.
Edge Function은 Supabase Secret에서만 읽습니다.

## 아키텍처

```
React 클라이언트
  ↓ (Webhook URL 노출 X)
Supabase Edge Function (서버)
  ↓ (SLACK_WEBHOOK_URL 환경변수)
Slack 채널
```

## 보안

- ✅ Slack Webhook URL은 서버측(Edge Function)에서만 사용
- ✅ React 클라이언트 코드에 URL 미노출
- ✅ GitHub에 `.env.local` 커밋 안 함
- ✅ Vercel 배포 시에도 클라이언트 환경변수로 설정 안 함

## 문제 해결

예약은 저장되지만 Slack 알림이 안 오는 경우:
1. Slack Webhook URL 유효성 확인
2. Supabase 대시보드에서 Edge Functions 로그 확인
3. 브라우저 개발자 도구 콘솔에서 오류 확인
