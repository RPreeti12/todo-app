let tasks = JSON.parse(localStorage.getItem("tasks")) || []
let currentFilter = "all"

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  renderTasks()
  updateStats()
  setupEventListeners()
})

function setupEventListeners() {
  // Input character counter
  const taskInput = document.getElementById("taskInput")
  const charCounter = document.getElementById("charCounter")

  taskInput.addEventListener("input", function () {
    const length = this.value.length
    charCounter.textContent = `${length}/100`

    if (length > 80) {
      charCounter.style.color = "#ff6b6b"
    } else {
      charCounter.style.color = "rgba(255, 255, 255, 0.6)"
    }
  })

  // Enter key to add task
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTask()
    }
  })

  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterButtons.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      currentFilter = this.dataset.filter
      renderTasks()
    })
  })
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

function updateStats() {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length

  document.getElementById("totalTasks").textContent = totalTasks
  document.getElementById("completedTasks").textContent = completedTasks
}

function renderTasks() {
  const taskList = document.getElementById("taskList")
  const emptyState = document.getElementById("emptyState")

  // Filter tasks based on current filter
  let filteredTasks = tasks
  if (currentFilter === "pending") {
    filteredTasks = tasks.filter((task) => !task.completed)
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed)
  }

  taskList.innerHTML = ""

  if (filteredTasks.length === 0) {
    emptyState.classList.remove("hidden")
    if (currentFilter === "pending") {
      emptyState.querySelector("h3").textContent = "No pending tasks!"
      emptyState.querySelector("p").textContent = "Great job! You're all caught up."
    } else if (currentFilter === "completed") {
      emptyState.querySelector("h3").textContent = "No completed tasks yet!"
      emptyState.querySelector("p").textContent = "Complete some tasks to see them here."
    } else {
      emptyState.querySelector("h3").textContent = "No tasks yet!"
      emptyState.querySelector("p").textContent = "Add a task above to get started."
    }
  } else {
    emptyState.classList.add("hidden")

    filteredTasks.forEach((task, index) => {
      const originalIndex = tasks.indexOf(task)
      const li = document.createElement("li")
      li.className = "task-item"

      li.innerHTML = `
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? "checked" : ""}" 
                         onclick="toggleComplete(${originalIndex})"></div>
                    <span class="task-text ${task.completed ? "completed" : ""}">${escapeHtml(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="task-btn complete-btn" onclick="toggleComplete(${originalIndex})" 
                            title="${task.completed ? "Mark as pending" : "Mark as complete"}">
                        <i class="fas ${task.completed ? "fa-undo" : "fa-check"}"></i>
                    </button>
                    <button class="task-btn delete-btn" onclick="deleteTask(${originalIndex})" 
                            title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `

      taskList.appendChild(li)
    })
  }

  updateStats()
}

function addTask() {
  const input = document.getElementById("taskInput")
  const text = input.value.trim()

  if (text === "") {
    showToast("Please enter a task!", "error")
    return
  }

  if (text.length > 100) {
    showToast("Task is too long! Maximum 100 characters.", "error")
    return
  }

  // Check for duplicate tasks
  if (tasks.some((task) => task.text.toLowerCase() === text.toLowerCase())) {
    showToast("This task already exists!", "warning")
    return
  }

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
  }

  tasks.unshift(newTask) // Add to beginning of array
  input.value = ""
  document.getElementById("charCounter").textContent = "0/100"
  document.getElementById("charCounter").style.color = "rgba(255, 255, 255, 0.6)"

  saveTasks()
  renderTasks()
  showToast("Task added successfully!", "success")
}

function deleteTask(index) {
  const task = tasks[index]
  tasks.splice(index, 1)
  saveTasks()
  renderTasks()
  showToast(`"${task.text}" deleted!`, "info")
}

function toggleComplete(index) {
  const task = tasks[index]
  task.completed = !task.completed
  saveTasks()
  renderTasks()

  if (task.completed) {
    showToast("Task completed! 🎉", "success")
  } else {
    showToast("Task marked as pending", "info")
  }
}

function clearAllTasks() {
  if (tasks.length === 0) {
    showToast("No tasks to clear!", "warning")
    return
  }

  if (confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
    tasks = []
    saveTasks()
    renderTasks()
    showToast("All tasks cleared!", "info")
  }
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast")
  const toastIcon = toast.querySelector(".toast-icon")
  const toastMessage = toast.querySelector(".toast-message")

  // Set icon based on type
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  }

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  }

  toastIcon.className = icons[type]
  toastIcon.style.color = colors[type]
  toastMessage.textContent = message

  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Initialize on page load
renderTasks()
