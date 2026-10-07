const STORAGE_KEY = "todo-list-tasks-v2";

const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const completedCount = document.querySelector("#completed-count");
const emptyState = document.querySelector("#empty-state");
const formMessage = document.querySelector("#form-message");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");

const THEME_STORAGE_KEY = "todo-list-theme";

function setTheme(theme, persist = false) {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  themeIcon.textContent = isDark ? "🌙" : "☀️";
  themeLabel.textContent = isDark ? "Тёмная тема" : "Светлая тема";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"
  );
  document.querySelector('meta[name="theme-color"]').content = isDark ? "#101724" : "#f5f7fb";

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch (error) {
      console.error("Не удалось сохранить тему:", error);
    }
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("Не удалось загрузить тему:", error);
    return "light";
  }
}

setTheme(loadTheme());

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme, true);
});

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);
    if (
      !Array.isArray(parsedTasks) ||
      !parsedTasks.every(
        (task) =>
          task &&
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean"
      )
    ) {
      return [];
    }

    return parsedTasks;
  } catch (error) {
    console.error("Не удалось загрузить список задач:", error);
    return [];
  }
}

let tasks = loadTasks();

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    formMessage.textContent = "";
  } catch (error) {
    console.error("Не удалось сохранить список задач:", error);
    formMessage.textContent = "Не удалось сохранить изменения в браузере.";
  }
}

function updateTaskCount() {
  const count = tasks.length;
  taskCount.textContent = count;
  completedCount.textContent = tasks.filter((task) => task.completed).length;
}

function renderTasks() {
  taskList.replaceChildren();

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      `${task.completed ? "Снять отметку" : "Отметить выполненной"}: ${task.text}`
    );
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Удалить";
    deleteButton.setAttribute("aria-label", `Удалить задачу: ${task.text}`);
    deleteButton.addEventListener("click", () => {
      item.classList.add("is-removing");
      item.addEventListener(
        "animationend",
        () => {
          tasks = tasks.filter((currentTask) => currentTask.id !== task.id);
          saveTasks();
          renderTasks();
        },
        { once: true }
      );
    });

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  }

  emptyState.hidden = tasks.length > 0;
  updateTaskCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    formMessage.textContent = "Введите текст задачи.";
    input.focus();
    return;
  }

  tasks.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false
  });
  saveTasks();
  renderTasks();
  form.reset();
  input.focus();
});

renderTasks();
