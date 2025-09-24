<template>
  <div class="editor-wrapper">
    <div ref="editorContainer" class="codemirror-editor"></div>
    <AutoComplete
      :visible="autoCompleteVisible"
      :position="autoCompletePosition"
      :items="autoCompleteItems"
      :filter="autoCompleteFilter"
      @select="onAutoCompleteSelect"
      @close="hideAutoComplete"
      ref="autoCompleteRef"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import AutoComplete from './AutoComplete.vue'
import { getAutoCompleteSuggestions, processTemplate } from '../utils/autoCompleteData'
import { parseMarkdown } from '../utils/markdownParser'

export default {
  name: 'CodeMirrorEditor',
  components: {
    AutoComplete
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'scroll'],
  setup(props, { emit }) {
    const editorContainer = ref(null)
    const autoCompleteRef = ref(null)
    let view = null

    // 自动补全相关状态
    const autoCompleteVisible = ref(false)
    const autoCompletePosition = ref({ top: 0, left: 0 })
    const autoCompleteItems = ref([])
    const autoCompleteFilter = ref('')
    const autoCompleteContext = ref({
      line: '',
      cursor: 0,
      lineStart: 0
    })

    // 获取当前任务列表用于依赖补全
    const getCurrentTasks = () => {
      try {
        return parseMarkdown(props.modelValue)
      } catch (error) {
        return []
      }
    }

    // 显示自动补全
    const showAutoComplete = (line, cursor, lineStart) => {
      const tasks = getCurrentTasks()
      const suggestions = getAutoCompleteSuggestions(line, cursor, tasks)
      
      if (suggestions.length === 0) {
        hideAutoComplete()
        return
      }

      autoCompleteItems.value = suggestions
      autoCompleteFilter.value = ''
      autoCompleteContext.value = { line, cursor, lineStart }
      
      // 计算弹窗位置
      const coords = view.coordsAtPos(lineStart + cursor)
      if (coords) {
        const editorRect = editorContainer.value.getBoundingClientRect()
        autoCompletePosition.value = {
          top: coords.bottom - editorRect.top + editorContainer.value.scrollTop,
          left: coords.left - editorRect.left + editorContainer.value.scrollLeft
        }
      }
      
      autoCompleteVisible.value = true
    }

    // 隐藏自动补全
    const hideAutoComplete = () => {
      autoCompleteVisible.value = false
      autoCompleteItems.value = []
      autoCompleteFilter.value = ''
    }

    // 处理自动补全选择
    const onAutoCompleteSelect = (item) => {
      if (!view) return

      const { line, cursor, lineStart } = autoCompleteContext.value
      const beforeCursor = line.substring(0, cursor)

      // 处理模板插入
      const { text: insertText, placeholders } = processTemplate(item.insertText)
      
      // 确定替换范围
      let replaceStart = cursor
      let replaceEnd = cursor

      // 根据不同类型确定替换范围
      if (item.type === 'task' || item.type.startsWith('task-')) {
        // 任务模板：替换整行
        replaceStart = 0
        replaceEnd = line.length
      } else if (item.type === 'date' || item.type === 'time' || item.type === 'datetime') {
        // 时间格式：替换@后的内容
        const atIndex = beforeCursor.lastIndexOf('@')
        if (atIndex !== -1) {
          replaceStart = atIndex + 1
        }
      } else if (item.type === 'duration') {
        // 用时格式：替换T:后的内容
        const tIndex = beforeCursor.lastIndexOf('T:')
        if (tIndex !== -1) {
          replaceStart = tIndex + 2
        }
      } else if (item.type === 'dependency') {
        // 依赖：替换->后的内容
        const arrowIndex = beforeCursor.lastIndexOf('->')
        if (arrowIndex !== -1) {
          replaceStart = arrowIndex + 2
        }
      }

      // 执行替换
      view.dispatch({
        changes: {
          from: lineStart + replaceStart,
          to: lineStart + replaceEnd,
          insert: replaceStart === 0 ? insertText : insertText
        }
      })

      // 如果有占位符，选中第一个占位符
      if (placeholders.length > 0) {
        const firstPlaceholder = placeholders[0]
        const newCursorPos = lineStart + replaceStart + firstPlaceholder.start
        view.dispatch({
          selection: {
            anchor: newCursorPos,
            head: newCursorPos + firstPlaceholder.defaultText.length
          }
        })
      }

      hideAutoComplete()
      view.focus()
    }

    // 处理键盘事件
    const handleKeyDown = (event) => {
      if (!autoCompleteVisible.value) {
        // 触发自动补全的条件
        if (event.key === ' ' && event.ctrlKey) {
          event.preventDefault()
          triggerAutoComplete()
          return true
        }
        return false
      }

      // 自动补全可见时的键盘处理
      const autoComplete = autoCompleteRef.value
      if (!autoComplete) return false

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          hideAutoComplete()
          return true
        
        case 'Tab':
          event.preventDefault()
          autoComplete.selectCurrent() // 修改为选择当前项
          return true
        
        case 'ArrowDown':
          event.preventDefault()
          autoComplete.selectNext()
          return true
        
        case 'ArrowUp':
          event.preventDefault()
          autoComplete.selectPrevious()
          return true
        
        case 'Enter':
        case ' ': // 添加空格键处理
          event.preventDefault()
          event.stopPropagation()
          autoComplete.selectCurrent()
          return true
        
        default:
          return false
      }
    }

    // 触发自动补全
    const triggerAutoComplete = () => {
      if (!view) return

      const cursor = view.state.selection.main.head
      const line = view.state.doc.lineAt(cursor)
      const lineText = line.text
      const cursorInLine = cursor - line.from

      showAutoComplete(lineText, cursorInLine, line.from)
    }

    // 检查是否应该自动触发补全
    const checkAutoTrigger = (update) => {
      if (!update.docChanged) return

      const cursor = update.state.selection.main.head
      const line = update.state.doc.lineAt(cursor)
      const lineText = line.text
      const cursorInLine = cursor - line.from

      // 自动触发条件
      const shouldTrigger = 
        lineText.startsWith('- ') ||  // 任务开始
        lineText.includes('@') ||     // 时间输入
        lineText.includes('T:') ||    // 用时输入
        lineText.includes('->')       // 依赖输入

      if (shouldTrigger && !autoCompleteVisible.value) {
        // 延迟触发，避免频繁弹出
        setTimeout(() => {
          if (view && view.state.selection.main.head === cursor) {
            showAutoComplete(lineText, cursorInLine, line.from)
          }
        }, 300)
      }
    }

    const createEditor = () => {
      if (!editorContainer.value) return

      const startState = EditorState.create({
        doc: props.modelValue,
        extensions: [
          lineNumbers(),
          markdown(),
          keymap.of([
            {
              key: 'Ctrl-Space',
              run: () => {
                triggerAutoComplete()
                return true
              }
            },
            {
              key: 'Enter',
              run: () => {
                if (autoCompleteVisible.value) {
                  const autoComplete = autoCompleteRef.value
                  if (autoComplete) {
                    autoComplete.selectCurrent()
                    return true
                  }
                }
                return false
              }
            },
            {
              key: ' ', // 添加空格键处理
              run: () => {
                if (autoCompleteVisible.value) {
                  const autoComplete = autoCompleteRef.value
                  if (autoComplete) {
                    autoComplete.selectCurrent()
                    return true
                  }
                }
                return false
              }
            },
            {
              key: 'Tab',
              run: () => {
                if (autoCompleteVisible.value) {
                  const autoComplete = autoCompleteRef.value
                  if (autoComplete) {
                    autoComplete.selectCurrent() // 修改为选择当前项
                    return true
                  }
                }
                return false
              }
            },
            {
              key: 'ArrowDown',
              run: () => {
                if (autoCompleteVisible.value) {
                  const autoComplete = autoCompleteRef.value
                  if (autoComplete) {
                    autoComplete.selectNext()
                    return true
                  }
                }
                return false
              }
            },
            {
              key: 'ArrowUp',
              run: () => {
                if (autoCompleteVisible.value) {
                  const autoComplete = autoCompleteRef.value
                  if (autoComplete) {
                    autoComplete.selectPrevious()
                    return true
                  }
                }
                return false
              }
            },
            {
              key: 'Escape',
              run: () => {
                if (autoCompleteVisible.value) {
                  hideAutoComplete()
                  return true
                }
                return false
              }
            }
          ]),
          EditorView.domEventHandlers({
            keydown: handleKeyDown
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              emit('update:modelValue', update.state.doc.toString())
              checkAutoTrigger(update)
            }
            
            // 滚动事件处理
            if (update.transactions.some(tr => tr.scrollIntoView)) {
              setTimeout(() => {
                if (view) {
                  const scroller = view.scrollDOM;
                  emit('scroll', {
                    scrollTop: scroller.scrollTop,
                    scrollHeight: scroller.scrollHeight,
                    clientHeight: scroller.clientHeight
                  });
                }
              }, 0);
            }
            
            if (update.viewportChanged || update.geometryChanged) {
              setTimeout(() => {
                if (view) {
                  const scroller = view.scrollDOM;
                  emit('scroll', {
                    scrollTop: scroller.scrollTop,
                    scrollHeight: scroller.scrollHeight,
                    clientHeight: scroller.clientHeight
                  });
                }
              }, 0);
            }

            // 光标移动时隐藏自动补全
            if (update.selectionSet && autoCompleteVisible.value) {
              hideAutoComplete()
            }
          })
        ]
      })

      view = new EditorView({
        state: startState,
        parent: editorContainer.value
      })
    }

    onMounted(() => {
      createEditor()
      
      // 添加滚动事件监听
      if (view) {
        view.scrollDOM.addEventListener('scroll', () => {
          emit('scroll', {
            scrollTop: view.scrollDOM.scrollTop,
            scrollHeight: view.scrollDOM.scrollHeight,
            clientHeight: view.scrollDOM.clientHeight
          });
        });
      }

      // 点击其他地方隐藏自动补全
      document.addEventListener('click', (event) => {
        if (!editorContainer.value?.contains(event.target) && 
            !event.target.closest('.autocomplete-popup')) {
          hideAutoComplete()
        }
      })
    })

    watch(() => props.modelValue, (newValue) => {
      if (view && newValue !== view.state.doc.toString()) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: newValue
          }
        })
      }
    })

    return {
      editorContainer,
      autoCompleteRef,
      autoCompleteVisible,
      autoCompletePosition,
      autoCompleteItems,
      autoCompleteFilter,
      onAutoCompleteSelect,
      hideAutoComplete
    }
  }
}
</script>

<style scoped>
.editor-wrapper {
  position: relative;
  height: 100%;
}

.codemirror-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
}

.codemirror-editor :deep(.cm-editor) {
  height: 100%;
}

.codemirror-editor :deep(.cm-scroller) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
}

.codemirror-editor :deep(.cm-focused) {
  outline: none;
}

/* 自动补全相关样式 */
.codemirror-editor :deep(.cm-tooltip-autocomplete) {
  display: none !important;
}
</style>