import { useState, useEffect } from "react"
import {
  fetchKelas, createKelas, updateKelas, deleteKelas,
  fetchKelasDetail, fetchEnrolledMurids, enrollMurid, unenrollMurid,
  fetchMateris, createMateri, updateMateri, deleteMateri,
  fetchTugas, createTugas, updateTugas, deleteTugas,
  giveNilai,
  fetchPresensis, createPresensi,
  fetchMurids,
} from "../services/api"

// Demo Mode Data
const isDemoMode = () => localStorage.getItem("demo_mode") === "true"

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

function GuruDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("kelas")
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

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>📚 Studyfy - Dashboard Guru</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>👨‍🏫 {user.name}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <nav style={styles.nav}>
        <button style={{ ...styles.navBtn, ...(activeTab === "kelas" ? styles.navBtnActive : {}) }} onClick={() => setActiveTab("kelas")}>📁 Kelas Saya</button>
        <button style={{ ...styles.navBtn, ...(activeTab === "materi" ? styles.navBtnActive : {}) }} onClick={() => setActiveTab("materi")}>📖 Materi</button>
        <button style={{ ...styles.navBtn, ...(activeTab === "tugas" ? styles.navBtnActive : {}) }} onClick={() => setActiveTab("tugas")}>📝 Tugas</button>
        <button style={{ ...styles.navBtn, ...(activeTab === "nilai" ? styles.navBtnActive : {}) }} onClick={() => setActiveTab("nilai")}>✅ Nilai</button>
        <button style={{ ...styles.navBtn, ...(activeTab === "presensi" ? styles.navBtnActive : {}) }} onClick={() => setActiveTab("presensi")}>📋 Presensi</button>
      </nav>

      <main style={styles.main}>
        {error && <div style={styles.error}>{typeof error === 'object' ? JSON.stringify(error) : error} <button onClick={() => setError("")}>✕</button></div>}

        {activeTab === "kelas" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>📁 Kelas Saya</h2>
              <button onClick={() => openModal("kelas")} style={styles.btnPrimary}>+ Tambah Kelas</button>
            </div>

            {loading ? <p>Loading...</p> : (
              <div style={styles.kelasGrid}>
                {kelasList.length === 0 ? (
                  <p style={styles.emptyState}>Belum ada kelas. Buat kelas baru untuk memulai.</p>
                ) : kelasList.map(kelas => (
                  <div
                    key={kelas.id}
                    style={{ ...styles.kelasCard, ...(selectedKelasId === kelas.id ? styles.kelasCardActive : {}) }}
                    onClick={() => handleSelectKelas(kelas)}
                  >
                    <h3>{kelas.nama_kelas}</h3>
                    <p>{kelas.deskripsi || "Tanpa deskripsi"}</p>
                    <div style={styles.kelasActions}>
                      <button onClick={(e) => { e.stopPropagation(); openModal("kelas", kelas); }} style={styles.btnSmall}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteKelas(kelas.id); }} style={styles.btnDanger}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedKelasDetail && (
              <div style={styles.detailPanel}>
                <h3>Daftar Murid - {selectedKelasDetail.nama_kelas}</h3>
                
                <div style={styles.enrollSection}>
                  <select
                    style={styles.select}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleEnrollMurid(e.target.value)
                        e.target.value = ""
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">-- Daftarkan Murid --</option>
                    {muridList
                      .filter(m => !enrolledIds.includes(m.id))
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.name || m.nama} ({m.email})</option>
                      ))}
                  </select>
                </div>

                <ul style={styles.muridList}>
                  {enrolledMurids.length === 0 ? (
                    <li>Belum ada murid terdaftar</li>
                  ) : enrolledMurids.map(e => (
                    <li key={e.id} style={styles.muridItem}>
                      <span>👨‍🎓 {e.murid?.name || e.murid?.nama || `Murid #${e.murid_id}`}</span>
                      <button onClick={() => handleUnenrollMurid(e.murid_id)} style={styles.btnDangerSmall}>✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "materi" && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={styles.sectionHeader}>
                  <h2>📖 Materi - {selectedKelasDetail?.nama_kelas || "Kelas"}</h2>
                  <button onClick={() => openModal("materi")} style={styles.btnPrimary}>+ Tambah Materi</button>
                </div>
                <MateriList 
                  materis={materis}
                  onDelete={handleDeleteMateri}
                  onEdit={(m) => openModal("materi", m)}
                />
              </>
            ) : (
              <p style={styles.emptyState}>Pilih kelas terlebih dahulu di tab "Kelas Saya"</p>
            )}
          </div>
        )}

        {activeTab === "tugas" && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={styles.sectionHeader}>
                  <h2>📝 Tugas - {selectedKelasDetail?.nama_kelas || "Kelas"}</h2>
                  <button onClick={() => openModal("tugas")} style={styles.btnPrimary}>+ Tambah Tugas</button>
                </div>
                <TugasList 
                  tugass={tugass}
                  onDelete={handleDeleteTugas}
                />
              </>
            ) : (
              <p style={styles.emptyState}>Pilih kelas terlebih dahulu di tab "Kelas Saya"</p>
            )}
          </div>
        )}

        {activeTab === "nilai" && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={styles.sectionHeader}>
                  <h2>✅ Nilai - {selectedKelasDetail?.nama_kelas || "Kelas"}</h2>
                </div>
                <NilaiList kelasId={selectedKelasId} enrolledMurids={enrolledMurids} />
              </>
            ) : (
              <p style={styles.emptyState}>Pilih kelas terlebih dahulu di tab "Kelas Saya"</p>
            )}
          </div>
        )}

        {activeTab === "presensi" && (
          <div>
            {selectedKelasId ? (
              <>
                <div style={styles.sectionHeader}>
                  <h2>📋 Presensi - {selectedKelasDetail?.nama_kelas || "Kelas"}</h2>
                  <button onClick={() => openModal("presensi")} style={styles.btnPrimary}>+ Input Presensi</button>
                </div>
                <PresensiList kelasId={selectedKelasId} enrolledMurids={enrolledMurids} />
              </>
            ) : (
              <p style={styles.emptyState}>Pilih kelas terlebih dahulu di tab "Kelas Saya"</p>
            )}
          </div>
        )}
      </main>

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

