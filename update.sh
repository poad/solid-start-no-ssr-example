#!/bin/sh

CUR=$(pwd)

CURRENT=$(cd "$(dirname "$0")" || exit;pwd)
echo "${CURRENT}"

cd "${CURRENT}" || exit

if ! (cd "${CURRENT}" || exit && git pull --prune); then
  cd "${CUR}" || exit
  exit 1
fi
echo ""
pwd

if ! (disable-checkout-persist-credentials && rm -rf node_modules && pnx pnpm@latest self-update && pnpm install -r && rm -rf pnpm-lock.yaml && pnpm up -r && pnpm audit --fix override && pnpm up -r && pnpm -r --if-present lint-fix && pnpm build); then
  cd "${CUR}" || exit
  exit 1
fi

if ! (cd "${CURRENT}" || exit && git pull --prune && git commit -am "Bumps node modules" && git push); then
  cd "${CUR}" || exit
  exit 1
fi

cd "${CUR}" || exit
