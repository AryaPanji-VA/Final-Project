import { useEffect, useState } from "react";

const API_URL = "https://jsonplaceholder.typicode.com/users";

function DataFetcher() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Permintaan data gagal. Coba lagi sebentar ya.");
        }
        const data = await response.json();
        setUsers(data);
      } catch (requestError) {
        setError(requestError.message || "Ada kendala saat mengambil data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <section className="card">
      <p className="card-kicker">PENGGUNA DARI API PUBLIK</p>
      {isLoading ? (
        <p className="status-box" role="status">Lagi mengambil data pengguna...</p>
      ) : error ? (
        <p className="status-box" role="alert">{error}</p>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
            <li className="user-item" key={user.id}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className="user-company">{user.company.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default DataFetcher;
