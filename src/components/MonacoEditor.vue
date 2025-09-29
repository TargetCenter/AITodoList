<template>
  <div class="monaco-editor-wrapper">
    <div ref="editorContainer" class="monaco-editor-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import { todoLanguageDefinition, todoTheme, todoDarkTheme } from '../utils/todoLanguage'
import { todoCompletionProvider } from '../utils/todoCompletion'
import { todoHoverProvider } from '../utils/todoHover'
import { todoValidationProvider } from '../utils/todoValidation'

export default {
  name: 'MonacoEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'todo-markdown'
    },
    theme: {
      type: String,
      default: 'vs'
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'scroll', 'change', 'focus', 'blur'],
  setup(props, { emit }) {
    const editorContainer = ref(null)
    let editor = null
    let model = null
    let resizeObserver = null

    // 默认编辑器选项
    const defaultOptions = {
      automaticLayout: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      wrappingIndent: 'indent',
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      renderWhitespace: 'selection',
      renderControlCharacters: false,
      renderLineHighlight: 'line',
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: true,
      smoothScrolling: true,
      mouseWheelScrollSensitivity: 1,
      fastScrollSensitivity: 5,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalHasArrows: true,
        horizontalHasArrows: true,
        verticalScrollbarSize: 17,
        horizontalScrollbarSize: 17,
        arrowSize: 30
      },
      suggest: {
        insertMode: 'replace',
        filterGraceful: true,
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showIssues: true,
        showUsers: true,
        showWords: true
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true
      },
      quickSuggestionsDelay: 100,
      parameterHints: {
        enabled: true,
        cycle: true
      },
      hover: {
        enabled: true,
        delay: 300,
        sticky: true
      },
      contextmenu: true,
      mouseWheelZoom: true,
      multiCursorModifier: 'ctrlCmd',
      accessibilitySupport: 'auto',
      find: {
        seedSearchStringFromSelection: 'always',
        autoFindInSelection: 'never',
        globalFindClipboard: false,
        addExtraSpaceOnTop: true,
        loop: true
      }
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

      // 注册悬停提供者
      monaco.languages.registerHoverProvider('todo-markdown', todoHoverProvider)

      // 注册语法校验
      todoValidationProvider.register()
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
        language: props.language,
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

      // 启用语法校验
      await nextTick()
      todoValidationProvider.validateModel(model)
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
    const setValue = (value) => {
      if (editor && model && value !== model.getValue()) {
        model.setValue(value)
      }
    }

    // 获取编辑器值
    const getValue = () => {
      return model ? model.getValue() : ''
    }

    // 设置编辑器主题
    const setTheme = (theme) => {
      if (editor) {
        monaco.editor.setTheme(theme)
      }
    }

    // 设置编辑器语言
    const setLanguage = (language) => {
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }

    // 格式化文档
    const formatDocument = () => {
      if (editor) {
        editor.getAction('editor.action.formatDocument').run()
      }
    }

    // 触发建议
    const triggerSuggest = () => {
      if (editor) {
        editor.getAction('editor.action.triggerSuggest').run()
      }
    }

    // 获取编辑器实例
    const getEditor = () => {
      return editor
    }

    // 获取模型实例
    const getModel = () => {
      return model
    }

    // 监听props变化
    watch(() => props.modelValue, (newValue) => {
      setValue(newValue)
    })

    watch(() => props.theme, (newTheme) => {
      setTheme(newTheme)
    })

    watch(() => props.language, (newLanguage) => {
      setLanguage(newLanguage)
    })

    watch(() => props.options, (newOptions) => {
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
        resizeObserver.observe(editorContainer.value)
      }
    })

    onUnmounted(() => {
      destroyEditor()
    })

    // 暴露方法给父组件
    return {
      editorContainer,
      setValue,
      getValue,
      setTheme,
      setLanguage,
      formatDocument,
      triggerSuggest,
      getEditor,
      getModel
    }
  }
}
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