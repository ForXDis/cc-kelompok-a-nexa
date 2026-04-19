import { useState, useEffect } from "react"
import {
  fetchKelas, createKelas, updateKelas, deleteKelas,
  fetchKelasDetail, fetchEnrolledMurids, enrollMurid, unenrollMurid,
  fetchMateris, createMateri, updateMateri, deleteMateri,
  fetchTugas, createTugas, updateTugas, deleteTugas,
  giveNilai,
  fetchPresensis, createPresensi,
  fetchMurids,
  fetchPengumpulanByTugas,
} from "../services/api"

// Demo Mode Data
const isDemoMode = () => localStorage.getItem("demo_mode") === "true"

// Class theme colors - matching MuridDashboard
const CLASS_THEMES = {
  matematika: {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#667eea",
    lightBg: "#EEF2FF",
    icon: "+"
  },
  inggris: {
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#f5576c",
    lightBg: "#FFF1F2",
    icon: "A"
  },
  fisika: {
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "#4facfe",
    lightBg: "#E0F7FF",
    icon: "F"
  },
  default: {
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "#11998e",
    lightBg: "#E6FFF5",
    icon: "K"
  }
}

const getClassTheme = (className) => {
  if (!className) return CLASS_THEMES.default
  const name = className.toLowerCase()
  if (name.includes("matematika") || name.includes("math")) return CLASS_THEMES.matematika
  if (name.includes("inggris") || name.includes("english")) return CLASS_THEMES.inggris
  if (name.includes("fisika") || name.includes("physics")) return CLASS_THEMES.fisika
  return CLASS_THEMES.default
}

const DEMO_KELAS = [
  { id: 1, nama_kelas: "Matematika Dasar", deskripsi: "Kelas matematika untuk pemula", guru_id: 1 },
  { id: 2, nama_kelas: "Bahasa Inggris", deskripsi: "Kelas bahasa Inggris conversation", guru_id: 1 },
  { id: 3, nama_kelas: "Fisika SMA", deskripsi: "Fisika untuk persiapan UTBK", guru_id: 1 },
]

const DEMO_MURIDS = [
  { id: 2, name: "Ahmad Rizki", email: "ahmad@demo.com" },
  { id: 3, name: "Siti Nurhaliza", email: "siti@demo.com" },
  { id: 4, name: "Budi Santoso", email: "budi@demo.com" },
]

const DEMO_MATERIS = [
  { id: 1, kelas_id: 1, judul: "Pengenalan Aljabar", konten: "Materi dasar aljabar meliputi variabel, konstanta, dan operasi dasar." },
  { id: 2, kelas_id: 1, judul: "Persamaan Linear", konten: "Cara menyelesaikan persamaan linear satu variabel." },
  { id: 3, kelas_id: 2, judul: "Basic Grammar", konten: "Tenses, articles, dan struktur kalimat dasar." },
]

