<template>
  <div class="notion-editor-wrapper">
    <div ref="editorContainer" class="notion-editor"></div>
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
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import AutoComplete from './AutoComplete.vue'
import { getAutoCompleteSuggestions, processTemplate } from '@/utils/autoCompleteData'
import { parseMarkdown } from '@/utils/markdownParser'

export default {
  name: 'NotionEditor',
  components: {
    AutoComplete
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorContainer = ref(null)
    const autoCompleteRef = ref(null)
    let view = null

    const autoCompleteVisible = ref(false)
    const autoCompletePosition = ref({ top: 0, left: 0 })
    const autoCompleteItems = ref([])
    const autoCompleteFilter = ref('')
    const autoCompleteContext = ref({
      line: '',
      cursor: 0,
      lineStart: 0
    })

    const getCurrentTasks = () => {
      try {
        return parseMarkdown(props.modelValue)
      } catch (error) {
        return []
      }
    }

    const showAutoComplete = (line, cursor, lineStart) => {
      const tasks = getCurrentTasks()
      const suggestions = getAutoCompleteSuggestions(line, cursor, tasks)

      autoCompleteItems.value = suggestions.length > 0 ? suggestions : []
      autoCompleteFilter.value = ''
      autoCompleteContext.value = { line, cursor, lineStart }

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

    const hideAutoComplete = () => {
      autoCompleteVisible.value = false
      autoCompleteItems.value = []
      autoCompleteFilter.value = ''
    }

    const onAutoCompleteSelect = (item) => {
      if (!view) return

      const { line, cursor, lineStart } = autoCompleteContext.value
      const beforeCursor = line.substring(0, cursor)

      let { text: insertText, placeholders } = processTemplate(item.insertText)

      let replaceStart = cursor
      let replaceEnd = cursor

      if (item.type === 'task' || item.type.startsWith('task-')) {
        replaceStart = 0
        replaceEnd = line.length
      } else if (item.type === 'date' || item.type === 'time' || item.type === 'datetime') {
        const atIndex = beforeCursor.lastIndexOf('@')
        if (atIndex !== -1) {
          replaceStart = atIndex + 1
        } else {
          insertText = ' @' + insertText
        }
      } else if (item.type === 'duration') {
        const tIndex = beforeCursor.lastIndexOf('T:')
        if (tIndex !== -1) {
          replaceStart = tIndex + 2
        } else {
          insertText = ' T:' + insertText
        }
      } else if (item.type === 'dependency') {
        const arrowIndex = beforeCursor.lastIndexOf('->')
        if (arrowIndex !== -1) {
          replaceStart = arrowIndex + 2
        } else {
          insertText = ' ->' + insertText
        }
      }

      const insertedText = replaceStart === 0 ? insertText : insertText
      view.dispatch({
        changes: {
          from: lineStart + replaceStart,
          to: lineStart + replaceEnd,
          insert: insertedText
        }
      })

      if (placeholders.length > 0) {
        const firstPlaceholder = placeholders[0]
        const newCursorPos = lineStart + replaceStart + firstPlaceholder.start
        view.dispatch({
          selection: {
            anchor: newCursorPos,
            head: newCursorPos + firstPlaceholder.defaultText.length
          }
        })
      } else {
        const newCursorPos = lineStart + replaceStart + insertedText.length
        view.dispatch({
          selection: {
            anchor: newCursorPos,
            head: newCursorPos
          }
        })
      }

      hideAutoComplete()
      view.focus()
    }

    const handleKeyDown = (event) => {
      if (autoCompleteVisible.value) {
        const autoComplete = autoCompleteRef.value
        if (!autoComplete) return false

        switch (event.key) {
          case 'Escape':
            event.preventDefault()
            event.stopPropagation()
            hideAutoComplete()
            view.focus()
            return true
          case 'Tab':
          case 'Enter':
          case ' ':
            event.preventDefault()
            event.stopPropagation()
            autoComplete.selectCurrent()
            return true
          case 'ArrowDown':
            event.preventDefault()
            event.stopPropagation()
            autoComplete.selectNext()
            return true
          case 'ArrowUp':
            event.preventDefault()
            event.stopPropagation()
            autoComplete.selectPrevious()
            return true
          default:
            return false
        }
      }
      return false
    }

    const triggerAutoComplete = () => {
      if (!view) return

      const cursor = view.state.selection.main.head
      const line = view.state.doc.lineAt(cursor)
      const lineText = line.text
      const cursorInLine = cursor - line.from

      showAutoComplete(lineText, cursorInLine, line.from)
    }

    const createEditor = () => {
      if (!editorContainer.value) return

      const startState = EditorState.create({
        doc: props.modelValue,
        extensions: [
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
              key: 'Cmd-Space',
              run: () => {
                triggerAutoComplete()
                return true
              }
            },
            {
              key: 'Mod-Space',
              run: () => {
                triggerAutoComplete()
                return true
              }
            }
          ]),
          EditorView.domEventHandlers({
            keydown: handleKeyDown
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              emit('update:modelValue', update.state.doc.toString())
            }

            if (update.selectionSet && autoCompleteVisible.value) {
              const newSelection = update.state.selection.main
              const oldSelection = update.startState.selection.main
              if (Math.abs(newSelection.head - oldSelection.head) > 10) {
                hideAutoComplete()
              }
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
.notion-editor-wrapper {
  position: relative;
  height: 100%;
  background: #ffffff;
}

.notion-editor {
  height: 100%;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.notion-editor :deep(.cm-editor) {
  height: 100%;
}

.notion-editor :deep(.cm-scroller) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.notion-editor :deep(.cm-content) {
  padding: 0;
}

.notion-editor :deep(.cm-line) {
  padding: 2px 0;
}

.notion-editor :deep(.cm-line:focus) {
  outline: none;
}
</style>
