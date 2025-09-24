<template>
  <div 
    v-if="visible" 
    class="autocomplete-popup"
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
  >
    <div class="autocomplete-header">
      <span>自动补全</span>
      <span class="hint">TAB确认 上下键选择 ESC取消</span>
    </div>
    <div class="autocomplete-list">
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        :class="['autocomplete-item', { active: index === selectedIndex }]"
        @click="selectItem(item)"
        @mouseenter="selectedIndex = index"
      >
        <div class="item-label">{{ item.label }}</div>
        <div class="item-description">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'AutoComplete',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ top: 0, left: 0 })
    },
    items: {
      type: Array,
      default: () => []
    },
    filter: {
      type: String,
      default: ''
    }
  },
  emits: ['select', 'close'],
  setup(props, { emit }) {
    const selectedIndex = ref(0)

    const filteredItems = computed(() => {
      if (!props.filter) return props.items
      
      return props.items.filter(item => 
        item.label.toLowerCase().includes(props.filter.toLowerCase()) ||
        item.description.toLowerCase().includes(props.filter.toLowerCase())
      )
    })

    const selectItem = (item) => {
      emit('select', item)
    }

    const selectNext = () => {
      if (filteredItems.value.length > 0) {
        selectedIndex.value = (selectedIndex.value + 1) % filteredItems.value.length
      }
    }

    const selectPrevious = () => {
      if (filteredItems.value.length > 0) {
        selectedIndex.value = selectedIndex.value === 0 
          ? filteredItems.value.length - 1 
          : selectedIndex.value - 1
      }
    }

    const selectCurrent = () => {
      if (filteredItems.value[selectedIndex.value]) {
        selectItem(filteredItems.value[selectedIndex.value])
      }
    }

    const close = () => {
      emit('close')
    }

    // 重置选中索引当过滤项改变时
    watch(() => filteredItems.value, () => {
      selectedIndex.value = 0
    })

    // 重置选中索引当显示状态改变时
    watch(() => props.visible, (visible) => {
      if (visible) {
        selectedIndex.value = 0
      }
    })

    return {
      selectedIndex,
      filteredItems,
      selectItem,
      selectNext,
      selectPrevious,
      selectCurrent,
      close
    }
  }
}
</script>

<style scoped>
.autocomplete-popup {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  max-height: 300px;
  overflow: hidden;
}

.autocomplete-header {
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.autocomplete-header span:first-child {
  font-weight: bold;
  color: #333;
}

.hint {
  color: #666;
  font-size: 11px;
}

.autocomplete-list {
  max-height: 250px;
  overflow-y: auto;
}

.autocomplete-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.autocomplete-item:hover,
.autocomplete-item.active {
  background-color: #e6f7ff;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.item-label {
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.item-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 滚动条样式 */
.autocomplete-list::-webkit-scrollbar {
  width: 6px;
}

.autocomplete-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.autocomplete-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.autocomplete-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>