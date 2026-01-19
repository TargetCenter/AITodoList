#!/bin/bash

# Check if the current directory is a Git repository
if [ ! -d .git ]; then
    echo "未找到 Git 仓库，正在初始化..."
    git init
fi

# Check if the remote 'github' exists
if ! git remote | grep -q "github"; then
    echo "未找到名为 github 的远程仓库，正在添加..."
    git remote add github "https://github.com/TargetCenter/AITodoList.git"
fi

# Add all changes
git add .

# Commit changes
if git diff --cached --quiet; then
    echo "没有更改需要提交。"
else
    git commit -m "Sync changes"
fi

# Force push to GitHub
echo "正在强制同步更改到 GitHub..."
git push --force github main

echo "同步完成！"