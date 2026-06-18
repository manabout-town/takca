#!/bin/bash
echo "=== Claude Code 인증 초기화 ==="
echo ""

# 기존 인증 정보 제거
echo "1. 기존 세션 로그아웃..."
claude logout 2>/dev/null || true

# Claude 설정 파일 캐시 제거
CONFIG_DIR="$HOME/.config/claude"
if [ -d "$CONFIG_DIR" ]; then
  echo "2. 캐시 파일 제거 중..."
  rm -f "$CONFIG_DIR/credentials" 2>/dev/null
  rm -f "$CONFIG_DIR/.session" 2>/dev/null
  rm -f "$CONFIG_DIR/auth.json" 2>/dev/null
fi

# 환경 변수 초기화
unset ANTHROPIC_API_KEY
unset CLAUDE_API_KEY

echo ""
echo "3. 재로그인 시작 (브라우저가 열립니다)..."
echo ""
claude login

echo ""
echo "=== 완료! 아래 명령으로 정상 작동 확인하세요 ==="
echo "claude --version"
echo ""
read -p "엔터를 누르면 창이 닫힙니다..."
