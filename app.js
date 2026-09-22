// Grab the elements we interact with once, so we don't query the DOM repeatedly.
const form = document.querySelector(".composer");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter");

const STORAGE_KEY = "my-little-todo.tasks";

// The single source of truth. Every task is an object so we can persist state,
// not just text. currentFilter drives which subset the render step shows.
let tasks = loadTasks();
let currentFilter = "all";

// Read the saved array back from localStorage. getItem returns null on first
// visit, and a corrupted value would throw in JSON.parse, so both are handled.
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

// Persist after every mutation. The array is serialised to a JSON string
// because localStorage can only store strings.
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Return only the tasks the active filter should show.
function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.done);
  }
  return tasks;
}

// Rebuild the list from state. Rendering from the array (rather than mutating
// individual nodes) keeps the DOM and the data in sync with one code path.
function render() {
  const visible = getVisibleTasks();

  list.innerHTML = "";
  emptyState.hidden = visible.length > 0;

  visible.forEach((task) => {
    const item = document.createElement("li");
    item.className = task.done ? "task done" : "task";
    item.dataset.id = task.id;

    // A real button, so the toggle is keyboard-operable and focusable.
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

// Add a task from the input. Empty or whitespace-only input is rejected before
// anything is stored.
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

// Flip a task between done and not done, matched by id.
function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  render();
}

// Drop a task by id.
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

// The form owns submission, so both the Add button and the Enter key work.
form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

// Filter toggles: update state, reflect the active button, re-render.
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

// First paint, showing whatever was restored from localStorage.
render();
