npm install -g @anthropic-ai/claude-code

# 配置claude code 假设您的 API Key 已在环境变量 ZHIPU_API_KEY 中
bash /workspace/.ide/claude_en.sh

source ~/.zshrc

# 安装claude code 的MCP服务 质朴的联网搜索和搜索一个
claude mcp add -s user zai-mcp-server --env Z_AI_API_KEY=$ZHIPU_API_KEY -- npx -y "@z_ai/mcp-server" > /dev/null 2>&1
claude mcp add -s user -t http web-search-prime https://open.bigmodel.cn/api/mcp/web_search_prime/mcp --header "Authorization: Bearer $ZHIPU_API_KEY" > /dev/null 2>&1
claude mcp add -s user -t http web-reader https://open.bigmodel.cn/api/mcp/web_reader/mcp --header "Authorization: Bearer $ZHIPU_API_KEY" > /dev/null 2>&1
claude mcp add -s user -t http zread https://open.bigmodel.cn/api/mcp/zread/mcp --header "Authorization: Bearer $ZHIPU_API_KEY" > /dev/null 2>&1