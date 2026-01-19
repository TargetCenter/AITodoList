<template>
  <div
    v-if="visible"
    class="task-input-panel"
    :style="panelStyle"
  >
    <div class="panel-header">
      <span class="panel-title">创建任务</span>
      <button class="close-btn" @click="onCancel">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    <div class="panel-body">
      <div
        v-for="(param, index) in parameters"
        :key="param.key"
        class="param-item"
        :class="{
          'param-active': currentStep === index,
          'param-completed': index < currentStep && values[param.key],
          'param-skipped': index < currentStep && !values[param.key]
        }"
      >
        <div class="param-label">
          <span v-if="index < currentStep && values[param.key]" class="check-icon">✓</span>
          <span v-else class="param-index">{{ index + 1 }}</span>
          <span class="param-name">{{ param.label }}</span>
          <span v-if="!param.required" class="param-optional">(可选)</span>
        </div>
        <input
          v-if="currentStep === index"
          ref="currentInput"
          v-model="values[param.key]"
          type="text"
          :placeholder="param.placeholder"
          class="param-input"
          @keydown="handleKeyDown"
          @blur="handleBlur"
        />
        <div v-else class="param-value">
          {{ values[param.key] || '（跳过）' }}
        </div>
      </div>
    </div>
    <div class="panel-footer">
      <div class="keyboard-hints">
        <span class="hint-item">
          <kbd>Tab</kbd> 下一个
        </span>
        <span class="hint-item">
          <kbd>Shift</kbd>+<kbd>Tab</kbd> 上一个
        </span>
        <span class="hint-item">
          <kbd>Enter</kbd> 完成
        </span>
        <span class="hint-item">
          <kbd>Esc</kbd> 取消
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'

export default {
  name: 'TaskInputPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ top: 0, left: 0 })
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const parameters = [
      { key: 'title', label: '任务名称', placeholder: '请输入任务内容', required: true },
      { key: 'dependencies', label: '依赖任务', placeholder: '例如: #123, #456', required: false },
      { key: 'duration', label: '预计时间', placeholder: '例如: 2h, 30m', required: false },
      { key: 'startTime', label: '开始时间', placeholder: '例如: tomorrow, 2024-01-15', required: false }
    ]

    const currentStep = ref(0)
    const values = ref({
      title: '',
      dependencies: '',
      duration: '',
      startTime: ''
    })
    const currentInput = ref(null)

    const panelStyle = computed(() => ({
      top: `${props.position.top}px`,
      left: `${props.position.left}px`
    }))

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Tab':
          event.preventDefault()
          event.stopPropagation()
          if (event.shiftKey) {
            goToPreviousStep()
          } else {
            goToNextStep()
          }
          break
        case 'Enter':
          event.preventDefault()
          event.stopPropagation()
          if (currentStep.value === parameters.length - 1 || canFinish()) {
            onConfirm()
          } else {
            goToNextStep()
          }
          break
        case 'Escape':
          event.preventDefault()
          event.stopPropagation()
          onCancel()
          break
      }
    }

    const handleBlur = () => {
    }

    const goToNextStep = () => {
      if (currentStep.value < parameters.length - 1) {
        currentStep.value++
        nextTick(() => {
          if (currentInput.value && currentInput.value[0]) {
            currentInput.value[0].focus()
          }
        })
      }
    }

    const goToPreviousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
        nextTick(() => {
          if (currentInput.value && currentInput.value[0]) {
            currentInput.value[0].focus()
          }
        })
      }
    }

    const canFinish = () => {
      return values.value.title.trim() !== ''
    }

    const onConfirm = () => {
      if (!canFinish()) {
        return
      }
      emit('confirm', { ...values.value })
      reset()
    }

    const onCancel = () => {
      emit('cancel')
      reset()
    }

    const reset = () => {
      currentStep.value = 0
      values.value = {
        title: '',
        dependencies: '',
        duration: '',
        startTime: ''
      }
    }

    watch(() => props.visible, (newVal) => {
      if (newVal) {
        reset()
        nextTick(() => {
          if (currentInput.value && currentInput.value[0]) {
            currentInput.value[0].focus()
          }
        })
      }
    })

    return {
      parameters,
      currentStep,
      values,
      currentInput,
      panelStyle,
      handleKeyDown,
      handleBlur,
      goToNextStep,
      goToPreviousStep,
      canFinish,
      onConfirm,
      onCancel
    }
  }
}
</script>

<style scoped>
.task-input-panel {
  position: fixed;
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.panel-body {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.param-item {
  margin-bottom: 12px;
  padding: 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.param-item.param-active {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}

.param-item.param-completed {
  background: #e8f5e9;
  border: 1px solid #4caf50;
}

.param-item.param-skipped {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  opacity: 0.7;
}

.param-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
}

.check-icon {
  color: #4caf50;
  font-weight: bold;
}

.param-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #e0e0e0;
  border-radius: 50%;
  font-size: 11px;
  color: #666;
}

.param-name {
  color: #333;
}

.param-optional {
  color: #999;
  font-size: 11px;
  font-weight: normal;
}

.param-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: border 0.2s;
}

.param-input:focus {
  border-color: #2196f3;
}

.param-value {
  padding: 8px 12px;
  font-size: 13px;
  color: #666;
}

.panel-footer {
  padding: 12px 16px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.keyboard-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #666;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-item kbd {
  padding: 2px 6px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
