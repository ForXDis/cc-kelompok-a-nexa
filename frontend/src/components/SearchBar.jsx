import { useState } from "react"

function SearchBar({ onSearch, onSortChange }) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Cari item..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          🔍 Cari
        </button>
      </form>

     
    </div>
  )
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    margin: "1rem 0",
  },
  form: {
    display: "flex",
    gap: "0.5rem",
    flex: 1,
  },
  input: {
    flex: 1,
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.6rem 1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  select: {
    padding: "0.6rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
}

export default SearchBar