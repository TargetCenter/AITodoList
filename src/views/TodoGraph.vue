<template>
  <div class="todo-graph">
    <el-container>
      <el-header>
        <h1>待办任务关系图</h1>
        <div class="toolbar">
          <el-button @click="goBack">返回编辑器</el-button>
        </div>
      </el-header>
      
      <el-main>
        <div ref="chartContainer" class="chart-container"></div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { parseMarkdown } from '../utils/markdownParser'
import fileManager from '../utils/fileManager'

export default {
  name: 'TodoGraph',
  setup() {
    const router = useRouter()
    const chartContainer = ref(null)
    let chart = null
    
    const goBack = () => {
      router.push('/')
    }
    
    const initChart = () => {
      if (!chartContainer.value) return
      
      chart = echarts.init(chartContainer.value)
      
      // 从当前文件中读取数据
      const currentFile = fileManager.getCurrentFile()
      let markdownContent = `- [x] 项目初始化 @2023-09-14 1h
- [ ] 设计数据库 @2023-09-15 2h
- [ ] 开发API接口 @2023-09-16 4h -> 设计数据库
- [ ] 前端页面开发 @2023-09-17 3h -> 设计数据库
- [ ] 部署测试环境 @2023-09-20 2h -> 开发API接口, 前端页面开发`
      
      if (currentFile && currentFile.content) {
        markdownContent = currentFile.content
      }
      
      const tasks = parseMarkdown(markdownContent)
      
      // 构建图表数据
      const nodes = tasks.map(task => ({
        id: task.title,
        name: task.title,
        category: task.completed ? 1 : 0,
        symbolSize: task.duration ? Math.min(60, Math.max(20, parseInt(task.duration) * 5)) : 30,
        itemStyle: {
          color: task.completed ? '#52c41a' : '#1890ff'
        }
      }))
      
      // 构建关系边
      const links = []
      tasks.forEach(task => {
        if (task.dependencies.length > 0) {
          task.dependencies.forEach(dep => {
            // 查找依赖的任务
            const depTask = tasks.find(t => t.title === dep || t.title.includes(dep))
            if (depTask) {
              links.push({
                source: depTask.title,
                target: task.title,
                lineStyle: {
                  color: '#999',
                  width: 2,
                  curveness: 0.2
                }
              })
            }
          })
        }
      })
      
      const option = {
        title: {
          text: '待办任务依赖关系图',
          subtext: '箭头指向表示任务依赖关系',
          textStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          formatter: function (params) {
            if (params.dataType === 'node') {
              const task = tasks.find(t => t.title === params.name)
              if (task) {
                let info = `${task.title}<br/>`
                if (task.startTime) info += `开始时间: ${task.startTime}<br/>`
                if (task.duration) info += `用时: ${task.duration}<br/>`
                if (task.completed) info += '状态: 已完成<br/>'
                else info += '状态: 未完成<br/>'
                if (task.dependencies.length > 0) info += `依赖: ${task.dependencies.join(', ')}<br/>`
                return info
              }
            }
            return params.name
          }
        },
        legend: [{
          data: ['未完成', '已完成']
        }],
        series: [{
          type: 'graph',
          layout: 'force',
          animation: true,
          force: {
            repulsion: 100,
            gravity: 0.1,
            edgeLength: 150,
            layoutAnimation: true
          },
          data: nodes,
          links: links,
          categories: [{
            name: '未完成',
            itemStyle: {
              color: '#1890ff'
            }
          }, {
            name: '已完成',
            itemStyle: {
              color: '#52c41a'
            }
          }],
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          labelLayout: {
            hideOverlap: true
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 5
            }
          },
          lineStyle: {
            color: 'source',
            curveness: 0
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10]
        }]
      }
      
      chart.setOption(option)
      
      // 窗口大小调整时重绘图表
      window.addEventListener('resize', () => {
        chart.resize()
      })
    }
    
    onMounted(() => {
      initChart()
    })
    
    onBeforeUnmount(() => {
      if (chart) {
        chart.dispose()
      }
    })
    
    return {
      chartContainer,
      goBack
    }
  }
}
</script>

<style scoped>
.todo-graph {
  height: 100%;
}

.el-header {
  background-color: #f5f5f5;
  color: #333;
  text-align: center;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: calc(100vh - 100px);
  background-color: #fff;
  border-radius: 4px;
}
</style>