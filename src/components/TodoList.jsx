import { useState } from "react";

const initialTasks = [
  { id: 1, text: "Belajar useState", done: false },
  { id: 2, text: "Coba bikin daftar tugas", done: false },
];

function TodoList() {
  const [tasks, setTasks] = useState(initialTasks);
  const [inputText, setInputText] = useState("");

  function addTask(event) {
    event.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setTasks((oldTasks) => [
      ...oldTasks,
      { id: Date.now(), text, done: false },
    ]);
    setInputText("");
  }

  function toggleTask(id) {
    setTasks((oldTasks) =>
      oldTasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function deleteTask(id) {
    setTasks((oldTasks) => oldTasks.filter((task) => task.id !== id));
  }

  return (
    <section className="card">
      <p className="card-kicker">DAFTAR TUGAS KECIL</p>
      <form className="todo-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="Tulis tugas yang mau dicoba..."
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          aria-label="Tugas baru"
        />
        <button className="button button-primary" type="submit">Tambah tugas</button>
      </form>
      <ul className="todo-list">
        {tasks.length === 0 ? (
          <li className="empty-hint">Daftarnya masih kosong. Tambah tugas yuk!</li>
        ) : (
          tasks.map((task) => (
            <li className="todo-item" key={task.id}>
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={task.done ? "todo-done" : ""}>{task.text}</span>
              </label>
              <button
                className="delete-button"
                type="button"
                onClick={() => deleteTask(task.id)}
                aria-label={`Hapus ${task.text}`}
              >
                Hapus
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export default TodoList;
