#!/bin/bash
# ============================================
# JobPal H5 部署脚本
# 目标服务器: 47.107.30.30
# 部署路径:   /var/www/jobpal/app
# ============================================
set -e

SERVER="root@47.107.30.30"
REMOTE_PATH="/var/www/jobpal/app"
LOCAL_DIST="dist/build/h5"

echo "开始构建 H5..."
npm run build:h5

if [ ! -d "$LOCAL_DIST" ]; then
  echo "构建失败：$LOCAL_DIST 目录不存在"
  exit 1
fi

echo "上传到服务器 $SERVER:$REMOTE_PATH ..."

# rsync 优先，不可用时降级为 scp
if command -v rsync &> /dev/null; then
  rsync -avz --delete "$LOCAL_DIST/" "$SERVER:$REMOTE_PATH/"
else
  echo "rsync 不可用，改用 scp 上传..."
  ssh "$SERVER" "rm -rf $REMOTE_PATH/*" 2>/dev/null
  scp -r "$LOCAL_DIST"/* "$SERVER:$REMOTE_PATH/"
fi

echo "部署完成！访问地址: http://47.107.30.30"
