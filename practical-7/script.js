const list = document.getElementById('todo-list');
const itemCountSpan = document.getElementById('item-count');
const uncheckedCountSpan = document.getElementById('unchecked-count');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodo(todo) {
    return `
        <li class="list-group-item" id="todo-${todo.id}">
            <input 
                type="checkbox" 
                class="form-check-input me-2" 
                id="${todo.id}" 
                ${todo.checked ? 'checked' : ''}
                onchange="checkTodo(${todo.id})"
            />
            <label for="${todo.id}">
                <span class="${todo.checked ? 'text-success text-decoration-line-through' : ''}">
                    ${todo.text}
                </span>
            </label>
            <button class="btn btn-danger btn-sm float-end" onclick="deleteTodo(${todo.id})">
                delete
            </button>
        </li>
    `;
}

function render(todosArray) {
    list.innerHTML = todosArray.map(todo => renderTodo(todo)).join('');
}

function updateCounter() {
    itemCountSpan.textContent = todos.length;
    uncheckedCountSpan.textContent = todos.filter(todo => !todo.checked).length;
}

function newTodo() {
    const text = prompt('Введіть нове завдання:');
    if (!text || text.trim() === '') return;

    const todo = {
        id: Date.now(),
        text: text.trim(),
        checked: false
    };

    todos.push(todo);
    saveTodos();
    render(todos);
    updateCounter();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render(todos);
    updateCounter();
}

function checkTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    todo.checked = !todo.checked;
    saveTodos();
    render(todos);
    updateCounter();
}

render(todos);
updateCounter();