function MateriList({ materis, onDelete, onEdit }) {
  return (
    <ul style={styles.itemList}>
      {materis.length === 0 ? (
        <p style={styles.emptyState}>Belum ada materi</p>
      ) : materis.map(m => (
        <li key={m.id} style={styles.item}>
          <div>
            <strong>{m.judul}</strong>
            <p>{m.konten || "Tanpa konten"}</p>
          </div>
          <div style={styles.itemActions}>
            <button onClick={() => onEdit(m)} style={styles.btnSmall}>Edit</button>
            <button onClick={() => onDelete(m.id)} style={styles.btnDanger}>Hapus</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function TugasList({ tugass, onDelete }) {
  return (
    <ul style={styles.itemList}>
      {tugass.length === 0 ? (
        <p style={styles.emptyState}>Belum ada tugas</p>
      ) : tugass.map(t => (
        <li key={t.id} style={styles.item}>
          <div>
            <strong>{t.judul}</strong>
            <p>{t.deskripsi || "Tanpa deskripsi"}</p>
            <small>Deadline: {new Date(t.deadline).toLocaleString()}</small>
          </div>
          <div style={styles.itemActions}>
            <button onClick={() => onDelete(t.id)} style={styles.btnDanger}>Hapus</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function NilaiList({ kelasId, enrolledMurids }) {
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

  if (loading) return <p>Loading...</p>

  const getNamaMurid = (muridId) => {
    const enrolled = enrolledMurids.find(e => e.murid_id === muridId)
    return enrolled?.murid?.name || enrolled?.murid?.nama || `Murid #${muridId}`
  }

  return (
    <div>
      <div style={styles.tugasSelector}>
        <label>Pilih Tugas:</label>
        <select 
          value={selectedTugasId || ""} 
          onChange={(e) => setSelectedTugasId(e.target.value ? parseInt(e.target.value) : null)} 
          style={styles.select}
        >
          <option value="">-- Pilih Tugas --</option>
          {tugass.map(t => (
            <option key={t.id} value={t.id}>{t.judul}</option>
          ))}
        </select>
      </div>

      {selectedTugasId && (
        <ul style={styles.itemList}>
          {pengumpulans.length === 0 ? (
            <p style={styles.emptyState}>Belum ada yang mengumpulkan</p>
          ) : pengumpulans.map(p => (
            <li key={p.id} style={styles.item}>
              <div>
                <strong>{getNamaMurid(p.murid_id)}</strong>
                <p>{p.jawaban_teks || p.file_jawaban || "Tanpa jawaban"}</p>
                <p>Nilai: {p.nilai !== null ? <span style={styles.nilaiBadge}>{p.nilai}</span> : "Belum dinilai"}</p>
                {p.feedback_guru && <p>Feedback: {p.feedback_guru}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PresensiList({ kelasId, enrolledMurids }) {
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

  if (loading) return <p>Loading...</p>

  const getNamaMurid = (muridId) => {
    const enrolled = enrolledMurids.find(e => e.murid_id === muridId)
    return enrolled?.murid?.name || enrolled?.murid?.nama || `Murid #${muridId}`
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "hadir": return "green"
      case "izin": return "orange"
      case "sakit": return "blue"
      case "alfa": return "red"
      default: return "gray"
    }
  }

  return (
    <ul style={styles.itemList}>
      {presensis.length === 0 ? (
        <p style={styles.emptyState}>Belum ada presensi</p>
      ) : presensis.map(p => (
        <li key={p.id} style={styles.item}>
          <div>
            <strong>{getNamaMurid(p.murid_id)}</strong>
            <p>Tanggal: {new Date(p.tanggal).toLocaleDateString()}</p>
            <p>
              Status: 
              <span style={{ 
                marginLeft: "8px",
                padding: "2px 8px",
                borderRadius: "4px",
                color: "white",
                backgroundColor: getStatusColor(p.status)
              }}>
                {p.status.toUpperCase()}
              </span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Modal({ mode, data, enrolledMurids, onClose, onSave }) {
  const [formData, setFormData] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const getTitle = () => {
    switch(mode) {
      case "kelas": return data ? "Edit Kelas" : "Tambah Kelas"
      case "materi": return data ? "Edit Materi" : "Tambah Materi"
      case "tugas": return data ? "Edit Tugas" : "Tambah Tugas"
      case "presensi": return "Input Presensi"
      case "nilai": return "Beri Nilai"
      default: return "Modal"
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{getTitle()}</h2>

        <form onSubmit={handleSubmit}>
          {mode === "kelas" && (
            <>
              <input 
                placeholder="Nama Kelas" 
                value={formData.nama_kelas || data?.nama_kelas || ""} 
                onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})} 
                style={styles.input} 
                required 
              />
              <textarea 
                placeholder="Deskripsi" 
                value={formData.deskripsi || data?.deskripsi || ""} 
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} 
                style={styles.textarea} 
              />
            </>
          )}

          {mode === "materi" && (
            <>
              <input 
                placeholder="Judul Materi" 
                value={formData.judul || data?.judul || ""} 
                onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                style={styles.input} 
                required 
              />
              <textarea 
                placeholder="Konten Materi" 
                value={formData.konten || data?.konten || ""} 
                onChange={(e) => setFormData({...formData, konten: e.target.value})} 
                style={styles.textarea} 
              />
            </>
          )}

          {mode === "tugas" && (
            <>
              <input 
                placeholder="Judul Tugas" 
                value={formData.judul || data?.judul || ""} 
                onChange={(e) => setFormData({...formData, judul: e.target.value})} 
                style={styles.input} 
                required 
              />
              <textarea 
                placeholder="Deskripsi Tugas" 
                value={formData.deskripsi || data?.deskripsi || ""} 
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} 
                style={styles.textarea} 
              />
              <label style={styles.label}>Deadline</label>
              <input 
                type="datetime-local" 
                value={formData.deadline || (data ? new Date(data.deadline).toISOString().slice(0, 16) : "")} 
                onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
                style={styles.input} 
                required 
              />
            </>
          )}

          {mode === "presensi" && (
            <>
              <select 
                value={formData.murid_id || ""} 
                onChange={(e) => setFormData({...formData, murid_id: parseInt(e.target.value)})} 
                style={styles.select} 
                required
              >
                <option value="">-- Pilih Murid --</option>
                {enrolledMurids.map(e => (
                  <option key={e.murid_id} value={e.murid_id}>
                    {e.murid?.name || e.murid?.nama || `Murid #${e.murid_id}`}
                  </option>
                ))}
              </select>
              <input 
                type="date" 
                value={formData.tanggal || ""} 
                onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                style={styles.input} 
                required 
              />
              <select 
                value={formData.status || "hadir"} 
                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                style={styles.select}
              >
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alfa">Alfa</option>
              </select>
            </>
          )}

          {mode === "nilai" && (
            <>
              <p style={{ marginBottom: "10px" }}>
                <strong>Murid:</strong> {enrolledMurids.find(e => e.murid_id === data?.murid_id)?.murid?.name || `Murid #${data?.murid_id}`}
              </p>
              <label style={styles.label}>Nilai (0-100)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={formData.nilai || data?.nilai || ""} 
                onChange={(e) => setFormData({...formData, nilai: parseInt(e.target.value)})} 
                style={styles.input} 
                required 
              />
              <textarea 
                placeholder="Feedback (opsional)" 
                value={formData.feedback_guru || data?.feedback_guru || ""} 
                onChange={(e) => setFormData({...formData, feedback_guru: e.target.value})} 
                style={styles.textarea} 
              />
            </>
          )}

          <div style={styles.modalActions}>
            <button type="submit" style={styles.btnPrimary}>Simpan</button>
            <button type="button" onClick={onClose} style={styles.btnSecondary}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5", fontFamily: "'Segoe UI', Arial, sans-serif" },
  header: { backgroundColor: "#1F4E79", color: "white", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { margin: 0, fontSize: "1.5rem" },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  userName: { fontSize: "1rem" },
  logoutBtn: { padding: "0.5rem 1rem", backgroundColor: "#c42b1c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  nav: { backgroundColor: "white", padding: "0.5rem 2rem", display: "flex", gap: "0.5rem", borderBottom: "1px solid #ddd" },
  navBtn: { padding: "0.7rem 1.2rem", border: "none", backgroundColor: "transparent", cursor: "pointer", fontSize: "0.95rem", borderRadius: "4px" },
  navBtnActive: { backgroundColor: "#1F4E79", color: "white" },
  main: { padding: "2rem", maxWidth: "1200px", margin: "0 auto" },
  error: { backgroundColor: "#f8d7da", color: "#721c24", padding: "1rem", borderRadius: "4px", marginBottom: "1rem", display: "flex", justifyContent: "space-between" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  btnPrimary: { padding: "0.7rem 1.2rem", backgroundColor: "#548235", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  btnSecondary: { padding: "0.5rem 1rem", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  btnDanger: { padding: "0.5rem 1rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  btnSmall: { padding: "0.3rem 0.7rem", backgroundColor: "#0d6efd", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" },
  btnDangerSmall: { padding: "0.2rem 0.5rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" },
  emptyState: { textAlign: "center", color: "#666", padding: "2rem" },
  kelasGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  kelasCard: { backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", cursor: "pointer", transition: "all 0.2s" },
  kelasCardActive: { border: "2px solid #1F4E79" },
  kelasActions: { display: "flex", gap: "0.5rem", marginTop: "1rem" },
  detailPanel: { backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  enrollSection: { margin: "1rem 0" },
  select: { padding: "0.7rem", borderRadius: "6px", border: "1px solid #ddd", width: "100%", fontSize: "1rem" },
  label: { fontSize: "0.85rem", fontWeight: "bold", color: "#555", marginBottom: "5px", display: "block" },
  muridList: { listStyle: "none", padding: 0 },
  muridItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem", borderBottom: "1px solid #eee" },
  itemList: { listStyle: "none", padding: 0 },
  item: { backgroundColor: "white", padding: "1rem 1.5rem", borderRadius: "8px", marginBottom: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  itemActions: { display: "flex", gap: "0.5rem" },
  tugasSelector: { marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" },
  nilaiBadge: { backgroundColor: "#1F4E79", color: "white", padding: "0.2rem 0.6rem", borderRadius: "4px", fontWeight: "bold" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "white", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" },
  input: { padding: "0.7rem", borderRadius: "6px", border: "1px solid #ddd", width: "100%", fontSize: "1rem", marginBottom: "1rem", boxSizing: "border-box" },
  textarea: { padding: "0.7rem", borderRadius: "6px", border: "1px solid #ddd", width: "100%", fontSize: "1rem", minHeight: "100px", marginBottom: "1rem", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" },
}

export default GuruDashboard
