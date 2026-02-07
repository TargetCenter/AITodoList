#!/bin/bash

# 检查当前目录是否是 Git 仓库
if [ ! -d .git ]; then
    echo "未找到 Git 仓库，正在初始化..."
    git init
fi

# 检查是否存在名为 github 的远程仓库
if ! git remote | grep -q "github"; then
    echo "未找到名为 github 的远程仓库，正在添加..."
    git remote add github "https://${GitHub_TargetCenter_REPO_TOKEN}@github.com/TargetCenter/AITodoList.git"
fi

# 添加所有更改
git add .

# 提交更改
if git diff --cached --quiet; then
    echo "没有更改需要提交。"
else
    git commit -m "Sync changes"
fi

# 强制推送到 GitHub
echo "正在同步更改到 GitHub..."
git push --force github main

echo "同步完成！"
