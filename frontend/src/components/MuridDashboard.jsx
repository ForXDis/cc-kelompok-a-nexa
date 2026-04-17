import { useState, useEffect } from "react"
import {
  fetchKelas,
  joinKelas, leaveKelas,
  fetchMateris,
  fetchTugas,
  submitTugas, fetchMyPengumpulan,
  fetchMyPresensi, fetchMyPresensiStats,
} from "../services/api"

function MuridDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("kelas")
  const [enrolledKelas, setEnrolledKelas] = useState([])
  const [selectedKelasId, setSelectedKelasId] = useState(null)
  const [selectedKelasDetail, setSelectedKelasDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadKelas()
  }, [])

  useEffect(() => {
    if (selectedKelasId) {
      const kelas = enrolledKelas.find(k => k.id === selectedKelasId)
      setSelectedKelasDetail(kelas)
    }
  }, [selectedKelasId, enrolledKelas, refreshKey])

  const loadKelas = async () => {
    setLoading(true)
    try {
      const data = await fetchKelas()
      setEnrolledKelas(data.kelass || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinKelas = async (kelasId) => {
    try {
      await joinKelas(kelasId)
      loadKelas()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLeaveKelas = async (kelasId) => {
    if (!confirm("Yakin keluar dari kelas ini?")) return
    try {
      await leaveKelas(kelasId)
      setSelectedKelasId(null)
      setSelectedKelasDetail(null)
      loadKelas()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSelectKelas = (kelas) => {
    setSelectedKelasId(kelas.id)
    setSelectedKelasDetail(kelas)
  }

  const enrolledIds = enrolledKelas.map(k => k.id)
  const availableKelas = enrolledKelas.filter(k => !enrolledIds.includes(k.id) || k.id === selectedKelasId)

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>📚 Studyfy - Dashboard Murid</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>👨‍🎓 {user.name}</span>
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
          <KelasTab
            enrolledKelas={enrolledKelas}
            selectedKelasId={selectedKelasId}
            selectedKelasDetail={selectedKelasDetail}
            onSelect={handleSelectKelas}
            onJoin={handleJoinKelas}
            onLeave={handleLeaveKelas}
            loading={loading}
          />
        )}

        {activeTab === "materi" && (
          <MateriTab enrolledKelas={enrolledKelas} selectedKelasId={selectedKelasId} />
        )}

        {activeTab === "tugas" && (
          <TugasTab enrolledKelas={enrolledKelas} selectedKelasId={selectedKelasId} />
        )}

        {activeTab === "nilai" && (
          <NilaiTab />
        )}

        {activeTab === "presensi" && (
          <PresensiTab enrolledKelas={enrolledKelas} selectedKelasId={selectedKelasId} />
        )}
      </main>
    </div>
  )
}

function KelasTab({ enrolledKelas, selectedKelasId, selectedKelasDetail, onSelect, onJoin, onLeave, loading }) {
  const enrolledIds = enrolledKelas.map(k => k.id)

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>📁 Kelas Saya</h2>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          <h3>Kelas yang Diikuti</h3>
          <div style={styles.kelasGrid}>
            {enrolledKelas.length === 0 ? (
              <p style={styles.emptyState}>Belum mengikuti kelas apapun</p>
            ) : enrolledKelas.map(kelas => (
              <div
                key={kelas.id}
                style={{ ...styles.kelasCard, ...(selectedKelasId === kelas.id ? styles.kelasCardActive : {}) }}
                onClick={() => onSelect(kelas)}
              >
                <h3>{kelas.nama_kelas}</h3>
                <p>{kelas.deskripsi || "Tanpa deskripsi"}</p>
                <p style={styles.guruName}>👨‍🏫 {kelas.guru?.name || kelas.guru?.nama || "Guru"}</p>
                <button onClick={(e) => { e.stopPropagation(); onLeave(kelas.id); }} style={styles.btnDanger}>Keluar</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MateriTab({ enrolledKelas, selectedKelasId }) {
  const [materis, setMateris] = useState([])
  const [kelasId, setKelasId] = useState(selectedKelasId)

  useEffect(() => {
    if (kelasId) {
      fetchMateris(kelasId)
        .then(data => setMateris(data.materis || []))
        .catch(err => console.error(err))
    }
  }, [kelasId])

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>📖 Materi</h2>
      </div>

      <div style={styles.kelasSelector}>
        <label>Pilih Kelas:</label>
        <select value={kelasId || ""} onChange={(e) => setKelasId(e.target.value ? parseInt(e.target.value) : null)} style={styles.select}>
          <option value="">-- Pilih Kelas --</option>
          {enrolledKelas.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {!kelasId ? (
        <p style={styles.emptyState}>Pilih kelas terlebih dahulu</p>
      ) : (
        <ul style={styles.itemList}>
          {materis.length === 0 ? (
            <p style={styles.emptyState}>Belum ada materi</p>
          ) : materis.map(m => (
            <li key={m.id} style={styles.item}>
              <div>
                <strong>{m.judul}</strong>
                <p>{m.konten || "Tanpa konten"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TugasTab({ enrolledKelas, selectedKelasId }) {
  const [tugass, setTugass] = useState([])
  const [myPengumpulan, setMyPengumpulan] = useState([])
  const [kelasId, setKelasId] = useState(selectedKelasId)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedTugas, setSelectedTugas] = useState(null)
  const [jawaban, setJawaban] = useState("")

  useEffect(() => {
    if (kelasId) {
      fetchTugas(kelasId)
        .then(data => setTugass(data.tugass || []))
        .catch(err => console.error(err))
      fetchMyPengumpulan()
        .then(data => setMyPengumpulan(data.pengumpulans || []))
        .catch(err => console.error(err))
    }
  }, [kelasId])

  const handleSubmit = async () => {
    if (!jawaban.trim()) return
    try {
      await submitTugas({
        tugas_id: selectedTugas.id,
        jawaban_teks: jawaban
      })
      setShowSubmitModal(false)
      setJawaban("")
      fetchMyPengumpulan()
        .then(data => setMyPengumpulan(data.pengumpulans || []))
        .catch(err => console.error(err))
    } catch (err) {
      alert(err.message)
    }
  }

  const isSubmitted = (tugasId) => myPengumpulan.some(p => p.tugas_id === tugasId)
  const getSubmission = (tugasId) => myPengumpulan.find(p => p.tugas_id === tugasId)

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>📝 Tugas</h2>
      </div>

      <div style={styles.kelasSelector}>
        <label>Pilih Kelas:</label>
        <select value={kelasId || ""} onChange={(e) => setKelasId(e.target.value ? parseInt(e.target.value) : null)} style={styles.select}>
          <option value="">-- Pilih Kelas --</option>
          {enrolledKelas.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {!kelasId ? (
        <p style={styles.emptyState}>Pilih kelas terlebih dahulu</p>
      ) : (
        <ul style={styles.itemList}>
          {tugass.length === 0 ? (
            <p style={styles.emptyState}>Belum ada tugas</p>
          ) : tugass.map(t => {
            const submitted = isSubmitted(t.id)
            const submission = getSubmission(t.id)
            const deadline = new Date(t.deadline)
            const isLate = new Date() > deadline

            return (
              <li key={t.id} style={{ ...styles.item, ...(submitted ? styles.itemSubmitted : {}) }}>
                <div>
                  <strong>{t.judul}</strong>
                  <p>{t.deskripsi || "Tanpa deskripsi"}</p>
                  <p>Deadline: {deadline.toLocaleString()} {isLate && !submitted ? "⚠️ LEWAT!" : ""}</p>
                  {submitted && (
                    <p style={styles.submissionInfo}>
                      Status: {submission.nilai !== null ? `Dinilai: ${submission.nilai}` : "Sudah dikumpulkan"}
                      {submission.feedback_guru && <span> | Feedback: {submission.feedback_guru}</span>}
                    </p>
                  )}
                </div>
                {!submitted && !isLate && (
                  <button onClick={() => { setSelectedTugas(t); setShowSubmitModal(true); }} style={styles.btnPrimary}>Kumpulkan</button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {showSubmitModal && (
        <div style={styles.modalOverlay} onClick={() => setShowSubmitModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Kumpulkan Tugas: {selectedTugas?.judul}</h2>
            <textarea
              placeholder="Jawaban Anda..."
              value={jawaban}
              onChange={(e) => setJawaban(e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.modalActions}>
              <button onClick={handleSubmit} style={styles.btnPrimary}>Kirim</button>
              <button onClick={() => setShowSubmitModal(false)} style={styles.btnSecondary}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NilaiTab() {
  const [pengumpulan, setPengumpulan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchMyPengumpulan()
      .then(data => setPengumpulan(data.pengumpulans || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>✅ Nilai Saya</h2>
      </div>

      <ul style={styles.itemList}>
        {pengumpulan.length === 0 ? (
          <p style={styles.emptyState}>Belum ada nilai</p>
        ) : pengumpulan.map(p => (
          <li key={p.id} style={styles.item}>
            <div>
              <strong>Tugas #{p.tugas_id}</strong>
              <p>Nilai: {p.nilai !== null ? <span style={styles.nilaiBadge}>{p.nilai}</span> : "Belum dinilai"}</p>
              {p.feedback_guru && <p>Feedback: {p.feedback_guru}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PresensiTab({ enrolledKelas, selectedKelasId }) {
  const [kelasId, setKelasId] = useState(selectedKelasId)
  const [presensis, setPresensis] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (kelasId) {
      fetchMyPresensi()
        .then(data => setPresensis(data.presensis || []))
        .catch(err => console.error(err))
      fetchMyPresensiStats(kelasId)
        .then(data => setStats(data))
        .catch(err => console.error(err))
    }
  }, [kelasId])

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h2>📋 Presensi Saya</h2>
      </div>

      <div style={styles.kelasSelector}>
        <label>Pilih Kelas:</label>
        <select value={kelasId || ""} onChange={(e) => setKelasId(e.target.value ? parseInt(e.target.value) : null)} style={styles.select}>
          <option value="">-- Pilih Kelas --</option>
          {enrolledKelas.map(k => (
            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
          ))}
        </select>
      </div>

      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.total_pertemuan}</div>
            <div>Total Pertemuan</div>
          </div>
          <div style={{ ...styles.statCard, color: "green" }}>
            <div style={styles.statValue}>{stats.hadir}</div>
            <div>Hadir</div>
          </div>
          <div style={{ ...styles.statCard, color: "red" }}>
            <div style={styles.statValue}>{stats.alfa}</div>
            <div>Alfa</div>
          </div>
          <div style={{ ...styles.statCard, color: "#1F4E79" }}>
            <div style={styles.statValue}>{stats.presentase_hadir}%</div>
            <div>Kehadiran</div>
          </div>
        </div>
      )}

      {!kelasId ? (
        <p style={styles.emptyState}>Pilih kelas terlebih dahulu</p>
      ) : (
        <ul style={styles.itemList}>
          {presensis.length === 0 ? (
            <p style={styles.emptyState}>Belum ada presensi</p>
          ) : presensis.map(p => (
            <li key={p.id} style={styles.item}>
              <div>
                <strong>{new Date(p.tanggal).toLocaleDateString()}</strong>
                <span style={{
                  marginLeft: "1rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                  color: "white",
                  backgroundColor: p.status === "hadir" ? "green" : p.status === "izin" ? "orange" : "red"
                }}>
                  {p.status.toUpperCase()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
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
  sectionHeader: { marginBottom: "1.5rem" },
  kelasSelector: { marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" },
  select: { padding: "0.7rem", borderRadius: "6px", border: "1px solid #ddd", width: "100%", fontSize: "1rem", maxWidth: "400px" },
  btnPrimary: { padding: "0.7rem 1.2rem", backgroundColor: "#548235", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  btnSecondary: { padding: "0.7rem 1.2rem", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  btnDanger: { padding: "0.5rem 1rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
  emptyState: { textAlign: "center", color: "#666", padding: "2rem" },
  kelasGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  kelasCard: { backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", cursor: "pointer" },
  kelasCardActive: { border: "2px solid #1F4E79" },
  guruName: { color: "#666", fontSize: "0.9rem" },
  itemList: { listStyle: "none", padding: 0 },
  item: { backgroundColor: "white", padding: "1rem 1.5rem", borderRadius: "8px", marginBottom: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  itemSubmitted: { backgroundColor: "#d4edda" },
  submissionInfo: { color: "#155724", fontSize: "0.9rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" },
  statCard: { backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  statValue: { fontSize: "2rem", fontWeight: "bold" },
  nilaiBadge: { backgroundColor: "#1F4E79", color: "white", padding: "0.2rem 0.6rem", borderRadius: "4px", fontWeight: "bold" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "white", padding: "2rem", borderRadius: "12px", width: "90%", maxWidth: "500px" },
  textarea: { padding: "0.7rem", borderRadius: "6px", border: "1px solid #ddd", width: "100%", minHeight: "150px", marginBottom: "1rem", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: "1rem", justifyContent: "flex-end" },
}

export default MuridDashboard
