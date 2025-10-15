<template>
  <div class="monaco-editor-wrapper">
    <div ref="editorContainer" class="monaco-editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import { todoLanguageDefinition, todoTheme, todoDarkTheme } from '@/utils/todoLanguage'
import { todoCompletionProvider } from '@/utils/todoCompletion'

// 配置Monaco Editor Worker - 禁用Worker避免404错误
if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId: string, label: string): string {
      // 返回一个空的blob URL来避免404错误
      const emptyWorkerCode = 'self.onmessage = function(e) { /* Worker disabled */ };';
      const blob = new Blob([emptyWorkerCode], { type: 'application/javascript' });
      return URL.createObjectURL(blob);
    },
    getWorker: function (moduleId: string, label: string): Worker {
      // 返回一个简单的worker来避免错误
      const workerCode = 'self.onmessage = function(e) { /* Worker disabled */ };';
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    }
  };
}

interface Props {
  modelValue?: string
  theme?: string
  options?: Record<string, any>
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'scroll', event: {
    scrollTop: number
    scrollLeft: number
    scrollHeight: number
    scrollWidth: number
    clientHeight: number
    clientWidth: number
  }): void
  (e: 'change', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  theme: 'vs',
  options: () => ({})
})

const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let model: monaco.editor.ITextModel | null = null
let resizeObserver: ResizeObserver | null = null

    // 默认编辑器选项
    const defaultOptions = {
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      folding: false,
      renderWhitespace: 'none',
      cursorBlinking: 'blink',
      smoothScrolling: true,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible'
      },
      // 启用基本功能
      semanticHighlighting: false,
      colorDecorators: false,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'off',
      links: false,
      autoIndent: 'none',
      formatOnPaste: false,
      formatOnType: false,
      // 禁用其他高级功能
      codeActions: false,
      codeLens: false,
      lightbulb: { enabled: false },
      occurrencesHighlight: false,
      selectionHighlight: false,
      highlightActiveIndentGuide: false,
      showFoldingControls: 'never',
      mouseWheelZoom: false,
      multiCursorModifier: 'ctrlCmd',
      accessibilitySupport: 'off'
    }

    // 注册自定义语言
    const registerTodoLanguage = () => {
      // 注册语言
      monaco.languages.register({ id: 'todo-markdown' })

      // 设置语言配置
      monaco.languages.setLanguageConfiguration('todo-markdown', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '`', close: '`' }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
          { open: '`', close: '`' }
        ],
        folding: {
          markers: {
            start: new RegExp('^\\s*<!--\\s*#region\\b.*-->'),
            end: new RegExp('^\\s*<!--\\s*#endregion\\b.*-->')
          }
        }
      })

      // 设置Monarch语法高亮
      monaco.languages.setMonarchTokensProvider('todo-markdown', todoLanguageDefinition)

      // 注册自定义主题
      monaco.editor.defineTheme('todo-light', todoTheme)
      monaco.editor.defineTheme('todo-dark', todoDarkTheme)

      // 注册补全提供者
      monaco.languages.registerCompletionItemProvider('todo-markdown', todoCompletionProvider)
    }

    // 创建编辑器
    const createEditor = async () => {
      if (!editorContainer.value) return

      // 注册自定义语言
      registerTodoLanguage()

      // 合并选项
      const editorOptions = {
        ...defaultOptions,
        ...props.options,
        value: props.modelValue,
        language: 'todo-markdown',
        theme: props.theme
      }

      // 创建编辑器实例
      editor = monaco.editor.create(editorContainer.value, editorOptions)
      model = editor.getModel()

      // 监听内容变化
      model.onDidChangeContent(() => {
        const value = model.getValue()
        emit('update:modelValue', value)
        emit('change', value)
      })

      // 监听滚动事件
      editor.onDidScrollChange((e) => {
        emit('scroll', {
          scrollTop: e.scrollTop,
          scrollLeft: e.scrollLeft,
          scrollHeight: e.scrollHeight,
          scrollWidth: e.scrollWidth,
          clientHeight: editorContainer.value.clientHeight,
          clientWidth: editorContainer.value.clientWidth
        })
      })

      // 监听焦点事件
      editor.onDidFocusEditorText(() => {
        emit('focus')
      })

      editor.onDidBlurEditorText(() => {
        emit('blur')
      })

      // 设置编辑器主题
      monaco.editor.setTheme(props.theme)

      }

    // 销毁编辑器
    const destroyEditor = () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      
      if (editor) {
        editor.dispose()
        editor = null
        model = null
      }
    }

    // 设置编辑器值
    const setValue = (value: string) => {
      if (editor && model && value !== model.getValue()) {
        model.setValue(value)
      }
    }

    // 获取编辑器值
    const getValue = (): string => {
      return model ? model.getValue() : ''
    }

    // 设置编辑器主题
    const setTheme = (theme: string) => {
      if (editor) {
        monaco.editor.setTheme(theme)
      }
    }

  
    // 格式化文档
    const formatDocument = (): void => {
      if (editor) {
        editor.getAction('editor.action.formatDocument').run()
      }
    }

    // 触发建议
    const triggerSuggest = (): void => {
      if (editor) {
        editor.getAction('editor.action.triggerSuggest').run()
      }
    }

    // 获取编辑器实例
    const getEditor = (): monaco.editor.IStandaloneCodeEditor | null => {
      return editor
    }

    // 获取模型实例
    const getModel = (): monaco.editor.ITextModel | null => {
      return model
    }

    // 监听props变化
    watch(() => props.modelValue, (newValue: string) => {
      setValue(newValue)
    })

    watch(() => props.theme, (newTheme: string) => {
      setTheme(newTheme)
    })

    
    watch(() => props.options, (newOptions: Record<string, any>) => {
      if (editor) {
        editor.updateOptions(newOptions)
      }
    }, { deep: true })

  
    onMounted(async () => {
      await createEditor()

      // 监听容器大小变化
      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          if (editor) {
            editor.layout()
          }
        })
        resizeObserver.observe(editorContainer.value!)
      }
    })

    onUnmounted(() => {
      destroyEditor()
    })

    // 暴露方法给父组件
    defineExpose({
      editorContainer,
      setValue,
      getValue,
      setTheme,
      formatDocument,
      triggerSuggest,
      getEditor,
      getModel
    })
