import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount((angkaLama) => angkaLama + 1);
  }

  function decrement() {
    setCount((angkaLama) => angkaLama - 1);
  }

  function reset() {
    setCount(0);
  }

  return (
    <section className="card">
      <p className="card-kicker">ANGKA SAAT INI</p>
      <p className="counter-display">{count}</p>
      <div className="button-row">
        <button className="button button-secondary" onClick={decrement} type="button" aria-label="Kurangi">−</button>
        <button className="button button-primary" onClick={increment} type="button" aria-label="Tambah">+</button>
        <button className="button button-quiet" onClick={reset} type="button">Ulangi</button>
      </div>
      <p className="helper-text">Coba ubah angkanya, lalu mulai lagi dari nol.</p>
    </section>
  );
}

export default Counter;