const DEMO_TUGAS = [
  { id: 1, kelas_id: 1, judul: "Latihan Aljabar", deskripsi: "Kerjakan 10 soal aljabar", deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
  { id: 2, kelas_id: 1, judul: "Quiz Persamaan Linear", deskripsi: "Quiz singkat persamaan linear", deadline: new Date(Date.now() + 3*24*60*60*1000).toISOString() },
]

// Navigation tabs
const TABS = {
  KELAS: "kelas",
  MATERI: "materi",
  TUGAS: "tugas",
  NILAI: "nilai",
  PRESENSI: "presensi",
}

function GuruDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(TABS.KELAS)
  const [kelasList, setKelasList] = useState([])
  const [selectedKelasId, setSelectedKelasId] = useState(null)
  const [selectedKelasDetail, setSelectedKelasDetail] = useState(null)
  const [enrolledMurids, setEnrolledMurids] = useState([])
  const [muridList, setMuridList] = useState([])
  const [materis, setMateris] = useState([])
  const [tugass, setTugass] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState("")
  const [modalData, setModalData] = useState(null)

  // Demo mode state
  const [demoKelasList, setDemoKelasList] = useState(DEMO_KELAS)
  const [demoMateris, setDemoMateris] = useState(DEMO_MATERIS)
  const [demoTugas, setDemoTugas] = useState(DEMO_TUGAS)
  const [demoEnrolled, setDemoEnrolled] = useState([
    { id: 1, murid_id: 2, murid: DEMO_MURIDS[0] },
    { id: 2, murid_id: 3, murid: DEMO_MURIDS[1] },
  ])

  useEffect(() => {
    loadKelas()
    loadMurids()
  }, [])

  useEffect(() => {
    if (selectedKelasId) {
      loadKelasDetail(selectedKelasId)
      loadEnrolledMurids(selectedKelasId)
      loadMateris(selectedKelasId)
      loadTugass(selectedKelasId)
    } else {
      setSelectedKelasDetail(null)
      setEnrolledMurids([])
      setMateris([])
      setTugass([])
    }
  }, [selectedKelasId])

  const loadKelas = async () => {
    setLoading(true)
    if (isDemoMode()) {
      setKelasList(demoKelasList)
      setLoading(false)
      return
    }
    try {
      const data = await fetchKelas()
      setKelasList(data.kelass || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMurids = async () => {
    if (isDemoMode()) {
      setMuridList(DEMO_MURIDS)
      return
    }
    try {
      const data = await fetchMurids()
      setMuridList(data || [])
    } catch (err) {
      console.error("Error load murids:", err)
    }
  }

  const loadKelasDetail = async (kelasId) => {
    if (isDemoMode()) {
      const kelas = demoKelasList.find(k => k.id === kelasId)
      setSelectedKelasDetail(kelas)
      return
    }
    try {
      const data = await fetchKelasDetail(kelasId)
      setSelectedKelasDetail(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadEnrolledMurids = async (kelasId) => {
    if (isDemoMode()) {
      setEnrolledMurids(demoEnrolled.filter(e => e.kelas_id === kelasId || true))
      return
    }
    try {
      const data = await fetchEnrolledMurids(kelasId)
      setEnrolledMurids(data.enrollments || [])
    } catch (err) {
      console.error("Error load enrolled:", err)
    }
  }

  const loadMateris = async (kelasId) => {
    if (isDemoMode()) {
      setMateris(demoMateris.filter(m => m.kelas_id === kelasId))
      return
    }
    try {
      const data = await fetchMateris(kelasId)
      setMateris(data.materis || [])
    } catch (err) {
      console.error("Error load materis:", err)
    }
  }

  const loadTugass = async (kelasId) => {
    if (isDemoMode()) {
      setTugass(demoTugas.filter(t => t.kelas_id === kelasId))
      return
    }
    try {
      const data = await fetchTugas(kelasId)
      setTugass(data.tugass || [])
    } catch (err) {
      console.error("Error load tugass:", err)
    }
  }

  const handleSelectKelas = (kelas) => {
    setSelectedKelasId(kelas.id)
  }

  const openModal = (mode, data = null) => {
    setModalMode(mode)
    setModalData(data)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalMode("")
    setModalData(null)
  }

  const handleSaveKelas = async (formData) => {
    if (isDemoMode()) {
      if (modalData) {
        setDemoKelasList(prev => prev.map(k => k.id === modalData.id ? { ...k, ...formData } : k))
      } else {
        const newKelas = { id: Date.now(), ...formData, guru_id: 1 }
        setDemoKelasList(prev => [...prev, newKelas])
        setSelectedKelasId(newKelas.id)
      }
      setKelasList(isDemoMode() ? demoKelasList : kelasList)
      closeModal()
      return
    }
    try {
      if (modalData) {
        await updateKelas(modalData.id, formData)
        loadKelas()
      } else {
        const newKelas = await createKelas(formData)
        loadKelas()
        if (newKelas?.id) {
          setSelectedKelasId(newKelas.id)
        }
      }
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteKelas = async (id) => {
    if (!confirm("Yakin hapus kelas ini?")) return
    if (isDemoMode()) {
      setDemoKelasList(prev => prev.filter(k => k.id !== id))
      setSelectedKelasId(null)
      return
    }
    try {
      await deleteKelas(id)
      setSelectedKelasId(null)
      loadKelas()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaveMateri = async (formData) => {
    if (isDemoMode()) {
      if (modalData) {
        setDemoMateris(prev => prev.map(m => m.id === modalData.id ? { ...m, ...formData } : m))
      } else {
        const newMateri = { id: Date.now(), kelas_id: selectedKelasId, ...formData }
        setDemoMateris(prev => [...prev, newMateri])
      }
      loadMateris(selectedKelasId)
      closeModal()
      return
    }
    try {
      if (modalData) {
        await updateMateri(modalData.id, formData)
      } else {
        await createMateri({ ...formData, kelas_id: selectedKelasId })
      }
      loadMateris(selectedKelasId)
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteMateri = async (id) => {
    if (isDemoMode()) {
      setDemoMateris(prev => prev.filter(m => m.id !== id))
      loadMateris(selectedKelasId)
      return
    }
    try {
      await deleteMateri(id)
      loadMateris(selectedKelasId)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaveTugas = async (formData) => {
    if (isDemoMode()) {
      if (modalData) {
        setDemoTugas(prev => prev.map(t => t.id === modalData.id ? { ...t, ...formData } : t))
      } else {
        const newTugas = { id: Date.now(), kelas_id: selectedKelasId, ...formData }
        setDemoTugas(prev => [...prev, newTugas])
      }
      loadTugass(selectedKelasId)
      closeModal()
      return
    }
    try {
      if (modalData) {
        await updateTugas(modalData.id, formData)
      } else {
        await createTugas({ ...formData, kelas_id: selectedKelasId })
      }
      loadTugass(selectedKelasId)
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteTugas = async (id) => {
    if (isDemoMode()) {
      setDemoTugas(prev => prev.filter(t => t.id !== id))
      loadTugass(selectedKelasId)
      return
    }
    try {
      await deleteTugas(id)
      loadTugass(selectedKelasId)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSavePresensi = async (formData) => {
    try {
      await createPresensi({ ...formData, kelas_id: selectedKelasId })
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaveNilai = async (formData) => {
    try {
      await giveNilai(modalData.id, formData)
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEnrollMurid = async (muridId) => {
    if (!selectedKelasId) return
    try {
      await enrollMurid(selectedKelasId, parseInt(muridId))
      loadEnrolledMurids(selectedKelasId)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUnenrollMurid = async (muridId) => {
    if (!selectedKelasId) return
    try {
      await unenrollMurid(selectedKelasId, muridId)
      loadEnrolledMurids(selectedKelasId)
    } catch (err) {
      setError(err.message)
    }
  }

  const enrolledIds = enrolledMurids.map(e => e.murid_id)
  const selectedTheme = selectedKelasDetail ? getClassTheme(selectedKelasDetail.nama_kelas) : CLASS_THEMES.default

  // Stats for hero section
  const totalMateris = materis.length
  const totalTugas = tugass.length
  const totalMurids = enrolledMurids.length

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>Studyfy</div>
          <span style={styles.roleTag}>Guru</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
            <span style={styles.userName}>{user.name}</span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>Keluar</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {[
            { key: TABS.KELAS, label: "Kelas Saya", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            )},
            { key: TABS.MATERI, label: "Materi", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            )},
            { key: TABS.TUGAS, label: "Tugas", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            )},
            { key: TABS.NILAI, label: "Nilai", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )},
            { key: TABS.PRESENSI, label: "Presensi", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            )},
          ].map(tab => (
            <button 
              key={tab.key}
              style={{
                ...styles.navBtn,
                ...(activeTab === tab.key ? styles.navBtnActive : {})
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {error && (
          <div style={styles.errorBanner}>
            <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
            <button onClick={() => setError("")} style={styles.errorClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Kelas Tab */}
        {activeTab === TABS.KELAS && (
          <div>
            {/* Hero Section */}
            <div style={styles.heroSection}>
              <div style={styles.heroContent}>
                <span style={styles.heroGreeting}>Selamat Mengajar</span>
                <h1 style={styles.heroTitle}>Dashboard Guru</h1>
                <p style={styles.heroSubtitle}>
                  Kelola kelas, materi, dan tugas untuk murid-murid Anda.
                </p>
              </div>
              <div style={styles.heroStats}>
                <div style={styles.heroStatItem}>
                  <span style={styles.heroStatNumber}>{kelasList.length}</span>
                  <span style={styles.heroStatLabel}>Kelas Aktif</span>
                </div>
                <div style={styles.heroStatItem}>
                  <span style={styles.heroStatNumber}>
                    {kelasList.reduce((acc) => acc + 3, 0)}
                  </span>
                  <span style={styles.heroStatLabel}>Total Materi</span>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Kelas Saya</h2>
              <button onClick={() => openModal("kelas")} style={styles.addButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Kelas
              </button>
            </div>

            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Memuat kelas...</p>
              </div>
            ) : (
              <div style={styles.kelasGrid}>
                {kelasList.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIconLarge}>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                    <h3 style={styles.emptyTitle}>Belum ada kelas</h3>
                    <p style={styles.emptyText}>Buat kelas baru untuk memulai mengajar.</p>
                  </div>
                ) : kelasList.map((kelas, index) => {
                  const theme = getClassTheme(kelas.nama_kelas)
                  const isSelected = selectedKelasId === kelas.id
                  return (
                    <div
                      key={kelas.id}
                      style={{
                        ...styles.kelasCard,
                        ...(isSelected ? styles.kelasCardActive : {}),
                        animationDelay: `${index * 0.1}s`
                      }}
                      onClick={() => handleSelectKelas(kelas)}
                      className="kelas-card"
                    >
                      {/* Card Gradient Header */}
                      <div style={{
                        ...styles.kelasCardHeader,
                        background: theme.gradient,
                      }}>
                        <div style={styles.kelasCardOverlay}>
                          <div style={styles.kelasIconBadge}>
                            {theme.icon}
                          </div>
                          {isSelected && (
                            <span style={styles.selectedBadge}>Dipilih</span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div style={styles.kelasCardBody}>
                        <h3 style={styles.kelasName}>{kelas.nama_kelas}</h3>
                        <p style={styles.kelasDesc}>{kelas.deskripsi || "Tanpa deskripsi"}</p>

                        <div style={styles.kelasCardFooter}>
                          <div style={styles.kelasCardActions}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); openModal("kelas", kelas); }} 
                              style={styles.actionBtnEdit}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteKelas(kelas.id); }} 
                              style={styles.actionBtnDelete}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Selected Kelas Detail Panel */}
            {selectedKelasDetail && (
              <div style={styles.detailPanel}>
                <div style={{
                  ...styles.detailPanelHeader,
                  background: selectedTheme.gradient,
                }}>
                  <div style={styles.detailPanelHeaderContent}>
                    <div style={styles.detailPanelIcon}>{selectedTheme.icon}</div>
                    <div>
                      <h3 style={styles.detailPanelTitle}>{selectedKelasDetail.nama_kelas}</h3>
                      <p style={styles.detailPanelSubtitle}>{enrolledMurids.length} murid terdaftar</p>
                    </div>
                  </div>
                </div>

                <div style={styles.detailPanelBody}>
                  <div style={styles.enrollSection}>
                    <h4 style={styles.enrollTitle}>Daftarkan Murid Baru</h4>
                    <select
                      style={styles.selectInput}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleEnrollMurid(e.target.value)
                          e.target.value = ""
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">-- Pilih Murid --</option>
                      {muridList
                        .filter(m => !enrolledIds.includes(m.id))
                        .map(m => (
                          <option key={m.id} value={m.id}>{m.name || m.nama} ({m.email})</option>
                        ))}
                    </select>
                  </div>

                  <div style={styles.muridListSection}>
                    <h4 style={styles.muridListTitle}>Murid Terdaftar</h4>
                    {enrolledMurids.length === 0 ? (
                      <p style={styles.noMurid}>Belum ada murid terdaftar</p>
                    ) : (
                      <div style={styles.muridList}>
                        {enrolledMurids.map(e => (
                          <div key={e.id} style={styles.muridItem}>
                            <div style={styles.muridItemLeft}>
                              <div style={{
                                ...styles.muridAvatar,
                                backgroundColor: selectedTheme.color
                              }}>
                                {(e.murid?.name || e.murid?.nama || "M").charAt(0).toUpperCase()}
                              </div>
                              <span style={styles.muridName}>{e.murid?.name || e.murid?.nama || `Murid #${e.murid_id}`}</span>
                            </div>
                            <button 
                              onClick={() => handleUnenrollMurid(e.murid_id)} 
                              style={styles.removeMuridBtn}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Materi Tab */}
        {activeTab === TABS.MATERI && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={{
                  ...styles.tabHeader,
                  background: selectedTheme.gradient,
                }}>
                  <div style={styles.tabHeaderContent}>
                    <div style={styles.tabHeaderIcon}>{selectedTheme.icon}</div>
                    <div>
                      <h2 style={styles.tabHeaderTitle}>Materi</h2>
                      <p style={styles.tabHeaderSubtitle}>{selectedKelasDetail?.nama_kelas}</p>
                    </div>
                  </div>
                  <button onClick={() => openModal("materi")} style={styles.addButtonWhite}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Tambah Materi
                  </button>
                </div>

                <div style={styles.itemGrid}>
                  {materis.length === 0 ? (
                    <div style={styles.emptyStateSmall}>
                      <p>Belum ada materi untuk kelas ini</p>
                    </div>
                  ) : materis.map((m, index) => (
                    <div key={m.id} style={{...styles.itemCard, animationDelay: `${index * 0.1}s`}} className="item-card">
                      <div style={{
                        ...styles.itemCardNumber,
                        background: selectedTheme.gradient
                      }}>
                        {index + 1}
                      </div>
                      <div style={styles.itemCardContent}>
                        <h4 style={styles.itemCardTitle}>{m.judul}</h4>
                        <p style={styles.itemCardDesc}>{m.konten || "Tanpa konten"}</p>
                      </div>
                      <div style={styles.itemCardActions}>
                        <button onClick={() => openModal("materi", m)} style={styles.iconBtn}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteMateri(m.id)} style={styles.iconBtnDanger}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <SelectKelasPrompt onGoToKelas={() => setActiveTab(TABS.KELAS)} />
            )}
          </div>
        )}

        {/* Tugas Tab */}
        {activeTab === TABS.TUGAS && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={{
                  ...styles.tabHeader,
                  background: selectedTheme.gradient,
                }}>
                  <div style={styles.tabHeaderContent}>
                    <div style={styles.tabHeaderIcon}>{selectedTheme.icon}</div>
                    <div>
                      <h2 style={styles.tabHeaderTitle}>Tugas</h2>
                      <p style={styles.tabHeaderSubtitle}>{selectedKelasDetail?.nama_kelas}</p>
                    </div>
                  </div>
                  <button onClick={() => openModal("tugas")} style={styles.addButtonWhite}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Tambah Tugas
                  </button>
                </div>

                <div style={styles.itemGrid}>
                  {tugass.length === 0 ? (
                    <div style={styles.emptyStateSmall}>
                      <p>Belum ada tugas untuk kelas ini</p>
                    </div>
                  ) : tugass.map((t, index) => {
                    const isExpired = new Date(t.deadline) < new Date()
                    return (
                      <div 
                        key={t.id} 
                        style={{
                          ...styles.itemCard,
                          ...(isExpired ? styles.itemCardExpired : {}),
                          animationDelay: `${index * 0.1}s`
                        }} 
                        className="item-card"
                      >
                        <div style={{
                          ...styles.itemCardNumber,
                          background: isExpired ? "#EF4444" : selectedTheme.gradient
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                        </div>
                        <div style={styles.itemCardContent}>
                          <h4 style={styles.itemCardTitle}>{t.judul}</h4>
                          <p style={styles.itemCardDesc}>{t.deskripsi || "Tanpa deskripsi"}</p>
                          <div style={styles.deadlineTag}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span style={{color: isExpired ? "#EF4444" : "#6B7280"}}>
                              {isExpired ? "Berakhir: " : "Deadline: "}
                              {new Date(t.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div style={styles.itemCardActions}>
                          <button onClick={() => handleDeleteTugas(t.id)} style={styles.iconBtnDanger}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <SelectKelasPrompt onGoToKelas={() => setActiveTab(TABS.KELAS)} />
            )}
          </div>
        )}

        {/* Nilai Tab */}
        {activeTab === TABS.NILAI && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={{
                  ...styles.tabHeader,
                  background: selectedTheme.gradient,
                }}>
                  <div style={styles.tabHeaderContent}>
                    <div style={styles.tabHeaderIcon}>{selectedTheme.icon}</div>
                    <div>
                      <h2 style={styles.tabHeaderTitle}>Nilai</h2>
                      <p style={styles.tabHeaderSubtitle}>{selectedKelasDetail?.nama_kelas}</p>
                    </div>
                  </div>
                </div>
                <NilaiList kelasId={selectedKelasId} enrolledMurids={enrolledMurids} theme={selectedTheme} />
              </>
            ) : (
              <SelectKelasPrompt onGoToKelas={() => setActiveTab(TABS.KELAS)} />
            )}
          </div>
        )}

        {/* Presensi Tab */}
        {activeTab === TABS.PRESENSI && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={{
                  ...styles.tabHeader,
                  background: selectedTheme.gradient,
                }}>
                  <div style={styles.tabHeaderContent}>
                    <div style={styles.tabHeaderIcon}>{selectedTheme.icon}</div>
                    <div>
                      <h2 style={styles.tabHeaderTitle}>Presensi</h2>
                      <p style={styles.tabHeaderSubtitle}>{selectedKelasDetail?.nama_kelas}</p>
                    </div>
                  </div>
                  <button onClick={() => openModal("presensi")} style={styles.addButtonWhite}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Input Presensi
                  </button>
                </div>
                <PresensiList kelasId={selectedKelasId} enrolledMurids={enrolledMurids} theme={selectedTheme} />
              </>
            ) : (
              <SelectKelasPrompt onGoToKelas={() => setActiveTab(TABS.KELAS)} />
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <Modal
          mode={modalMode}
          data={modalData}
          enrolledMurids={enrolledMurids}
          onClose={closeModal}
          onSave={
            modalMode === "kelas" ? handleSaveKelas :
            modalMode === "materi" ? handleSaveMateri :
            modalMode === "tugas" ? handleSaveTugas :
            modalMode === "presensi" ? handleSavePresensi :
            modalMode === "nilai" ? handleSaveNilai : () => {}
          }
        />
      )}
    </div>
  )
}

// Select Kelas Prompt Component
function SelectKelasPrompt({ onGoToKelas }) {
  return (
    <div style={styles.selectKelasPrompt}>
      <div style={styles.emptyIconLarge}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <h3 style={styles.emptyTitle}>Pilih Kelas Terlebih Dahulu</h3>
      <p style={styles.emptyText}>Anda perlu memilih kelas untuk melihat dan mengelola konten.</p>
      <button onClick={onGoToKelas} style={styles.goToKelasBtn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Ke Halaman Kelas
      </button>
    </div>
  )
}

// Nilai List Component
function NilaiList({ kelasId, enrolledMurids, theme }) {
  const [tugass, setTugass] = useState([])
  const [selectedTugasId, setSelectedTugasId] = useState(null)
  const [pengumpulans, setPengumpulans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (kelasId) {
      setLoading(true)
      fetchTugas(kelasId)
        .then(data => {
          setTugass(data.tugass || [])
          if (data.tugass?.length > 0) {
            setSelectedTugasId(data.tugass[0].id)
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [kelasId])

  useEffect(() => {
    if (selectedTugasId) {
      fetchPengumpulanByTugas(selectedTugasId)
        .then(data => setPengumpulans(data.pengumpulans || []))
        .catch(err => console.error(err))
    }
  }, [selectedTugasId])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data nilai...</p>
      </div>
    )
  }

  const getNamaMurid = (muridId) => {
    const enrolled = enrolledMurids.find(e => e.murid_id === muridId)
    return enrolled?.murid?.name || enrolled?.murid?.nama || `Murid #${muridId}`
  }

  return (
    <div style={styles.nilaiContainer}>
      <div style={styles.tugasSelector}>
        <label style={styles.selectLabel}>Pilih Tugas:</label>
        <select 
          value={selectedTugasId || ""} 
          onChange={(e) => setSelectedTugasId(e.target.value ? parseInt(e.target.value) : null)} 
          style={styles.selectInput}
        >
          <option value="">-- Pilih Tugas --</option>
          {tugass.map(t => (
            <option key={t.id} value={t.id}>{t.judul}</option>
          ))}
        </select>
      </div>

      {selectedTugasId && (
        <div style={styles.pengumpulanList}>
          {pengumpulans.length === 0 ? (
            <div style={styles.emptyStateSmall}>
              <p>Belum ada yang mengumpulkan tugas ini</p>
            </div>
          ) : pengumpulans.map(p => (
            <div key={p.id} style={styles.pengumpulanCard}>
              <div style={styles.pengumpulanHeader}>
                <div style={{
                  ...styles.pengumpulanAvatar,
                  backgroundColor: theme.color
                }}>
                  {getNamaMurid(p.murid_id).charAt(0).toUpperCase()}
                </div>
                <div style={styles.pengumpulanInfo}>
                  <h4 style={styles.pengumpulanName}>{getNamaMurid(p.murid_id)}</h4>
                  <p style={styles.pengumpulanJawaban}>{p.jawaban_teks || p.file_jawaban || "Tanpa jawaban"}</p>
                </div>
              </div>
              <div style={styles.pengumpulanNilai}>
                {p.nilai !== null ? (
                  <span style={{
                    ...styles.nilaiBadge,
                    backgroundColor: theme.lightBg,
                    color: theme.color
                  }}>{p.nilai}</span>
                ) : (
                  <span style={styles.belumDinilai}>Belum dinilai</span>
                )}
              </div>
              {p.feedback_guru && (
                <div style={styles.feedbackSection}>
                  <span style={styles.feedbackLabel}>Feedback:</span>
                  <p style={styles.feedbackText}>{p.feedback_guru}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Presensi List Component
function PresensiList({ kelasId, enrolledMurids, theme }) {
  const [presensis, setPresensis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (kelasId) {
      setLoading(true)
      fetchPresensis(kelasId)
        .then(data => setPresensis(data.presensis || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [kelasId])

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data presensi...</p>
      </div>
    )
  }

  const getNamaMurid = (muridId) => {
    const enrolled = enrolledMurids.find(e => e.murid_id === muridId)
    return enrolled?.murid?.name || enrolled?.murid?.nama || `Murid #${muridId}`
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case "hadir": return { bg: "#DCFCE7", color: "#166534" }
      case "izin": return { bg: "#FEF3C7", color: "#92400E" }
      case "sakit": return { bg: "#DBEAFE", color: "#1E40AF" }
      case "alfa": return { bg: "#FEE2E2", color: "#991B1B" }
      default: return { bg: "#F3F4F6", color: "#6B7280" }
    }
  }

  return (
    <div style={styles.presensiContainer}>
      {presensis.length === 0 ? (
        <div style={styles.emptyStateSmall}>
          <p>Belum ada data presensi</p>
        </div>
      ) : (
        <div style={styles.presensiGrid}>
          {presensis.map(p => {
            const statusStyle = getStatusStyle(p.status)
            return (
              <div key={p.id} style={styles.presensiCard}>
                <div style={styles.presensiCardHeader}>
                  <div style={{
                    ...styles.presensiAvatar,
                    backgroundColor: theme.color
                  }}>
                    {getNamaMurid(p.murid_id).charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.presensiInfo}>
                    <h4 style={styles.presensiName}>{getNamaMurid(p.murid_id)}</h4>
                    <p style={styles.presensiDate}>{new Date(p.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color
                }}>
                  {p.status.toUpperCase()}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Modal Component
function Modal({ mode, data, enrolledMurids, onClose, onSave }) {
  const [formData, setFormData] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const getTitle = () => {
    switch(mode) {
      case "kelas": return data ? "Edit Kelas" : "Tambah Kelas Baru"
      case "materi": return data ? "Edit Materi" : "Tambah Materi Baru"
      case "tugas": return data ? "Edit Tugas" : "Tambah Tugas Baru"
      case "presensi": return "Input Presensi"
      case "nilai": return "Beri Nilai"
      default: return "Modal"
    }
  }

  const getIcon = () => {
    switch(mode) {
      case "kelas": return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      )
      case "materi": return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )
      case "tugas": return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      )
      case "presensi": return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
        </svg>
      )
      default: return null
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalIconWrapper}>
            {getIcon()}
          </div>
          <h2 style={styles.modalTitle}>{getTitle()}</h2>
          <button onClick={onClose} style={styles.modalCloseBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.modalForm}>
          {mode === "kelas" && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nama Kelas</label>
                <input 
                  placeholder="Contoh: Matematika Dasar" 
                  value={formData.nama_kelas || data?.nama_kelas || ""} 
                  onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})} 
                  style={styles.formInput} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Deskripsi</label>
                <textarea 
                  placeholder="Deskripsi kelas..." 
                  value={formData.deskripsi || data?.deskripsi || ""} 
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} 
                  style={styles.formTextarea} 
                />
              </div>
            </>
          )}

          {mode === "materi" && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Judul Materi</label>
                <input 
                  placeholder="Judul materi" 
                  value={formData.judul || data?.judul || ""} 
                  onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                  style={styles.formInput} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Konten Materi</label>
                <textarea 
                  placeholder="Tulis konten materi disini..." 
                  value={formData.konten || data?.konten || ""} 
                  onChange={(e) => setFormData({...formData, konten: e.target.value})} 
                  style={styles.formTextareaLarge} 
                />
              </div>
            </>
          )}

          {mode === "tugas" && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Judul Tugas</label>
                <input 
                  placeholder="Judul tugas" 
                  value={formData.judul || data?.judul || ""} 
                  onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                  style={styles.formInput} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Deskripsi Tugas</label>
                <textarea 
                  placeholder="Deskripsi dan instruksi tugas..." 
                  value={formData.deskripsi || data?.deskripsi || ""} 
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} 
                  style={styles.formTextarea} 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Deadline</label>
                <input 
                  type="datetime-local" 
                  value={formData.deadline || (data ? new Date(data.deadline).toISOString().slice(0, 16) : "")} 
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
                  style={styles.formInput} 
                  required 
                />
              </div>
            </>
          )}

          {mode === "presensi" && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Pilih Murid</label>
                <select 
                  value={formData.murid_id || ""} 
                  onChange={(e) => setFormData({...formData, murid_id: parseInt(e.target.value)})} 
                  style={styles.formSelect} 
                  required
                >
                  <option value="">-- Pilih Murid --</option>
                  {enrolledMurids.map(e => (
                    <option key={e.murid_id} value={e.murid_id}>
                      {e.murid?.name || e.murid?.nama || `Murid #${e.murid_id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Tanggal</label>
                <input 
                  type="date" 
                  value={formData.tanggal || ""} 
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                  style={styles.formInput} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Status Kehadiran</label>
                <select 
                  value={formData.status || "hadir"} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  style={styles.formSelect}
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alfa">Alfa</option>
                </select>
              </div>
            </>
          )}

          {mode === "nilai" && (
            <>
              <div style={styles.formGroup}>
                <p style={styles.formInfo}>
                  <strong>Murid:</strong> {enrolledMurids.find(e => e.murid_id === data?.murid_id)?.murid?.name || `Murid #${data?.murid_id}`}
                </p>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nilai (0-100)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={formData.nilai || data?.nilai || ""} 
                  onChange={(e) => setFormData({...formData, nilai: parseInt(e.target.value)})} 
                  style={styles.formInput} 
                  required 
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Feedback (opsional)</label>
                <textarea 
                  placeholder="Berikan feedback untuk murid..." 
                  value={formData.feedback_guru || data?.feedback_guru || ""} 
                  onChange={(e) => setFormData({...formData, feedback_guru: e.target.value})} 
                  style={styles.formTextarea} 
                />
              </div>
            </>
          )}

          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Batal</button>
            <button type="submit" style={styles.submitBtn}>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Styles
const styles = {
  // Container
  container: {
    minHeight: "100vh",
    backgroundColor: "#F3F4F6",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  roleTag: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "#EEF2FF",
    color: "#667eea",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  userName: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#374151",
  },
  logoutBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  // Navigation
  nav: {
    backgroundColor: "white",
    borderBottom: "1px solid #E5E7EB",
    padding: "0 2rem",
  },
  navInner: {
    display: "flex",
    gap: "0.5rem",
    maxWidth: "1200px",
    margin: "0 auto",
    overflowX: "auto",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "1rem 1.25rem",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#6B7280",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  navBtnActive: {
    color: "#667eea",
    borderBottomColor: "#667eea",
    fontWeight: "600",
  },

  // Main
  main: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  // Error Banner
  errorBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.25rem",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    borderRadius: "12px",
    marginBottom: "1.5rem",
  },
  errorClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#DC2626",
    padding: "0.25rem",
  },

  // Hero Section
  heroSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2.5rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "20px",
    marginBottom: "2rem",
    color: "white",
  },
  heroContent: {},
  heroGreeting: {
    fontSize: "0.9rem",
    opacity: 0.9,
    display: "block",
    marginBottom: "0.5rem",
  },
  heroTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
  },
  heroSubtitle: {
    fontSize: "1rem",
    opacity: 0.9,
    margin: 0,
    maxWidth: "400px",
  },
  heroStats: {
    display: "flex",
    gap: "2rem",
  },
  heroStatItem: {
    textAlign: "center",
    padding: "1rem 1.5rem",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "12px",
  },
  heroStatNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
  },
  heroStatLabel: {
    fontSize: "0.85rem",
    opacity: 0.9,
  },

  // Section Header
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: 0,
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },

  // Loading
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    color: "#6B7280",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #E5E7EB",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },

  // Empty State
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  emptyIconLarge: {
    marginBottom: "1.5rem",
  },
  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 0.5rem 0",
  },
  emptyText: {
    color: "#6B7280",
    margin: 0,
  },
  emptyStateSmall: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "white",
    borderRadius: "12px",
    color: "#6B7280",
  },

  // Kelas Grid
  kelasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  kelasCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "2px solid transparent",
  },
  kelasCardActive: {
    borderColor: "#667eea",
    boxShadow: "0 8px 30px rgba(102, 126, 234, 0.2)",
  },
  kelasCardHeader: {
    height: "100px",
    position: "relative",
  },
  kelasCardOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
  },
  kelasIconBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  selectedBadge: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "#667eea",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  kelasCardBody: {
    padding: "1.25rem",
  },
  kelasName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 0.5rem 0",
  },
  kelasDesc: {
    fontSize: "0.9rem",
    color: "#6B7280",
    margin: "0 0 1rem 0",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  kelasCardFooter: {},
  kelasCardActions: {
    display: "flex",
    gap: "0.5rem",
  },
  actionBtnEdit: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#EEF2FF",
    color: "#667eea",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  actionBtnDelete: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.5rem 0.75rem",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  // Detail Panel
  detailPanel: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  detailPanelHeader: {
    padding: "1.5rem",
    color: "white",
  },
  detailPanelHeaderContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  detailPanelIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  detailPanelTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: 0,
  },
  detailPanelSubtitle: {
    fontSize: "0.9rem",
    opacity: 0.9,
    margin: "0.25rem 0 0 0",
  },
  detailPanelBody: {
    padding: "1.5rem",
  },
  enrollSection: {
    marginBottom: "1.5rem",
  },
  enrollTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 0.75rem 0",
  },
  selectInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "0.9rem",
    color: "#374151",
    backgroundColor: "white",
    cursor: "pointer",
  },
  muridListSection: {},
  muridListTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 1rem 0",
  },
  noMurid: {
    color: "#9CA3AF",
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "1rem",
  },
  muridList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  muridItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "10px",
  },
  muridItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  muridAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "0.8rem",
  },
  muridName: {
    fontSize: "0.9rem",
    color: "#374151",
  },
  removeMuridBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9CA3AF",
    padding: "0.25rem",
    transition: "color 0.2s",
  },

  // Tab Header
  tabHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem",
    borderRadius: "16px",
    marginBottom: "1.5rem",
    color: "white",
  },
  tabHeaderContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  tabHeaderIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
  },
  tabHeaderTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: 0,
  },
  tabHeaderSubtitle: {
    fontSize: "0.9rem",
    opacity: 0.9,
    margin: "0.25rem 0 0 0",
  },
  addButtonWhite: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    backgroundColor: "white",
    color: "#667eea",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },

  // Item Grid
  itemGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  itemCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    backgroundColor: "white",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    border: "1px solid #E5E7EB",
    transition: "all 0.2s",
  },
  itemCardExpired: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  itemCardNumber: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  itemCardContent: {
    flex: 1,
    minWidth: 0,
  },
  itemCardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 0.35rem 0",
  },
  itemCardDesc: {
    fontSize: "0.85rem",
    color: "#6B7280",
    margin: 0,
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  deadlineTag: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    marginTop: "0.5rem",
    fontSize: "0.8rem",
    color: "#6B7280",
  },
  itemCardActions: {
    display: "flex",
    gap: "0.5rem",
  },
  iconBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#EEF2FF",
    color: "#667eea",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  iconBtnDanger: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },

  // Select Kelas Prompt
  selectKelasPrompt: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  goToKelasBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginTop: "1.5rem",
  },

  // Nilai Container
  nilaiContainer: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  tugasSelector: {
    marginBottom: "1.5rem",
  },
  selectLabel: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  pengumpulanList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  pengumpulanCard: {
    padding: "1.25rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
  },
  pengumpulanHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "0.75rem",
  },
  pengumpulanAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    flexShrink: 0,
  },
  pengumpulanInfo: {
    flex: 1,
  },
  pengumpulanName: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 0.25rem 0",
  },
  pengumpulanJawaban: {
    fontSize: "0.9rem",
    color: "#6B7280",
    margin: 0,
    lineHeight: "1.5",
  },
  pengumpulanNilai: {
    marginTop: "0.75rem",
  },
  nilaiBadge: {
    display: "inline-block",
    padding: "0.35rem 0.75rem",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  belumDinilai: {
    color: "#9CA3AF",
    fontSize: "0.85rem",
    fontStyle: "italic",
  },
  feedbackSection: {
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #E5E7EB",
  },
  feedbackLabel: {
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "#6B7280",
  },
  feedbackText: {
    fontSize: "0.9rem",
    color: "#374151",
    margin: "0.25rem 0 0 0",
  },

  // Presensi Container
  presensiContainer: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  },
  presensiGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  presensiCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.25rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
  },
  presensiCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  presensiAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
  },
  presensiInfo: {},
  presensiName: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: 0,
  },
  presensiDate: {
    fontSize: "0.8rem",
    color: "#6B7280",
    margin: "0.15rem 0 0 0",
  },
  statusBadge: {
    padding: "0.35rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.5rem",
    borderBottom: "1px solid #E5E7EB",
    position: "relative",
  },
  modalIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: 0,
    flex: 1,
  },
  modalCloseBtn: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9CA3AF",
    padding: "0.25rem",
  },
  modalForm: {
    padding: "1.5rem",
  },
  formGroup: {
    marginBottom: "1.25rem",
  },
  formLabel: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.5rem",
  },
  formInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "0.95rem",
    color: "#374151",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  formSelect: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "0.95rem",
    color: "#374151",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  formTextarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "0.95rem",
    color: "#374151",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  formTextareaLarge: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "0.95rem",
    color: "#374151",
    minHeight: "180px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  formInfo: {
    fontSize: "0.95rem",
    color: "#374151",
    margin: 0,
  },
  modalActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "1.5rem",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  submitBtn: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
}

// Add CSS animations
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .kelas-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  }
  .kelas-card {
    animation: slideUp 0.5s ease forwards;
  }
  .item-card:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  .item-card {
    animation: fadeIn 0.4s ease forwards;
  }
`
document.head.appendChild(styleSheet)

export default GuruDashboard
