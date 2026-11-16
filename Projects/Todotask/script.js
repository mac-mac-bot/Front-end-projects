
const taskInput = document.getElementById("task-input");
const addButton = document.getElementById("add-btn");
const taskList = document.querySelector(".task-list");

const progressFill = document.querySelector(".progress-fill");
const progressText = document.querySelector(".progress-text");
const completedText = document.querySelector(".progress p");

// Add task
addButton.addEventListener("click", addTask);

function addTask() {
    const task = taskInput.value.trim();

    if (task === "") {
        alert("Please enter a task");
        return;
    }

    taskList.appendChild(createTaskElement(task));
    taskInput.value = "";

    updateProgress();
    saveTasks();
}

// Create task element
function createTaskElement(task, isCompleted = false) {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.classList.add("task-checkbox");
    checkbox.type = "checkbox";
    checkbox.checked = isCompleted;

    if (isCompleted) {
        taskItem.classList.add("completed");
    }

    checkbox.addEventListener("change", function() {
        taskItem.classList.toggle("completed", checkbox.checked);
        updateProgress();
        saveTasks();
    });

    taskItem.appendChild(checkbox);

    // Task text
    taskItem.appendChild(document.createTextNode(task));

    // Delete button
    const remove = document.createElement("button");
    remove.classList.add("task-remove");
    remove.textContent = "Delete";

    remove.addEventListener("click", function() {
        taskItem.remove();
        updateProgress();
        saveTasks();
    });

    taskItem.appendChild(remove);

    return taskItem;
}

// Update progress bar
function updateProgress() {
    const total = taskList.children.length;
    const completed = taskList.querySelectorAll(".completed").length;

    const percentage = total === 0
        ? 0
        : (completed / total) * 100;

    progressFill.style.width = percentage + "%";
    progressText.textContent = Math.round(percentage) + "%";
    completedText.textContent = `Tasks completed: ${completed}/${total}`;
}

// Save tasks to localStorage
function saveTasks() {
    const taskElements = document.querySelectorAll(".task-item");
    const tasks = [];

    taskElements.forEach(function(taskItem) {
        const checkbox = taskItem.querySelector(".task-checkbox");
        const completed = checkbox.checked;
        const text = taskItem.childNodes[1].textContent;

        tasks.push({
            text: text,
            completed: completed
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load saved tasks
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

    savedTasks.forEach(function(task) {
        taskList.appendChild(
            createTaskElement(task.text, task.completed)
        );
    });

    updateProgress();
}

// Restore tasks when page loads
loadTasks();
