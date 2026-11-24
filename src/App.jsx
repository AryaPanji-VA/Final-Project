import { useState } from "react";
import Counter from "./components/Counter";
import TodoList from "./components/TodoList";
import DataFetcher from "./components/DataFetcher";
import "./App.css";

const lessons = [
  { id: "counter", label: "Penghitung", note: "Satu nilai dengan useState" },
  { id: "todo", label: "Daftar tugas", note: "Array dan form sederhana" },
  { id: "fetcher", label: "Ambil data", note: "useEffect dan fetch" },
];

function App() {
  const [activeLesson, setActiveLesson] = useState("counter");
  const currentLesson = lessons.find((lesson) => lesson.id === activeLesson);

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="#home" onClick={() => setActiveLesson("counter")}>
          React Hooks <span>belajar bareng</span>
        </a>
        <span className="course-label">Playground pemula</span>
      </header>

      <section className="intro" id="home">
        <p className="eyebrow">PELAN-PELAN, SATU HOOK DULU</p>
        <h1>Belajar sambil melengkapi kodenya.</h1>
        <p className="intro-copy">
          Ada tiga template kecil buat latihan React Hooks. Baca petunjuk TODO,
          coba lengkapi, lalu lihat apa yang berubah.
        </p>
      </section>

      <nav className="lesson-nav" aria-label="Komponen latihan">
        {lessons.map((lesson, index) => (
          <button
            className={`lesson-link ${activeLesson === lesson.id ? "active" : ""}`}
            key={lesson.id}
            onClick={() => setActiveLesson(lesson.id)}
            type="button"
            aria-current={activeLesson === lesson.id ? "page" : undefined}
          >
            <span className="lesson-number">0{index + 1}</span>
            <span>{lesson.label}</span>
          </button>
        ))}
      </nav>

      <section className="lesson-section" aria-live="polite">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KOMPONEN LATIHAN</p>
            <h2>{currentLesson.label}</h2>
          </div>
          <p className="lesson-note">{currentLesson.note}</p>
        </div>
        {activeLesson === "counter" && <Counter />}
        {activeLesson === "todo" && <TodoList />}
        {activeLesson === "fetcher" && <DataFetcher />}
      </section>

      <footer className="page-footer">
        <span>Tugas React Hooks</span>
        <span>Baca petunjuknya, terus coba sendiri. Semangat!</span>
      </footer>
    </main>
  );
}

export default App;
