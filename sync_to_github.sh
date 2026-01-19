#!/bin/bash

# 检查当前目录是否是 Git 仓库
if [ ! -d .git ]; then
    echo "当前目录不是 Git 仓库，正在初始化..."
    git init
fi

# 检查是否已配置名为 github 的远程仓库
if ! git remote | grep -q "github"; then
    echo "未找到名为 github 的远程仓库，正在添加..."
    git remote add github "https://$GitHub_TargetCenter_REPO_TOKEN@github.com/TargetCenter/AITodoList.git"
fi

# 检查 GitHub 仓库是否存在
repo_exists=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GitHub_TargetCenter_REPO_TOKEN" "https://api.github.com/repos/TargetCenter/AITodoList")

if [ "$repo_exists" -eq 404 ]; then
    echo "GitHub 仓库不存在，正在创建..."
    curl -X POST -H "Authorization: token $GitHub_TargetCenter_REPO_TOKEN" -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/user/repos" -d '{"name":"AITodoList","description":"使用PollinationsAI的代办应用"}'
fi

# 同步所有更改到 GitHub
echo "正在同步更改到 GitHub..."
git add .
git commit -m "Sync changes"
git push github main

echo "同步完成！"