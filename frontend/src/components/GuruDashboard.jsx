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

// Demo Mode
const isDemoMode = () => localStorage.getItem("demo_mode") === "true"

// Navigation Views
const VIEWS = {
  KELAS_LIST: "kelas_list",
  KELAS_DETAIL: "kelas_detail",
  MATERI_DETAIL: "materi_detail",
  TUGAS_DETAIL: "tugas_detail",
  PRESENSI: "presensi",
}

// Class themes
const CLASS_THEMES = {
  matematika: {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#667eea",
    lightBg: "#EEF2FF",
  },
  inggris: {
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "#f5576c",
    lightBg: "#FFF1F2",
  },
  fisika: {
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "#4facfe",
    lightBg: "#E0F7FF",
  },
  default: {
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "#11998e",
    lightBg: "#E6FFF5",
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

// Demo Data
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
  { id: 1, materi_id: 1, kelas_id: 1, judul: "Latihan Aljabar", deskripsi: "Kerjakan 10 soal aljabar", deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
  { id: 2, materi_id: 2, kelas_id: 1, judul: "Quiz Persamaan Linear", deskripsi: "Quiz singkat persamaan linear", deadline: new Date(Date.now() + 3*24*60*60*1000).toISOString() },
]

const DEMO_PENGUMPULAN = [
  { id: 1, tugas_id: 1, murid_id: 2, murid: DEMO_MURIDS[0], jawaban: "Jawaban dari Ahmad", nilai: null, submitted_at: new Date().toISOString() },
  { id: 2, tugas_id: 1, murid_id: 3, murid: DEMO_MURIDS[1], jawaban: "Jawaban dari Siti", nilai: 85, submitted_at: new Date().toISOString() },
]

function GuruDashboard({ user, onLogout }) {
  // Navigation state
  const [currentView, setCurrentView] = useState(VIEWS.KELAS_LIST)
  const [navigationStack, setNavigationStack] = useState([])
  
  // Data state
  const [kelasList, setKelasList] = useState([])
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [selectedMateri, setSelectedMateri] = useState(null)
  const [selectedTugas, setSelectedTugas] = useState(null)
  
  const [enrolledMurids, setEnrolledMurids] = useState([])
  const [muridList, setMuridList] = useState([])
  const [materis, setMateris] = useState([])
  const [tugasList, setTugasList] = useState([])
  const [pengumpulanList, setPengumpulanList] = useState([])
  const [presensiList, setPresensiList] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("")
  const [modalData, setModalData] = useState(null)
  
  // Demo state
  const [demoKelasList, setDemoKelasList] = useState(DEMO_KELAS)
  const [demoMateris, setDemoMateris] = useState(DEMO_MATERIS)
  const [demoTugas, setDemoTugas] = useState(DEMO_TUGAS)
  const [demoPengumpulan, setDemoPengumpulan] = useState(DEMO_PENGUMPULAN)
  const [demoEnrolled, setDemoEnrolled] = useState([
    { id: 1, murid_id: 2, murid: DEMO_MURIDS[0] },
    { id: 2, murid_id: 3, murid: DEMO_MURIDS[1] },
  ])

  // Navigation functions
  const navigateTo = (view, data = null) => {
    setNavigationStack(prev => [...prev, { view: currentView, data: { selectedKelas, selectedMateri, selectedTugas } }])
    setCurrentView(view)
    if (data) {
      if (view === VIEWS.KELAS_DETAIL) setSelectedKelas(data)
      if (view === VIEWS.MATERI_DETAIL) setSelectedMateri(data)
      if (view === VIEWS.TUGAS_DETAIL) setSelectedTugas(data)
    }
  }

  const goBack = () => {
    if (navigationStack.length > 0) {
      const prev = navigationStack[navigationStack.length - 1]
      setNavigationStack(stack => stack.slice(0, -1))
      setCurrentView(prev.view)
      setSelectedKelas(prev.data.selectedKelas)
      setSelectedMateri(prev.data.selectedMateri)
      setSelectedTugas(prev.data.selectedTugas)
    } else {
      setCurrentView(VIEWS.KELAS_LIST)
      setSelectedKelas(null)
      setSelectedMateri(null)
      setSelectedTugas(null)
    }
  }

  // Load data
  useEffect(() => {
    loadKelas()
    loadMurids()
  }, [])

  useEffect(() => {
    if (selectedKelas) {
      loadEnrolledMurids(selectedKelas.id)
      loadMateris(selectedKelas.id)
    }
  }, [selectedKelas])

  useEffect(() => {
    if (selectedMateri && selectedKelas) {
      loadTugasForMateri(selectedMateri.id)
    }
  }, [selectedMateri])

  useEffect(() => {
    if (selectedTugas) {
      loadPengumpulan(selectedTugas.id)
    }
  }, [selectedTugas])

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

  const loadEnrolledMurids = async (kelasId) => {
    if (isDemoMode()) {
      setEnrolledMurids(demoEnrolled)
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

  const loadTugasForMateri = async (materiId) => {
    if (isDemoMode()) {
      setTugasList(demoTugas.filter(t => t.materi_id === materiId))
      return
    }
    try {
      const data = await fetchTugas(selectedKelas.id)
      // Filter by materi_id if available
      const filtered = (data.tugass || []).filter(t => t.materi_id === materiId)
      setTugasList(filtered.length > 0 ? filtered : data.tugass || [])
    } catch (err) {
      console.error("Error load tugas:", err)
    }
  }

  const loadPengumpulan = async (tugasId) => {
    if (isDemoMode()) {
      setPengumpulanList(demoPengumpulan.filter(p => p.tugas_id === tugasId))
      return
    }
    try {
      const data = await fetchPengumpulanByTugas(tugasId)
      setPengumpulanList(data.pengumpulans || data || [])
    } catch (err) {
      console.error("Error load pengumpulan:", err)
    }
  }

  const loadPresensi = async (kelasId) => {
    if (isDemoMode()) {
      setPresensiList([])
      return
    }
    try {
      const data = await fetchPresensis(kelasId)
      setPresensiList(data.presensis || [])
    } catch (err) {
      console.error("Error load presensi:", err)
    }
  }

  // Modal handlers
  const openModal = (type, data = null) => {
    setModalType(type)
    setModalData(data)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType("")
    setModalData(null)
  }

  // CRUD handlers
  const handleSaveKelas = async (formData) => {
    if (isDemoMode()) {
      if (modalData) {
        const updated = demoKelasList.map(k => k.id === modalData.id ? { ...k, ...formData } : k)
        setDemoKelasList(updated)
        setKelasList(updated)
        if (selectedKelas?.id === modalData.id) {
          setSelectedKelas({ ...selectedKelas, ...formData })
        }
      } else {
        const newKelas = { id: Date.now(), ...formData, guru_id: 1 }
        const updated = [...demoKelasList, newKelas]
        setDemoKelasList(updated)
        setKelasList(updated)
      }
      closeModal()
      return
    }
    try {
      setLoading(true)
      if (modalData) {
        await updateKelas(modalData.id, formData)
        setSelectedKelas({ ...selectedKelas, ...formData })
      } else {
        await createKelas(formData)
      }
      await loadKelas()
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKelas = async (id) => {
    if (!confirm("Yakin hapus kelas ini?")) return
    if (isDemoMode()) {
      const updated = demoKelasList.filter(k => k.id !== id)
      setDemoKelasList(updated)
      setKelasList(updated)
      goBack()
      return
    }
    try {
      await deleteKelas(id)
      loadKelas()
      goBack()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaveMateri = async (formData) => {
    if (isDemoMode()) {
      if (modalData) {
        const updated = demoMateris.map(m => m.id === modalData.id ? { ...m, ...formData } : m)
        setDemoMateris(updated)
        setMateris(updated.filter(m => m.kelas_id === selectedKelas.id))
        if (selectedMateri?.id === modalData.id) {
          setSelectedMateri({ ...selectedMateri, ...formData })
        }
      } else {
        const newMateri = { id: Date.now(), kelas_id: selectedKelas.id, ...formData }
        const updated = [...demoMateris, newMateri]
        setDemoMateris(updated)
        setMateris(updated.filter(m => m.kelas_id === selectedKelas.id))
      }
      closeModal()
      return
    }
    try {
      setLoading(true)
      if (modalData) {
        await updateMateri(modalData.id, formData)
        if (selectedMateri?.id === modalData.id) {
          setSelectedMateri({ ...selectedMateri, ...formData })
        }
        await loadMateris(selectedKelas.id)
      } else {
        await createMateri({ ...formData, kelas_id: selectedKelas.id })
        await loadMateris(selectedKelas.id)
      }
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMateri = async (id) => {
    if (!confirm("Yakin hapus materi ini?")) return
    if (isDemoMode()) {
      const updated = demoMateris.filter(m => m.id !== id)
      setDemoMateris(updated)
      setMateris(updated.filter(m => m.kelas_id === selectedKelas.id))
      goBack()
      return
    }
    try {
      await deleteMateri(id)
      loadMateris(selectedKelas.id)
      goBack()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSaveTugas = async (formData) => {
    if (isDemoMode()) {
      if (modalData) {
        const updated = demoTugas.map(t => t.id === modalData.id ? { ...t, ...formData } : t)
        setDemoTugas(updated)
        setTugasList(updated.filter(t => t.materi_id === selectedMateri.id))
        if (selectedTugas?.id === modalData.id) {
          setSelectedTugas({ ...selectedTugas, ...formData })
        }
      } else {
        const newTugas = { id: Date.now(), materi_id: selectedMateri.id, kelas_id: selectedKelas.id, ...formData }
        const updated = [...demoTugas, newTugas]
        setDemoTugas(updated)
        setTugasList(updated.filter(t => t.materi_id === selectedMateri.id))
      }
      closeModal()
      return
    }
    try {
      setLoading(true)
      if (modalData) {
        await updateTugas(modalData.id, formData)
        if (selectedTugas?.id === modalData.id) {
          setSelectedTugas({ ...selectedTugas, ...formData })
        }
        await loadTugasForMateri(selectedMateri.id)
      } else {
        await createTugas({ ...formData, kelas_id: selectedKelas.id, materi_id: selectedMateri.id })
        await loadTugasForMateri(selectedMateri.id)
      }
      closeModal()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTugas = async (id) => {
    if (!confirm("Yakin hapus tugas ini?")) return
    if (isDemoMode()) {
      const updated = demoTugas.filter(t => t.id !== id)
      setDemoTugas(updated)
      setTugasList(updated.filter(t => t.materi_id === selectedMateri.id))
      goBack()
      return
    }
    try {
      await deleteTugas(id)
      loadTugasForMateri(selectedMateri.id)
      goBack()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGiveNilai = async (pengumpulanId, nilai) => {
    if (isDemoMode()) {
      const updated = demoPengumpulan.map(p => p.id === pengumpulanId ? { ...p, nilai } : p)
      setDemoPengumpulan(updated)
      setPengumpulanList(updated.filter(p => p.tugas_id === selectedTugas.id))
      closeModal()
      return
    }
    try {
      await giveNilai(pengumpulanId, { nilai })
      loadPengumpulan(selectedTugas.id)
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEnrollMurid = async (muridId) => {
    if (!selectedKelas) return
    if (isDemoMode()) {
      const murid = DEMO_MURIDS.find(m => m.id === parseInt(muridId))
      if (murid) {
        const newEnroll = { id: Date.now(), murid_id: parseInt(muridId), murid }
        setDemoEnrolled([...demoEnrolled, newEnroll])
        setEnrolledMurids([...enrolledMurids, newEnroll])
      }
      return
    }
    try {
      await enrollMurid(selectedKelas.id, parseInt(muridId))
      loadEnrolledMurids(selectedKelas.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUnenrollMurid = async (muridId) => {
    if (!selectedKelas) return
    if (isDemoMode()) {
      const updated = demoEnrolled.filter(e => e.murid_id !== muridId)
      setDemoEnrolled(updated)
      setEnrolledMurids(updated)
      return
    }
    try {
      await unenrollMurid(selectedKelas.id, muridId)
      loadEnrolledMurids(selectedKelas.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSavePresensi = async (formData) => {
    try {
      const { tanggal, presensi } = formData
      for (const [muridId, status] of Object.entries(presensi)) {
        if (status) {
          const dbStatus = status === "absen" ? "alfa" : status
          await createPresensi({
            kelas_id: selectedKelas.id,
            murid_id: parseInt(muridId),
            tanggal: tanggal,
            status: dbStatus
          })
        }
      }
      loadPresensi(selectedKelas.id)
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const theme = selectedKelas ? getClassTheme(selectedKelas.nama_kelas) : CLASS_THEMES.default
  const enrolledIds = enrolledMurids.map(e => e.murid_id)

  // Render views
  const renderKelasListView = () => (
    <div style={styles.viewContainer}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <span style={styles.heroGreeting}>Selamat Datang</span>
          <h1 style={styles.heroTitle}>Hai, {user.name}</h1>
          <p style={styles.heroSubtitle}>Pilih kelas yang ingin Anda kelola atau buat kelas baru.</p>
        </div>
        <div style={styles.heroStats}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{kelasList.length}</span>
            <span style={styles.statLabel}>Kelas Aktif</span>
          </div>
        </div>
      </div>

      {/* Kelas Grid */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Kelas Saya</h2>
        <button style={styles.addButton} onClick={() => openModal("kelas")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Kelas
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Memuat kelas...</div>
      ) : kelasList.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <h3>Belum Ada Kelas</h3>
          <p>Buat kelas pertama Anda untuk mulai mengajar</p>
        </div>
      ) : (
        <div style={styles.kelasGrid}>
          {kelasList.map((kelas, index) => {
            const kelasTheme = getClassTheme(kelas.nama_kelas)
            return (
              <div 
                key={kelas.id} 
                style={{...styles.kelasCard, animationDelay: `${index * 0.1}s`}}
                onClick={() => navigateTo(VIEWS.KELAS_DETAIL, kelas)}
              >
                <div style={{...styles.kelasCardHeader, background: kelasTheme.gradient}}>
                  <div style={styles.kelasIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                </div>
                <div style={styles.kelasCardBody}>
                  <h3 style={styles.kelasName}>{kelas.nama_kelas}</h3>
                  <p style={styles.kelasDesc}>{kelas.deskripsi || "Tidak ada deskripsi"}</p>
                  <div style={styles.kelasFooter}>
                    <span style={{...styles.kelasTag, backgroundColor: kelasTheme.lightBg, color: kelasTheme.color}}>
                      Masuk Kelas
                    </span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={kelasTheme.color} strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderKelasDetailView = () => (
    <div style={styles.viewContainer}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={goBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali ke Daftar Kelas
      </button>

      {/* Kelas Header */}
      <div style={{...styles.kelasHeader, background: theme.gradient}}>
        <div style={styles.kelasHeaderContent}>
          <h1 style={styles.kelasHeaderTitle}>{selectedKelas?.nama_kelas}</h1>
          <p style={styles.kelasHeaderDesc}>{selectedKelas?.deskripsi}</p>
          <div style={styles.kelasHeaderStats}>
            <div style={styles.headerStat}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{enrolledMurids.length} Murid</span>
            </div>
            <div style={styles.headerStat}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>{materis.length} Materi</span>
            </div>
          </div>
        </div>
        <div style={styles.kelasActions}>
          <button style={styles.editBtn} onClick={() => openModal("kelas", selectedKelas)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button style={styles.deleteBtn} onClick={() => handleDeleteKelas(selectedKelas.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div style={styles.actionGrid}>
        <div 
          style={{...styles.actionCard, borderLeft: `4px solid ${theme.color}`}}
          onClick={() => { loadPresensi(selectedKelas.id); navigateTo(VIEWS.PRESENSI) }}
        >
          <div style={{...styles.actionIcon, backgroundColor: theme.lightBg}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div style={styles.actionContent}>
            <h3>Presensi</h3>
            <p>Catat kehadiran murid</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      {/* Enrolled Students */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Murid Terdaftar ({enrolledMurids.length})</h2>
          <button style={styles.addButtonSmall} onClick={() => openModal("enroll")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Murid
          </button>
        </div>
        <div style={styles.muridList}>
          {enrolledMurids.length === 0 ? (
            <div style={styles.emptyStateSmall}>Belum ada murid terdaftar</div>
          ) : (
            enrolledMurids.map(enrollment => (
              <div key={enrollment.id} style={styles.muridItem}>
                <div style={{...styles.muridAvatar, background: theme.gradient}}>
                  {enrollment.murid?.name?.charAt(0).toUpperCase() || "M"}
                </div>
                <div style={styles.muridInfo}>
                  <span style={styles.muridName}>{enrollment.murid?.name || "Unknown"}</span>
                  <span style={styles.muridEmail}>{enrollment.murid?.email}</span>
                </div>
                <button 
                  style={styles.removeBtn}
                  onClick={(e) => { e.stopPropagation(); handleUnenrollMurid(enrollment.murid_id) }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Materi List */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Daftar Materi ({materis.length})</h2>
          <button style={styles.addButtonSmall} onClick={() => openModal("materi")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Materi
          </button>
        </div>
        <div style={styles.materiList}>
          {materis.length === 0 ? (
            <div style={styles.emptyStateSmall}>Belum ada materi</div>
          ) : (
            materis.map((materi, index) => (
              <div 
                key={materi.id} 
                style={styles.materiItem}
                onClick={() => navigateTo(VIEWS.MATERI_DETAIL, materi)}
              >
                <div style={{...styles.materiNumber, background: theme.gradient}}>{index + 1}</div>
                <div style={styles.materiContent}>
                  <h4 style={styles.materiTitle}>{materi.judul}</h4>
                  <p style={styles.materiDesc}>{materi.konten?.substring(0, 80)}...</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderMateriDetailView = () => (
    <div style={styles.viewContainer}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={goBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali ke {selectedKelas?.nama_kelas}
      </button>

      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbItem}>{selectedKelas?.nama_kelas}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span style={styles.breadcrumbCurrent}>{selectedMateri?.judul}</span>
      </div>

      {/* Materi Header */}
      <div style={{...styles.materiHeader, background: theme.gradient}}>
        <div style={styles.materiHeaderContent}>
          <div style={styles.materiIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <h1 style={styles.materiHeaderTitle}>{selectedMateri?.judul}</h1>
        </div>
        <div style={styles.materiActions}>
          <button style={styles.editBtn} onClick={() => openModal("materi", selectedMateri)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button style={styles.deleteBtn} onClick={() => handleDeleteMateri(selectedMateri.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Materi Content */}
      <div style={styles.contentCard}>
        <h3 style={styles.contentTitle}>Konten Materi</h3>
        <p style={styles.contentText}>{selectedMateri?.konten}</p>
      </div>

      {/* Tugas List */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Daftar Tugas ({tugasList.length})</h2>
          <button style={styles.addButtonSmall} onClick={() => openModal("tugas")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Tugas
          </button>
        </div>
        <div style={styles.tugasList}>
          {tugasList.length === 0 ? (
            <div style={styles.emptyStateSmall}>
              <p>Belum ada tugas untuk materi ini</p>
              <span style={styles.emptyHint}>Tambahkan tugas untuk murid mengerjakan</span>
            </div>
          ) : (
            tugasList.map(tugas => {
              const deadline = new Date(tugas.deadline)
              const isOverdue = new Date() > deadline
              return (
                <div 
                  key={tugas.id} 
                  style={styles.tugasItem}
                  onClick={() => navigateTo(VIEWS.TUGAS_DETAIL, tugas)}
                >
                  <div style={{...styles.tugasIcon, background: isOverdue ? "#FEE2E2" : theme.lightBg}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isOverdue ? "#DC2626" : theme.color} strokeWidth="2">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </div>
                  <div style={styles.tugasContent}>
                    <h4 style={styles.tugasTitle}>{tugas.judul}</h4>
                    <p style={styles.tugasDesc}>{tugas.deskripsi}</p>
                    <div style={styles.tugasDeadline}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isOverdue ? "#DC2626" : "#6B7280"} strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span style={{color: isOverdue ? "#DC2626" : "#6B7280"}}>
                        {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {isOverdue && " (Lewat)"}
                      </span>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )

  const renderTugasDetailView = () => {
    const deadline = selectedTugas ? new Date(selectedTugas.deadline) : new Date()
    const gradedCount = pengumpulanList.filter(p => p.nilai !== null).length
    
    return (
      <div style={styles.viewContainer}>
        {/* Back Button */}
        <button style={styles.backButton} onClick={goBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali ke {selectedMateri?.judul}
        </button>

        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbItem}>{selectedKelas?.nama_kelas}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={styles.breadcrumbItem}>{selectedMateri?.judul}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span style={styles.breadcrumbCurrent}>{selectedTugas?.judul}</span>
        </div>

        {/* Tugas Header */}
        <div style={{...styles.tugasHeader, background: theme.gradient}}>
          <div style={styles.tugasHeaderContent}>
            <div style={styles.tugasHeaderIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h1 style={styles.tugasHeaderTitle}>{selectedTugas?.judul}</h1>
              <p style={styles.tugasHeaderDesc}>{selectedTugas?.deskripsi}</p>
              <div style={styles.tugasHeaderMeta}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Deadline: {deadline.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div style={styles.tugasActions}>
            <button style={styles.editBtn} onClick={() => openModal("tugas", selectedTugas)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button style={styles.deleteBtn} onClick={() => handleDeleteTugas(selectedTugas.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCardSmall}>
            <div style={{...styles.statIconSmall, backgroundColor: "#DBEAFE"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <span style={styles.statCardNumber}>{pengumpulanList.length}</span>
              <span style={styles.statCardLabel}>Dikumpulkan</span>
            </div>
          </div>
          <div style={styles.statCardSmall}>
            <div style={{...styles.statIconSmall, backgroundColor: "#D1FAE5"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <span style={styles.statCardNumber}>{gradedCount}</span>
              <span style={styles.statCardLabel}>Dinilai</span>
            </div>
          </div>
          <div style={styles.statCardSmall}>
            <div style={{...styles.statIconSmall, backgroundColor: "#FEF3C7"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <span style={styles.statCardNumber}>{pengumpulanList.length - gradedCount}</span>
              <span style={styles.statCardLabel}>Belum Dinilai</span>
            </div>
          </div>
        </div>

        {/* Pengumpulan List */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Pengumpulan Tugas</h2>
          <div style={styles.pengumpulanList}>
            {pengumpulanList.length === 0 ? (
              <div style={styles.emptyStateSmall}>
                <p>Belum ada yang mengumpulkan tugas</p>
              </div>
            ) : (
              pengumpulanList.map(pengumpulan => (
                <div key={pengumpulan.id} style={styles.pengumpulanItem}>
                  <div style={{...styles.muridAvatar, background: theme.gradient}}>
                    {pengumpulan.murid?.name?.charAt(0).toUpperCase() || "M"}
                  </div>
                  <div style={styles.pengumpulanContent}>
                    <h4 style={styles.pengumpulanName}>{pengumpulan.murid?.name || "Unknown"}</h4>
                    <p style={styles.pengumpulanAnswer}>{pengumpulan.jawaban?.substring(0, 100)}...</p>
                    <span style={styles.pengumpulanTime}>
                      {new Date(pengumpulan.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={styles.pengumpulanAction}>
                    {pengumpulan.nilai !== null ? (
                      <div style={styles.nilaiDisplay}>
                        <span style={styles.nilaiValue}>{pengumpulan.nilai}</span>
                        <span style={styles.nilaiLabel}>Nilai</span>
                      </div>
                    ) : (
                      <button 
                        style={styles.gradeBtn}
                        onClick={() => openModal("nilai", pengumpulan)}
                      >
                        Beri Nilai
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderPresensiView = () => (
    <div style={styles.viewContainer}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={goBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali ke {selectedKelas?.nama_kelas}
      </button>

      {/* Presensi Header */}
      <div style={{...styles.presensiHeader, background: theme.gradient}}>
        <div style={styles.presensiIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h1 style={styles.presensiTitle}>Presensi - {selectedKelas?.nama_kelas}</h1>
        <p style={styles.presensiSubtitle}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Quick Presensi */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Riwayat Presensi ({presensiList.length} records)</h2>
          <button style={styles.addButtonSmall} onClick={() => openModal("presensi")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Presensi
          </button>
        </div>
        
        <div style={styles.presensiDisplayContainer}>
          {presensiList.length === 0 ? (
            <div style={styles.emptyStateSmall}>Belum ada presensi untuk kelas ini</div>
          ) : (() => {
            const grouped = {}
            presensiList.forEach(p => {
              const dateKey = p.tanggal
              if (!grouped[dateKey]) grouped[dateKey] = { hadir: [], izin: [], absen: [] }
              const enrolled = enrolledMurids.find(e => e.murid_id === p.murid_id)
              const muridName = p.murid?.name || enrolled?.murid?.name || "Murid " + p.murid_id
              const student = { id: p.id, name: muridName }
              if (p.status === "hadir") grouped[dateKey].hadir.push(student)
              else if (p.status === "izin") grouped[dateKey].izin.push(student)
              else grouped[dateKey].absen.push(student)
            })
            const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a))
            return sortedDates.map(date => {
              const total = grouped[date].hadir.length + grouped[date].izin.length + grouped[date].absen.length
              const formattedDate = new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              return (
                <div key={date} style={styles.presensiCardNew}>
                  <div style={styles.presensiCardHeaderNew}>
                    <div style={styles.presensiCardTitleRow}>
                      <span style={styles.presensiCardIconNew}>📅</span>
                      <span style={styles.presensiCardTitleNew}>{formattedDate}</span>
                    </div>
                    <div style={styles.presensiCardBadgeNew}>
                      <span style={styles.presensiCardBadgeTextNew}>{total} siswa</span>
                    </div>
                  </div>
                  <div style={styles.presensiCardBodyNew}>
                    <div style={styles.presensiStatusRowNew}>
                      <div style={styles.presensiStatusRowIconNew}>
                        <span style={styles.presensiStatusIconCircleSuccess}>✓</span>
                      </div>
                      <div style={styles.presensiStatusRowContent}>
                        <span style={styles.presensiStatusRowLabelNew}>Hadir</span>
                        <span style={styles.presensiStatusRowCountNew}>{grouped[date].hadir.length}</span>
                      </div>
                      <div style={styles.presensiStatusRowNames}>
                        {grouped[date].hadir.length > 0 ? grouped[date].hadir.map(s => (
                          <span key={s.id} style={styles.presensiNameTagSuccess}>{s.name}</span>
                        )) : <span style={styles.presensiNoDataNew}>Tidak ada</span>}
                      </div>
                    </div>
                    <div style={styles.presensiStatusRowNew}>
                      <div style={styles.presensiStatusRowIconNew}>
                        <span style={styles.presensiStatusIconCircleWarning}>!</span>
                      </div>
                      <div style={styles.presensiStatusRowContent}>
                        <span style={styles.presensiStatusRowLabelNew}>Izin</span>
                        <span style={styles.presensiStatusRowCountWarning}>{grouped[date].izin.length}</span>
                      </div>
                      <div style={styles.presensiStatusRowNames}>
                        {grouped[date].izin.length > 0 ? grouped[date].izin.map(s => (
                          <span key={s.id} style={styles.presensiNameTagWarning}>{s.name}</span>
                        )) : <span style={styles.presensiNoDataNew}>Tidak ada</span>}
                      </div>
                    </div>
                    <div style={styles.presensiStatusRowNew}>
                      <div style={styles.presensiStatusRowIconNew}>
                        <span style={styles.presensiStatusIconCircleDanger}>✕</span>
                      </div>
                      <div style={styles.presensiStatusRowContent}>
                        <span style={styles.presensiStatusRowLabelNew}>Absen</span>
                        <span style={styles.presensiStatusRowCountDanger}>{grouped[date].absen.length}</span>
                      </div>
                      <div style={styles.presensiStatusRowNames}>
                        {grouped[date].absen.length > 0 ? grouped[date].absen.map(s => (
                          <span key={s.id} style={styles.presensiNameTagDanger}>{s.name}</span>
                        )) : <span style={styles.presensiNoDataNew}>Tidak ada</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>
    </div>
  )

  // Modal Component
  const renderModal = () => {
    if (!showModal) return null

    return (
      <div style={styles.modalOverlay} onClick={closeModal}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={{...styles.modalHeader, background: theme.gradient}}>
            <h2 style={styles.modalTitle}>
              {modalType === "kelas" && (modalData ? "Edit Kelas" : "Tambah Kelas")}
              {modalType === "materi" && (modalData ? "Edit Materi" : "Tambah Materi")}
              {modalType === "tugas" && (modalData ? "Edit Tugas" : "Tambah Tugas")}
              {modalType === "enroll" && "Tambah Murid"}
              {modalType === "nilai" && "Beri Nilai"}
              {modalType === "presensi" && "Tambah Presensi"}
            </h2>
            <button style={styles.modalClose} onClick={closeModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div style={styles.modalBody}>
            {modalType === "kelas" && (
              <KelasForm initialData={modalData} onSave={handleSaveKelas} onCancel={closeModal} />
            )}
            {modalType === "materi" && (
              <MateriForm initialData={modalData} onSave={handleSaveMateri} onCancel={closeModal} />
            )}
            {modalType === "tugas" && (
              <TugasForm initialData={modalData} onSave={handleSaveTugas} onCancel={closeModal} />
            )}
            {modalType === "enroll" && (
              <EnrollForm 
                muridList={muridList.filter(m => !enrolledIds.includes(m.id))} 
                onEnroll={handleEnrollMurid} 
                onCancel={closeModal} 
              />
            )}
            {modalType === "nilai" && (
              <NilaiForm 
                pengumpulan={modalData} 
                onSave={(nilai) => handleGiveNilai(modalData.id, nilai)} 
                onCancel={closeModal} 
              />
            )}
            {modalType === "presensi" && (
              <PresensiForm 
                murids={enrolledMurids} 
                onSave={handleSavePresensi} 
                onCancel={closeModal} 
              />
            )}
          </div>
        </div>
      </div>
    )
  }

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

      {/* Error Banner */}
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

      {/* Main Content */}
      <main style={styles.main}>
        {currentView === VIEWS.KELAS_LIST && renderKelasListView()}
        {currentView === VIEWS.KELAS_DETAIL && renderKelasDetailView()}
        {currentView === VIEWS.MATERI_DETAIL && renderMateriDetailView()}
        {currentView === VIEWS.TUGAS_DETAIL && renderTugasDetailView()}
        {currentView === VIEWS.PRESENSI && renderPresensiView()}
      </main>

      {/* Modal */}
      {renderModal()}
    </div>
  )
}

// Form Components
function KelasForm({ initialData, onSave, onCancel }) {
  const [nama_kelas, setNamaKelas] = useState(initialData?.nama_kelas || "")
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ nama_kelas, deskripsi })
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Nama Kelas</label>
        <input 
          type="text" 
          value={nama_kelas} 
          onChange={e => setNamaKelas(e.target.value)}
          style={styles.input}
          placeholder="Contoh: Matematika Dasar"
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Deskripsi</label>
        <textarea 
          value={deskripsi} 
          onChange={e => setDeskripsi(e.target.value)}
          style={styles.textarea}
          placeholder="Deskripsi singkat tentang kelas ini"
          rows={3}
        />
      </div>
      <div style={styles.formActions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>Batal</button>
        <button type="submit" style={styles.submitBtn}>Simpan</button>
      </div>
    </form>
  )
}

function MateriForm({ initialData, onSave, onCancel }) {
  const [judul, setJudul] = useState(initialData?.judul || "")
  const [konten, setKonten] = useState(initialData?.konten || "")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ judul, konten })
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Judul Materi</label>
        <input 
          type="text" 
          value={judul} 
          onChange={e => setJudul(e.target.value)}
          style={styles.input}
          placeholder="Contoh: Pengenalan Aljabar"
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Konten</label>
        <textarea 
          value={konten} 
          onChange={e => setKonten(e.target.value)}
          style={styles.textarea}
          placeholder="Tulis konten materi di sini..."
          rows={6}
          required
        />
      </div>
      <div style={styles.formActions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>Batal</button>
        <button type="submit" style={styles.submitBtn}>Simpan</button>
      </div>
    </form>
  )
}

function TugasForm({ initialData, onSave, onCancel }) {
  const [judul, setJudul] = useState(initialData?.judul || "")
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "")
  const [deadline, setDeadline] = useState(initialData?.deadline?.split('T')[0] || "")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ judul, deskripsi, deadline: new Date(deadline).toISOString() })
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Judul Tugas</label>
        <input 
          type="text" 
          value={judul} 
          onChange={e => setJudul(e.target.value)}
          style={styles.input}
          placeholder="Contoh: Latihan Soal Bab 1"
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Deskripsi</label>
        <textarea 
          value={deskripsi} 
          onChange={e => setDeskripsi(e.target.value)}
          style={styles.textarea}
          placeholder="Instruksi tugas untuk murid..."
          rows={4}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Deadline</label>
        <input 
          type="date" 
          value={deadline} 
          onChange={e => setDeadline(e.target.value)}
          style={styles.input}
          required
        />
      </div>
      <div style={styles.formActions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>Batal</button>
        <button type="submit" style={styles.submitBtn}>Simpan</button>
      </div>
    </form>
  )
}

function EnrollForm({ muridList, onEnroll, onCancel }) {
  const [selectedMurid, setSelectedMurid] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedMurid) {
      onEnroll(selectedMurid)
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Pilih Murid</label>
        {muridList.length === 0 ? (
          <p style={styles.emptyText}>Semua murid sudah terdaftar</p>
        ) : (
          <select 
            value={selectedMurid} 
            onChange={e => setSelectedMurid(e.target.value)}
            style={styles.select}
            required
          >
            <option value="">-- Pilih Murid --</option>
            {muridList.map(murid => (
              <option key={murid.id} value={murid.id}>{murid.name} ({murid.email})</option>
            ))}
          </select>
        )}
      </div>
      <div style={styles.formActions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>Batal</button>
        <button type="submit" style={styles.submitBtn} disabled={muridList.length === 0}>Tambah</button>
      </div>
    </form>
  )
}

function NilaiForm({ pengumpulan, onSave, onCancel }) {
  const [nilai, setNilai] = useState(pengumpulan?.nilai || "")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(parseInt(nilai))
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Murid</label>
        <p style={styles.staticText}>{pengumpulan?.murid?.name}</p>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Jawaban</label>
        <div style={styles.answerBox}>{pengumpulan?.jawaban}</div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Nilai (0-100)</label>
        <input 
          type="number" 
          min="0" 
          max="100"
          value={nilai} 
          onChange={e => setNilai(e.target.value)}
          style={styles.input}
          placeholder="Masukkan nilai"
          required
        />
      </div>
      <div style={styles.formActions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>Batal</button>
        <button type="submit" style={styles.submitBtn}>Simpan Nilai</button>
      </div>
    </form>
  )
}

function PresensiForm({ murids, onSave, onCancel }) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [presensi, setPresensi] = useState(() => {
    const initial = {}
    murids.forEach(m => {
      initial[m.murid_id] = "absen"
    })
    return initial
  })

  const cycleStatus = (muridId) => {
    const current = presensi[muridId] || "absen"
    const statusOrder = ["absen", "hadir", "izin"]
    const currentIndex = statusOrder.indexOf(current)
    const nextIndex = (currentIndex + 1) % statusOrder.length
    const next = statusOrder[nextIndex]
    setPresensi(prev => ({
      ...prev,
      [muridId]: next
    }))
  }

  const getStatusLabel = (status) => {
    const labels = { hadir: "Hadir", izin: "Izin", absen: "Absen" }
    return labels[status || "absen"] || "Absen"
  }

  const getStatusStyle = (status) => {
    if (status === "hadir") return styles.hadirBtnActive
    if (status === "izin") return styles.izinBtnActive
    return styles.absenBtnActive
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ tanggal, presensi })
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Tanggal</label>
        <input 
          type="date" 
          value={tanggal} 
          onChange={e => setTanggal(e.target.value)}
          style={styles.input}
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Kehadiran</label>
        <div style={styles.presensiFormList}>
          {murids.map(enrollment => (
            <div key={enrollment.id} style={styles.presensiFormItem}>
              <span>{enrollment.murid?.name}</span>
              <button 
                type="button"
                style={getStatusStyle(presensi[enrollment.murid_id])}
                onClick={() => cycleStatus(enrollment.murid_id)}
              >
                {getStatusLabel(presensi[enrollment.murid_id])}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.formActions}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>Batal</button>
        <button type="submit" style={styles.submitBtn}>Simpan Presensi</button>
      </div>
    </form>
  )
}

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    backgroundColor: "white",
    borderBottom: "1px solid #E2E8F0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  roleTag: {
    padding: "4px 12px",
    backgroundColor: "#EEF2FF",
    color: "#667eea",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  userName: {
    fontWeight: "500",
    color: "#1F2937",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
  },
  errorBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    margin: "16px 24px",
    borderRadius: "8px",
  },
  errorClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#DC2626",
  },
  viewContainer: {
    animation: "fadeIn 0.3s ease",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "white",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: "20px",
    transition: "all 0.2s",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  breadcrumbItem: {
    color: "#6B7280",
  },
  breadcrumbCurrent: {
    color: "#1F2937",
    fontWeight: "500",
  },
  heroSection: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
  },
  heroContent: {},
  heroGreeting: {
    fontSize: "14px",
    opacity: "0.9",
  },
  heroTitle: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "8px 0",
  },
  heroSubtitle: {
    fontSize: "15px",
    opacity: "0.9",
    maxWidth: "400px",
  },
  heroStats: {
    display: "flex",
    gap: "16px",
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "16px 24px",
    borderRadius: "12px",
    textAlign: "center",
  },
  statNumber: {
    display: "block",
    fontSize: "32px",
    fontWeight: "700",
  },
  statLabel: {
    fontSize: "13px",
    opacity: "0.9",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1F2937",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  addButtonSmall: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "#EEF2FF",
    color: "#667eea",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
  },
  loading: {
    textAlign: "center",
    padding: "48px",
    color: "#6B7280",
  },
  emptyState: {
    textAlign: "center",
    padding: "64px 32px",
    backgroundColor: "white",
    borderRadius: "12px",
    color: "#6B7280",
  },
  emptyStateSmall: {
    textAlign: "center",
    padding: "32px",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
    color: "#6B7280",
    fontSize: "14px",
  },
  emptyHint: {
    display: "block",
    marginTop: "4px",
    fontSize: "12px",
    color: "#9CA3AF",
  },
  kelasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  kelasCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    animation: "slideUp 0.4s ease forwards",
    opacity: 0,
  },
  kelasCardHeader: {
    padding: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  kelasIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  kelasCardBody: {
    padding: "20px",
  },
  kelasName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "8px",
  },
  kelasDesc: {
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  kelasFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kelasTag: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  kelasHeader: {
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  kelasHeaderContent: {},
  kelasHeaderTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  kelasHeaderDesc: {
    fontSize: "14px",
    opacity: "0.9",
    marginBottom: "16px",
  },
  kelasHeaderStats: {
    display: "flex",
    gap: "20px",
  },
  headerStat: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    opacity: "0.9",
  },
  kelasActions: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "rgba(255,255,255,0.2)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    transition: "background-color 0.2s",
  },
  deleteBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "rgba(220,38,38,0.8)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    transition: "background-color 0.2s",
  },
  actionGrid: {
    marginBottom: "24px",
  },
  actionCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  actionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
  },
  section: {
    marginBottom: "32px",
  },
  muridList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  muridItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  muridAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  muridInfo: {
    flex: 1,
  },
  muridName: {
    display: "block",
    fontWeight: "500",
    color: "#1F2937",
    fontSize: "14px",
  },
  muridEmail: {
    fontSize: "12px",
    color: "#6B7280",
  },
  removeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    backgroundColor: "#FEE2E2",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#DC2626",
  },
  materiList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  materiItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  materiNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "700",
    fontSize: "16px",
  },
  materiContent: {
    flex: 1,
  },
  materiTitle: {
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "4px",
    fontSize: "15px",
  },
  materiDesc: {
    fontSize: "13px",
    color: "#6B7280",
    lineHeight: "1.4",
  },
  materiHeader: {
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  materiHeaderContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  materiIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  materiHeaderTitle: {
    fontSize: "24px",
    fontWeight: "700",
  },
  materiActions: {
    display: "flex",
    gap: "8px",
  },
  contentCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  contentTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  contentText: {
    fontSize: "15px",
    color: "#374151",
    lineHeight: "1.7",
  },
  tugasList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  tugasItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  tugasIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tugasContent: {
    flex: 1,
  },
  tugasTitle: {
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "4px",
    fontSize: "15px",
  },
  tugasDesc: {
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "8px",
  },
  tugasDeadline: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
  },
  tugasHeader: {
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tugasHeaderContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  tugasHeaderIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tugasHeaderTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  tugasHeaderDesc: {
    fontSize: "14px",
    opacity: "0.9",
    marginBottom: "12px",
  },
  tugasHeaderMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    opacity: "0.9",
  },
  tugasActions: {
    display: "flex",
    gap: "8px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCardSmall: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  statIconSmall: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statCardNumber: {
    display: "block",
    fontSize: "24px",
    fontWeight: "700",
    color: "#1F2937",
  },
  statCardLabel: {
    fontSize: "12px",
    color: "#6B7280",
  },
  pengumpulanList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  pengumpulanItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  pengumpulanContent: {
    flex: 1,
  },
  pengumpulanName: {
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "4px",
  },
  pengumpulanAnswer: {
    fontSize: "13px",
    color: "#6B7280",
    marginBottom: "4px",
  },
  pengumpulanTime: {
    fontSize: "11px",
    color: "#9CA3AF",
  },
  pengumpulanAction: {},
  nilaiDisplay: {
    textAlign: "center",
  },
  nilaiValue: {
    display: "block",
    fontSize: "24px",
    fontWeight: "700",
    color: "#059669",
  },
  nilaiLabel: {
    fontSize: "11px",
    color: "#6B7280",
  },
  gradeBtn: {
    padding: "8px 16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "13px",
  },
  presensiHeader: {
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "24px",
    color: "white",
    textAlign: "center",
  },
  presensiIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  presensiTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  presensiSubtitle: {
    fontSize: "14px",
    opacity: "0.9",
  },
  presensiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "16px",
  },
  presensiCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  presensiName: {
    fontWeight: "500",
    color: "#1F2937",
  },
  presensiButtons: {
    display: "flex",
    gap: "8px",
  },
  hadirBtn: {
    padding: "6px 12px",
    backgroundColor: "#D1FAE5",
    color: "#059669",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
  absenBtn: {
    padding: "6px 12px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "480px",
    maxHeight: "90vh",
    overflow: "hidden",
    animation: "slideUp 0.3s ease",
  },
  modalHeader: {
    padding: "20px 24px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
  },
  modalClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "white",
    opacity: "0.8",
  },
  modalBody: {
    padding: "24px",
    maxHeight: "calc(90vh - 80px)",
    overflowY: "auto",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  textarea: {
    padding: "12px 16px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  select: {
    padding: "12px 16px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "white",
  },
  staticText: {
    fontSize: "14px",
    color: "#1F2937",
    fontWeight: "500",
  },
  answerBox: {
    padding: "12px 16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#4B5563",
    lineHeight: "1.5",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: "14px",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  cancelBtn: {
    padding: "10px 20px",
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  },
  presensiFormList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  presensiFormItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
  },
  hadirBtnActive: {
    padding: "6px 16px",
    backgroundColor: "#059669",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
  hadirBtnInactive: {
    padding: "6px 16px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
  tidakHadirBtnActive: {
    padding: "6px 16px",
    backgroundColor: "#DC2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
  izinBtnActive: {
    padding: "6px 16px",
    backgroundColor: "#F59E0B",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
  absenBtnActive: {
    padding: "6px 16px",
    backgroundColor: "#DC2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "12px",
  },
}

// Add keyframes for animations
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .kelasCard:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }
  presensiGroup: {
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
  },
  presensiDateHeader: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #E5E7EB",
  },
  presensiStatusGroup: {
    marginTop: "8px",
  },
  presensiStatusLabelHadir: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#059669",
    marginBottom: "4px",
  },
  presensiStatusLabelIzin: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#D97706",
    marginBottom: "4px",
  },
  presensiStatusLabelAbsen: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: "4px",
  },
  presensiStatusList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  presensiBadgeHadir: {
    padding: "4px 12px",
    backgroundColor: "#D1FAE5",
    color: "#059669",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "500",
  },
  presensiBadgeIzin: {
    padding: "4px 12px",
    backgroundColor: "#FEF3C7",
    color: "#D97706",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "500",
  },
  presensiBadgeAbsen: {
    padding: "4px 12px",
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "500",
  },
  presensiDateCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  presensiDateTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "2px solid #E5E7EB",
  },
  presensiDateText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1F2937",
  },
  presensiTotalCount: {
    fontSize: "14px",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  presensiStatusRows: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  presensiRowHadir: {
    backgroundColor: "#ECFDF5",
    borderRadius: "8px",
    padding: "10px 12px",
    borderLeft: "4px solid #10B981",
  },
  presensiRowIzin: {
    backgroundColor: "#FFFBEB",
    borderRadius: "8px",
    padding: "10px 12px",
    borderLeft: "#F59E0B",
    borderLeftWidth: "4px",
    borderLeftStyle: "solid",
  },
  presensiRowAbsen: {
    backgroundColor: "#FEF2F2",
    borderRadius: "8px",
    padding: "10px 12px",
    borderLeft: "4px solid #EF4444",
  },
  presensiRowHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  presensiRowIconHadir: {
    width: "20px",
    height: "20px",
    backgroundColor: "#10B981",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  presensiRowIconIzin: {
    width: "20px",
    height: "20px",
    backgroundColor: "#F59E0B",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  presensiRowIconAbsen: {
    width: "20px",
    height: "20px",
    backgroundColor: "#EF4444",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
  presensiRowLabelHadir: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },
  presensiRowLabelIzin: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#92400E",
    flex: 1,
  },
  presensiRowLabelAbsen: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#991B1B",
    flex: 1,
  },
  presensiRowCount: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#10B981",
  },
  presensiRowCountIzin: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#F59E0B",
  },
  presensiRowCountAbsen: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#EF4444",
  },
  presensiRowNames: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  presensiNameBadgeHadir: {
    padding: "4px 10px",
    backgroundColor: "white",
    color: "#065F46",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #A7F3D0",
  },
  presensiNameBadgeIzin: {
    padding: "4px 10px",
    backgroundColor: "white",
    color: "#92400E",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #FDE68A",
  },
  presensiNameBadgeAbsen: {
    padding: "4px 10px",
    backgroundColor: "white",
    color: "#991B1B",
    borderRadius: "14px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #FECACA",
  },
  presensiNoData: {
    color: "#9CA3AF",
    fontSize: "13px",
    fontStyle: "italic",
  },
  presensiDisplayContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  presensiTable: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  presensiTableHeader: {
    backgroundColor: "#374151",
  },
  presensiTableTitleCell: {
    padding: "12px 16px",
    color: "white",
    fontWeight: "600",
    fontSize: "15px",
    textAlign: "left",
  },
  presensiTableRowHadir: {
    backgroundColor: "#ECFDF5",
    borderBottom: "1px solid #D1FAE5",
  },
  presensiTableRowIzin: {
    backgroundColor: "#FFFBEB",
    borderBottom: "1px solid #FEF3C7",
  },
  presensiTableRowAbsen: {
    backgroundColor: "#FEF2F2",
  },
  presensiTableIconCell: {
    width: "40px",
    textAlign: "center",
    padding: "10px 8px",
    fontWeight: "bold",
    fontSize: "16px",
  },
  presensiTableLabelCell: {
    width: "120px",
    padding: "10px 8px",
    fontWeight: "600",
    fontSize: "14px",
  },
  presensiTableNameCell: {
    padding: "10px 16px",
    fontSize: "14px",
    color: "#374151",
  },
  presensiDisplayContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  presensiCardNew: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #E5E7EB",
  },
  presensiCardHeaderNew: {
    background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  presensiCardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  presensiCardIconNew: {
    fontSize: "20px",
  },
  presensiCardTitleNew: {
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
  },
  presensiCardBadgeNew: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
  },
  presensiCardBadgeTextNew: {
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
  },
  presensiCardBodyNew: {
    padding: "0",
  },
  presensiStatusRowNew: {
    display: "flex",
    alignItems: "flex-start",
    padding: "14px 20px",
    borderBottom: "1px solid #F3F4F6",
    gap: "14px",
  },
  presensiStatusRowIconNew: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  presensiStatusIconCircleSuccess: {
    width: "28px",
    height: "28px",
    backgroundColor: "#10B981",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  presensiStatusIconCircleWarning: {
    width: "28px",
    height: "28px",
    backgroundColor: "#F59E0B",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  presensiStatusIconCircleDanger: {
    width: "28px",
    height: "28px",
    backgroundColor: "#EF4444",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  presensiStatusRowContent: {
    flex: "0 0 80px",
  },
  presensiStatusRowLabelNew: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  presensiStatusRowCountNew: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#10B981",
  },
  presensiStatusRowCountWarning: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#F59E0B",
  },
  presensiStatusRowCountDanger: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#EF4444",
  },
  presensiStatusRowNames: {
    flex: 1,
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  presensiNameTagSuccess: {
    padding: "4px 12px",
    backgroundColor: "#D1FAE5",
    color: "#065F46",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #A7F3D0",
  },
  presensiNameTagWarning: {
    padding: "4px 12px",
    backgroundColor: "#FEF3C7",
    color: "#92400E",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #FDE68A",
  },
  presensiNameTagDanger: {
    padding: "4px 12px",
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid #FECACA",
  },
  presensiNoDataNew: {
    color: "#9CA3AF",
    fontSize: "13px",
    fontStyle: "italic",
  },
`
document.head.appendChild(styleSheet)

export default GuruDashboard
