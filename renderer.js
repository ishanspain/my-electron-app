const STORAGE_KEY = 'electron-todos'

const form = document.getElementById('todo-form')
const input = document.getElementById('todo-input')
const list = document.getElementById('todo-list')
const emptyState = document.getElementById('empty-state')
const itemsLeft = document.getElementById('items-left')
const clearCompletedButton = document.getElementById('clear-completed')
const filterButtons = document.querySelectorAll('.filter')

let todos = loadTodos()
let currentFilter = 'all'

document.getElementById('today').textContent = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
}).format(new Date())

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function getVisibleTodos() {
  if (currentFilter === 'active') return todos.filter((todo) => !todo.completed)
  if (currentFilter === 'completed') return todos.filter((todo) => todo.completed)
  return todos
}

function render() {
  list.replaceChildren()
  const visibleTodos = getVisibleTodos()

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li')
    item.className = `todo-item${todo.completed ? ' completed' : ''}`
    item.dataset.id = todo.id

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.setAttribute('aria-label', `Mark ${todo.text} as complete`)

    const text = document.createElement('span')
    text.className = 'todo-text'
    text.textContent = todo.text

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'delete-button'
    deleteButton.setAttribute('aria-label', `Delete ${todo.text}`)
    deleteButton.textContent = '×'

    item.append(checkbox, text, deleteButton)
    list.append(item)
  })

  const remaining = todos.filter((todo) => !todo.completed).length
  itemsLeft.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`
  emptyState.hidden = visibleTodos.length !== 0
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed)
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const text = input.value.trim()
  if (!text) return

  todos.unshift({ id: crypto.randomUUID(), text, completed: false })
  saveTodos()
  render()
  form.reset()
  input.focus()
})

list.addEventListener('change', (event) => {
  if (event.target.type !== 'checkbox') return
  const id = event.target.closest('.todo-item').dataset.id
  const todo = todos.find((item) => item.id === id)
  if (todo) todo.completed = event.target.checked
  saveTodos()
  render()
})

list.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-button')
  if (!deleteButton) return
  const id = deleteButton.closest('.todo-item').dataset.id
  todos = todos.filter((todo) => todo.id !== id)
  saveTodos()
  render()
})

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter
    filterButtons.forEach((item) => item.classList.toggle('active', item === button))
    render()
  })
})

clearCompletedButton.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed)
  saveTodos()
  render()
})

render()
