<template>
  <div ref="editorContainer" class="codemirror-editor"></div>
</template>

<script>
import { ref, onMounted, onUpdated, watch } from 'vue'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'

export default {
  name: 'CodeMirrorEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'scroll'],
  setup(props, { emit }) {
    const editorContainer = ref(null)
    let view = null

    
    const createEditor = () => {
      if (!editorContainer.value) return

      const startState = EditorState.create({
        doc: props.modelValue,
        extensions: [
          lineNumbers(),
          markdown(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              emit('update:modelValue', update.state.doc.toString())
            }
            // 检查是否是滚动更新
            if (update.transactions.some(tr => tr.scrollIntoView)) {
              // 获取滚动信息并触发scroll事件
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
            
            // 检查滚动状态变化
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
      editorContainer
    }
  }
}
</script>

<style scoped>
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
</style>