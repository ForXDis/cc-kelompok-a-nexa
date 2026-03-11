import { useState, useEffect, useCallback, useMemo } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import ItemForm from "./components/ItemForm"
import ItemList from "./components/ItemList"
import { fetchItems, createItem, updateItem, deleteItem, checkHealth } from "./services/api"

function App() {

  // ==================== STATE ====================
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // SORT STATE
  const [sortType, setSortType] = useState("name-asc")

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true)

    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)

    } catch (err) {
      console.error("Error loading items:", err)

    } finally {
      setLoading(false)
    }
  }, [])

  // ==================== ON MOUNT ====================
  useEffect(() => {
    checkHealth().then(setIsConnected)
    loadItems()
  }, [loadItems])

  // ==================== SORTING ====================
  const sortedItems = useMemo(() => {

    const sorted = [...items]

    switch (sortType) {

      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))

      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))

      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price)

      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price)

      default:
        return sorted
    }

  }, [items, sortType])

  // ==================== HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {

    if (editId) {
      await updateItem(editId, itemData)
      setEditingItem(null)

    } else {
      await createItem(itemData)
    }

    loadItems(searchQuery)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {

    const item = items.find((i) => i.id === id)

    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return

    try {
      await deleteItem(id)
      loadItems(searchQuery)

    } catch (err) {
      alert("Gagal menghapus: " + err.message)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const handleSortChange = (e) => {
    setSortType(e.target.value)
  }

  // ==================== RENDER ====================
  return (

    <div style={styles.app}>
      <div style={styles.container}>

        <Header
          totalItems={totalItems}
          isConnected={isConnected}
        />

        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />

        <SearchBar onSearch={handleSearch} />

        {/* SORTING BAR */}
        <div style={styles.sortContainer}>

          <div style={styles.sortBox}>

            <span style={styles.sortLabel}>
              Urutkan:
            </span>

            <select
              value={sortType}
              onChange={handleSortChange}
              style={styles.sortSelect}
            >
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
              <option value="price-asc">Harga Termurah</option>
              <option value="price-desc">Harga Termahal</option>
              <option value="new-acs">Terbaru</option>
            </select>

          </div>

          <span style={styles.itemCount}>
            {sortedItems.length} item
          </span>

        </div>

        <ItemList
          items={sortedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

      </div>
    </div>
  )
}

const styles = {

  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },

  sortContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "1rem 0",
  },

  sortBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  sortLabel: {
    fontSize: "0.9rem",
    color: "#555",
  },

  sortSelect: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    fontSize: "0.9rem",
    cursor: "pointer",
  },

  itemCount: {
    fontSize: "0.85rem",
    color: "#777",
  }

}

export default App