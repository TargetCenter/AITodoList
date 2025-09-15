import { createRouter, createWebHistory } from 'vue-router'
import TodoEditor from '../views/TodoEditor.vue'
import TodoGraph from '../views/TodoGraph.vue'

const routes = [
  {
    path: '/',
    name: 'TodoEditor',
    component: TodoEditor
  },
  {
    path: '/graph',
    name: 'TodoGraph',
    component: TodoGraph
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router