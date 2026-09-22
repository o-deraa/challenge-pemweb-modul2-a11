const form = document.querySelector(".composer");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter");

const STORAGE_KEY = "my-little-todo.tasks";

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.done);
  }
  return tasks;
}


function render() {
  const visible = getVisibleTasks();

  list.innerHTML = "";
  emptyState.hidden = visible.length > 0;

  visible.forEach((task) => {
    const item = document.createElement("li");
    item.className = task.done ? "task done" : "task";
    item.dataset.id = task.id;

    const text = document.createElement("button");
    text.type = "button";
    text.className = "task-text";
    text.textContent = task.text;
    text.addEventListener("click", () => toggleTask(task.id));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-btn";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteTask(task.id));

    item.append(text, remove);
    list.append(item);
  });
}

function addTask(rawText) {
  const text = rawText.trim();
  if (text === "") {
    return;
  }

  tasks.push({
    id: Date.now().toString(),
    text: text,
    done: false,
  });

  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    render();
  });
});

render();