</script>

<style scoped>
.monaco-editor-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.monaco-editor-container {
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

/* 深色主题样式 */
.monaco-editor-wrapper :deep(.monaco-editor.vs-dark) {
  border-color: #3c3c3c;
}

/* 高对比度主题样式 */
.monaco-editor-wrapper :deep(.monaco-editor.hc-black) {
  border-color: #6fc3df;
}

/* 自定义滚动条样式 */
.monaco-editor-wrapper :deep(.monaco-scrollable-element > .scrollbar > .slider) {
  background: rgba(100, 100, 100, 0.4);
}

.monaco-editor-wrapper :deep(.monaco-scrollable-element > .scrollbar > .slider:hover) {
  background: rgba(100, 100, 100, 0.7);
}

.monaco-editor-wrapper :deep(.monaco-scrollable-element > .scrollbar > .slider.active) {
  background: rgba(0, 0, 0, 0.6);
}

/* 建议框样式优化 */
.monaco-editor-wrapper :deep(.monaco-editor .suggest-widget) {
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.monaco-editor-wrapper :deep(.monaco-editor .suggest-widget .monaco-list .monaco-list-row) {
  border-radius: 4px;
  margin: 2px 4px;
}

/* 悬停提示样式优化 */
.monaco-editor-wrapper :deep(.monaco-editor .monaco-hover) {
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 错误标记样式 */
.monaco-editor-wrapper :deep(.monaco-editor .squiggly-error) {
  background: url("data:image/svg+xml,%3csvg width='6' height='3' viewBox='0 0 6 3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23ff1212' fill='none' stroke-width='1'/%3e%3c/svg%3e") repeat-x bottom left;
}

.monaco-editor-wrapper :deep(.monaco-editor .squiggly-warning) {
  background: url("data:image/svg+xml,%3csvg width='6' height='3' viewBox='0 0 6 3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23bf8803' fill='none' stroke-width='1'/%3e%3c/svg%3e") repeat-x bottom left;
}

.monaco-editor-wrapper :deep(.monaco-editor .squiggly-info) {
  background: url("data:image/svg+xml,%3csvg width='6' height='3' viewBox='0 0 6 3' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%231890ff' fill='none' stroke-width='1'/%3e%3c/svg%3e") repeat-x bottom left;
}
</style>