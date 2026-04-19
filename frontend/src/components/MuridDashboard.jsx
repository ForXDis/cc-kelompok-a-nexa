import { useState, useEffect } from "react"
import {
  fetchKelas,
  fetchMateris,
  fetchTugas,
  submitTugas, fetchMyPengumpulan,
  fetchMyPresensi, fetchMyPresensiStats,
} from "../services/api"

// Demo Mode
const isDemoMode = () => localStorage.getItem("demo_mode") === "true"

const DEMO_KELAS = [
  { id: 1, nama_kelas: "Matematika Dasar", deskripsi: "Kelas matematika untuk pemula mencakup aljabar, geometri, dan aritmatika dasar", guru: { name: "Pak Ahmad" }, jumlah_materi: 3, jumlah_murid: 24 },
  { id: 2, nama_kelas: "Bahasa Inggris", deskripsi: "Kelas bahasa Inggris conversation dan grammar untuk pemula", guru: { name: "Bu Sarah" }, jumlah_materi: 2, jumlah_murid: 18 },
  { id: 3, nama_kelas: "Fisika SMA", deskripsi: "Fisika untuk persiapan UTBK dan ujian nasional", guru: { name: "Pak Budi" }, jumlah_materi: 4, jumlah_murid: 15 },
]

const DEMO_MATERIS = {
  1: [
    { id: 1, judul: "Pengenalan Aljabar", konten: "Materi dasar aljabar meliputi variabel, konstanta, dan operasi dasar. Aljabar adalah cabang matematika yang menggunakan simbol-simbol untuk mewakili angka dan hubungan antar angka.\n\nKonsep dasar:\n1. Variabel adalah simbol yang mewakili nilai yang tidak diketahui\n2. Konstanta adalah nilai tetap\n3. Koefisien adalah angka yang mengalikan variabel", created_at: "2024-01-15" },
    { id: 2, judul: "Persamaan Linear", konten: "Cara menyelesaikan persamaan linear satu variabel. Persamaan linear adalah persamaan yang variabelnya berpangkat satu.\n\nContoh: 2x + 5 = 15\nPenyelesaian:\n2x = 15 - 5\n2x = 10\nx = 5", created_at: "2024-01-20" },
    { id: 3, judul: "Sistem Persamaan Linear", konten: "Metode eliminasi dan substitusi untuk menyelesaikan sistem persamaan linear dua variabel.", created_at: "2024-01-25" },
  ],
  2: [
    { id: 4, judul: "Basic Grammar", konten: "Tenses, articles, dan struktur kalimat dasar dalam bahasa Inggris.\n\nSimple Present Tense:\n- I eat breakfast every morning\n- She goes to school by bus\n\nSimple Past Tense:\n- I ate breakfast this morning\n- She went to school yesterday", created_at: "2024-01-10" },
    { id: 5, judul: "Vocabulary Building", konten: "Teknik memperkaya kosakata bahasa Inggris melalui reading dan contextual learning.", created_at: "2024-01-18" },
  ],
  3: [
    { id: 6, judul: "Hukum Newton", konten: "Tiga hukum Newton tentang gerak dan penerapannya dalam kehidupan sehari-hari.", created_at: "2024-01-12" },
    { id: 7, judul: "Kinematika", konten: "Gerak lurus beraturan (GLB) dan gerak lurus berubah beraturan (GLBB).", created_at: "2024-01-19" },
    { id: 8, judul: "Dinamika", konten: "Gaya, massa, dan percepatan dalam sistem dinamika.", created_at: "2024-01-26" },
    { id: 9, judul: "Usaha dan Energi", konten: "Konsep usaha, energi kinetik, dan energi potensial.", created_at: "2024-02-02" },
  ]
}

const DEMO_TUGAS = {
  1: [
    { id: 1, materi_id: 1, judul: "Latihan Aljabar Dasar", deskripsi: "Kerjakan 10 soal aljabar berikut dengan menunjukkan langkah penyelesaiannya", deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
    { id: 2, materi_id: 2, judul: "Quiz Persamaan Linear", deskripsi: "Quiz singkat tentang persamaan linear satu variabel", deadline: new Date(Date.now() + 3*24*60*60*1000).toISOString() },
  ],
  2: [
    { id: 3, materi_id: 1, judul: "Latihan Soal Sistem Persamaan", deskripsi: "Selesaikan 5 soal sistem persamaan linear dua variabel", deadline: new Date(Date.now() + 5*24*60*60*1000).toISOString() },
  ],
  4: [
    { id: 4, materi_id: 4, judul: "Essay Writing", deskripsi: "Tulis essay pendek (150-200 kata) tentang daily routine dalam bahasa Inggris", deadline: new Date(Date.now() + 5*24*60*60*1000).toISOString() },
  ],
  5: [],
  6: [
    { id: 5, materi_id: 6, judul: "Soal Hukum Newton", deskripsi: "Kerjakan 5 soal aplikasi hukum Newton", deadline: new Date(Date.now() + 4*24*60*60*1000).toISOString() },
  ],
}

const DEMO_PRESENSI = {
  1: [
    { id: 1, tanggal: "2024-01-15", status: "hadir" },
    { id: 2, tanggal: "2024-01-17", status: "hadir" },
    { id: 3, tanggal: "2024-01-19", status: "izin" },
    { id: 4, tanggal: "2024-01-22", status: "hadir" },
    { id: 5, tanggal: "2024-01-24", status: "hadir" },
  ],
  2: [
    { id: 6, tanggal: "2024-01-16", status: "hadir" },
    { id: 7, tanggal: "2024-01-18", status: "alfa" },
    { id: 8, tanggal: "2024-01-20", status: "hadir" },
  ],
  3: [
    { id: 9, tanggal: "2024-01-14", status: "hadir" },
    { id: 10, tanggal: "2024-01-21", status: "hadir" },
  ]
}

// Navigation views
const VIEWS = {
  KELAS_LIST: "kelas_list",
  KELAS_DETAIL: "kelas_detail",
  MATERI_DETAIL: "materi_detail",
  TUGAS_DETAIL: "tugas_detail",
}

function MuridDashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState(VIEWS.KELAS_LIST)
  const [enrolledKelas, setEnrolledKelas] = useState([])
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [selectedMateri, setSelectedMateri] = useState(null)
  const [selectedTugas, setSelectedTugas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [demoPengumpulan, setDemoPengumpulan] = useState([])

  useEffect(() => {
    loadKelas()
  }, [])

  const loadKelas = async () => {
    setLoading(true)
    if (isDemoMode()) {
      setEnrolledKelas(DEMO_KELAS)
      setLoading(false)
      return
    }
    try {
      const data = await fetchKelas()
      setEnrolledKelas(data.kelass || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Navigation handlers
  const goToKelasList = () => {
    setCurrentView(VIEWS.KELAS_LIST)
    setSelectedKelas(null)
    setSelectedMateri(null)
    setSelectedTugas(null)
  }

  const goToKelasDetail = (kelas) => {
    setSelectedKelas(kelas)
    setSelectedMateri(null)
    setSelectedTugas(null)
    setCurrentView(VIEWS.KELAS_DETAIL)
  }

  const goToMateriDetail = (materi) => {
    setSelectedMateri(materi)
    setSelectedTugas(null)
    setCurrentView(VIEWS.MATERI_DETAIL)
  }

  const goToTugasDetail = (tugas) => {
    setSelectedTugas(tugas)
    setCurrentView(VIEWS.TUGAS_DETAIL)
  }

  const goBack = () => {
    if (currentView === VIEWS.TUGAS_DETAIL) {
      setCurrentView(VIEWS.MATERI_DETAIL)
      setSelectedTugas(null)
    } else if (currentView === VIEWS.MATERI_DETAIL) {
      setCurrentView(VIEWS.KELAS_DETAIL)
      setSelectedMateri(null)
    } else if (currentView === VIEWS.KELAS_DETAIL) {
      setCurrentView(VIEWS.KELAS_LIST)
      setSelectedKelas(null)
    }
  }

  // Breadcrumb
  const getBreadcrumb = () => {
    const crumbs = [{ label: "Kelas Saya", onClick: goToKelasList }]
    if (selectedKelas) {
      crumbs.push({ label: selectedKelas.nama_kelas, onClick: () => goToKelasDetail(selectedKelas) })
    }
    if (selectedMateri) {
      crumbs.push({ label: selectedMateri.judul, onClick: () => goToMateriDetail(selectedMateri) })
    }
    if (selectedTugas) {
      crumbs.push({ label: selectedTugas.judul, onClick: null })
    }
    return crumbs
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>Studyfy</div>
          <span style={styles.roleTag}>Murid</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user.name?.charAt(0).toUpperCase()}</div>
            <span style={styles.userName}>{user.name}</span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>Keluar</button>
        </div>
      </header>

      {/* Breadcrumb */}
      {currentView !== VIEWS.KELAS_LIST && (
        <div style={styles.breadcrumbContainer}>
          <button onClick={goBack} style={styles.backButton}>
            <span style={styles.backIcon}>&#8592;</span> Kembali
          </button>
          <div style={styles.breadcrumb}>
            {getBreadcrumb().map((crumb, index) => (
              <span key={index} style={styles.breadcrumbItem}>
                {index > 0 && <span style={styles.breadcrumbSeparator}>/</span>}
                {crumb.onClick ? (
                  <button onClick={crumb.onClick} style={styles.breadcrumbLink}>{crumb.label}</button>
                ) : (
                  <span style={styles.breadcrumbCurrent}>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {currentView === VIEWS.KELAS_LIST && (
          <KelasListView 
            enrolledKelas={enrolledKelas} 
            loading={loading}
            onSelectKelas={goToKelasDetail}
          />
        )}

        {currentView === VIEWS.KELAS_DETAIL && selectedKelas && (
          <KelasDetailView 
            kelas={selectedKelas}
            onSelectMateri={goToMateriDetail}
            demoPengumpulan={demoPengumpulan}
          />
        )}

        {currentView === VIEWS.MATERI_DETAIL && selectedMateri && selectedKelas && (
          <MateriDetailView 
            materi={selectedMateri}
            kelas={selectedKelas}
            onSelectTugas={goToTugasDetail}
            demoPengumpulan={demoPengumpulan}
          />
        )}

        {currentView === VIEWS.TUGAS_DETAIL && selectedTugas && (
          <TugasDetailView 
            tugas={selectedTugas}
            demoPengumpulan={demoPengumpulan}
            setDemoPengumpulan={setDemoPengumpulan}
          />
        )}
      </main>
    </div>
  )
}

// ============ VIEW COMPONENTS ============

function KelasListView({ enrolledKelas, loading, onSelectKelas }) {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat kelas...</p>
      </div>
    )
  }

  return (
    <div style={styles.viewContainer}>
      <div style={styles.viewHeader}>
        <h1 style={styles.viewTitle}>Kelas Saya</h1>
        <p style={styles.viewSubtitle}>Pilih kelas untuk melihat materi dan tugas</p>
      </div>

      {enrolledKelas.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>&#128218;</div>
          <h3 style={styles.emptyTitle}>Belum ada kelas</h3>
          <p style={styles.emptyText}>Anda belum terdaftar di kelas manapun</p>
        </div>
      ) : (
        <div style={styles.kelasGrid}>
          {enrolledKelas.map(kelas => (
            <div 
              key={kelas.id} 
              style={styles.kelasCard}
              onClick={() => onSelectKelas(kelas)}
            >
              <div style={styles.kelasCardHeader}>
                <div style={styles.kelasIcon}>{kelas.nama_kelas.charAt(0)}</div>
                <div style={styles.kelasInfo}>
                  <h3 style={styles.kelasName}>{kelas.nama_kelas}</h3>
                  <p style={styles.kelasGuru}>{kelas.guru?.name || "Guru"}</p>
                </div>
              </div>
              <p style={styles.kelasDesc}>{kelas.deskripsi || "Tidak ada deskripsi"}</p>
              <div style={styles.kelasStats}>
                <span style={styles.kelasStat}>
                  <span style={styles.statIcon}>&#128214;</span> 
                  {kelas.jumlah_materi || "3"} Materi
                </span>
                <span style={styles.kelasStat}>
                  <span style={styles.statIcon}>&#128100;</span> 
                  {kelas.jumlah_murid || "20"} Murid
                </span>
              </div>
              <div style={styles.kelasCardFooter}>
                <span style={styles.enterClass}>Masuk Kelas &#8594;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KelasDetailView({ kelas, onSelectMateri, demoPengumpulan }) {
  const [materis, setMateris] = useState([])
  const [presensis, setPresensis] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("materi")

  useEffect(() => {
    loadData()
  }, [kelas.id])

  const loadData = async () => {
    setLoading(true)
    if (isDemoMode()) {
      setMateris(DEMO_MATERIS[kelas.id] || [])
      setPresensis(DEMO_PRESENSI[kelas.id] || [])
      setLoading(false)
      return
    }
    try {
      const materiData = await fetchMateris(kelas.id)
      setMateris(materiData.materis || [])
      const presensiData = await fetchMyPresensi()
      setPresensis(presensiData.presensis || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getPresensiStats = () => {
    const total = presensis.length
    const hadir = presensis.filter(p => p.status === "hadir").length
    const izin = presensis.filter(p => p.status === "izin").length
    const alfa = presensis.filter(p => p.status === "alfa").length
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0
    return { total, hadir, izin, alfa, percentage }
  }

  const stats = getPresensiStats()

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data kelas...</p>
      </div>
    )
  }

  return (
    <div style={styles.viewContainer}>
      {/* Kelas Header */}
      <div style={styles.kelasDetailHeader}>
        <div style={styles.kelasDetailIcon}>{kelas.nama_kelas.charAt(0)}</div>
        <div style={styles.kelasDetailInfo}>
          <h1 style={styles.kelasDetailTitle}>{kelas.nama_kelas}</h1>
          <p style={styles.kelasDetailGuru}>Pengajar: {kelas.guru?.name || "Guru"}</p>
          <p style={styles.kelasDetailDesc}>{kelas.deskripsi}</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={styles.sectionTabs}>
        <button 
          style={{...styles.sectionTab, ...(activeSection === "materi" ? styles.sectionTabActive : {})}}
          onClick={() => setActiveSection("materi")}
        >
          Materi ({materis.length})
        </button>
        <button 
          style={{...styles.sectionTab, ...(activeSection === "presensi" ? styles.sectionTabActive : {})}}
          onClick={() => setActiveSection("presensi")}
        >
          Presensi
        </button>
      </div>

      {/* Materi Section */}
      {activeSection === "materi" && (
        <div style={styles.sectionContent}>
          {materis.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>&#128203;</div>
              <h3 style={styles.emptyTitle}>Belum ada materi</h3>
              <p style={styles.emptyText}>Guru belum menambahkan materi untuk kelas ini</p>
            </div>
          ) : (
            <div style={styles.materiList}>
              {materis.map((materi, index) => (
                <div 
                  key={materi.id} 
                  style={styles.materiCard}
                  onClick={() => onSelectMateri(materi)}
                >
                  <div style={styles.materiNumber}>{index + 1}</div>
                  <div style={styles.materiContent}>
                    <h3 style={styles.materiTitle}>{materi.judul}</h3>
                    <p style={styles.materiPreview}>
                      {materi.konten?.substring(0, 100)}...
                    </p>
                    <span style={styles.materiDate}>
                      {materi.created_at ? new Date(materi.created_at).toLocaleDateString('id-ID') : ""}
                    </span>
                  </div>
                  <div style={styles.materiArrow}>&#8594;</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Presensi Section */}
      {activeSection === "presensi" && (
        <div style={styles.sectionContent}>
          {/* Stats Cards */}
          <div style={styles.presensiStats}>
            <div style={{...styles.presensiStatCard, backgroundColor: "#EBF5FF"}}>
              <span style={styles.presensiStatValue}>{stats.total}</span>
              <span style={styles.presensiStatLabel}>Total Pertemuan</span>
            </div>
            <div style={{...styles.presensiStatCard, backgroundColor: "#E6F7E6"}}>
              <span style={{...styles.presensiStatValue, color: "#2E7D32"}}>{stats.hadir}</span>
              <span style={styles.presensiStatLabel}>Hadir</span>
            </div>
            <div style={{...styles.presensiStatCard, backgroundColor: "#FFF8E1"}}>
              <span style={{...styles.presensiStatValue, color: "#F57C00"}}>{stats.izin}</span>
              <span style={styles.presensiStatLabel}>Izin</span>
            </div>
            <div style={{...styles.presensiStatCard, backgroundColor: "#FFEBEE"}}>
              <span style={{...styles.presensiStatValue, color: "#C62828"}}>{stats.alfa}</span>
              <span style={styles.presensiStatLabel}>Alfa</span>
            </div>
          </div>

          {/* Percentage Bar */}
          <div style={styles.percentageContainer}>
            <div style={styles.percentageHeader}>
              <span>Tingkat Kehadiran</span>
              <span style={styles.percentageValue}>{stats.percentage}%</span>
            </div>
            <div style={styles.percentageBar}>
              <div style={{...styles.percentageFill, width: `${stats.percentage}%`}}></div>
            </div>
          </div>

          {/* Presensi List */}
          <h3 style={styles.presensiListTitle}>Riwayat Presensi</h3>
          {presensis.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Belum ada data presensi</p>
            </div>
          ) : (
            <div style={styles.presensiList}>
              {presensis.map(p => (
                <div key={p.id} style={styles.presensiItem}>
                  <span style={styles.presensiDate}>
                    {new Date(p.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span style={{
                    ...styles.presensiBadge,
                    backgroundColor: p.status === "hadir" ? "#E6F7E6" : p.status === "izin" ? "#FFF8E1" : "#FFEBEE",
                    color: p.status === "hadir" ? "#2E7D32" : p.status === "izin" ? "#F57C00" : "#C62828"
                  }}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MateriDetailView({ materi, kelas, onSelectTugas, demoPengumpulan }) {
  const [tugasList, setTugasList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTugas()
  }, [materi.id])

  const loadTugas = async () => {
    setLoading(true)
    if (isDemoMode()) {
      // Get tugas for this materi
      const allTugas = DEMO_TUGAS[materi.id] || []
      setTugasList(allTugas)
      setLoading(false)
      return
    }
    try {
      const data = await fetchTugas(kelas.id)
      // Filter tugas by materi if materi_id is available
      const filtered = (data.tugass || []).filter(t => t.materi_id === materi.id || !t.materi_id)
      setTugasList(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isSubmitted = (tugasId) => demoPengumpulan.some(p => p.tugas_id === tugasId)

  return (
    <div style={styles.viewContainer}>
      {/* Materi Content */}
      <div style={styles.materiDetailContainer}>
        <div style={styles.materiDetailHeader}>
          <span style={styles.materiDetailKelas}>{kelas.nama_kelas}</span>
          <h1 style={styles.materiDetailTitle}>{materi.judul}</h1>
          {materi.created_at && (
            <span style={styles.materiDetailDate}>
              Ditambahkan pada {new Date(materi.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <div style={styles.materiDetailContent}>
          {materi.konten?.split('\n').map((paragraph, index) => (
            <p key={index} style={styles.materiParagraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Tugas Section */}
      <div style={styles.tugasSection}>
        <h2 style={styles.tugasSectionTitle}>Tugas untuk Materi Ini</h2>
        
        {loading ? (
          <div style={styles.loadingSmall}>Memuat tugas...</div>
        ) : tugasList.length === 0 ? (
          <div style={styles.noTugas}>
            <span style={styles.noTugasIcon}>&#10003;</span>
            <p>Tidak ada tugas untuk materi ini</p>
          </div>
        ) : (
          <div style={styles.tugasList}>
            {tugasList.map(tugas => {
              const deadline = new Date(tugas.deadline)
              const isLate = new Date() > deadline
              const submitted = isSubmitted(tugas.id)

              return (
                <div 
                  key={tugas.id} 
                  style={{
                    ...styles.tugasCard,
                    ...(submitted ? styles.tugasCardSubmitted : {}),
                    ...(isLate && !submitted ? styles.tugasCardLate : {})
                  }}
                  onClick={() => onSelectTugas(tugas)}
                >
                  <div style={styles.tugasCardLeft}>
                    <div style={{
                      ...styles.tugasStatus,
                      backgroundColor: submitted ? "#E6F7E6" : isLate ? "#FFEBEE" : "#EBF5FF"
                    }}>
                      {submitted ? "&#10003;" : isLate ? "!" : "&#9998;"}
                    </div>
                  </div>
                  <div style={styles.tugasCardContent}>
                    <h4 style={styles.tugasTitle}>{tugas.judul}</h4>
                    <p style={styles.tugasDesc}>{tugas.deskripsi}</p>
                    <div style={styles.tugasDeadline}>
                      <span style={styles.deadlineIcon}>&#128197;</span>
                      Deadline: {deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {isLate && !submitted && <span style={styles.lateTag}> TERLAMBAT</span>}
                      {submitted && <span style={styles.submittedTag}> SUDAH DIKUMPULKAN</span>}
                    </div>
                  </div>
                  <div style={styles.tugasArrow}>&#8594;</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function TugasDetailView({ tugas, demoPengumpulan, setDemoPengumpulan }) {
  const [jawaban, setJawaban] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submission, setSubmission] = useState(null)

  useEffect(() => {
    // Check if already submitted
    const existing = demoPengumpulan.find(p => p.tugas_id === tugas.id)
    if (existing) {
      setSubmission(existing)
      setJawaban(existing.jawaban_teks)
    }
  }, [tugas.id, demoPengumpulan])

  const handleSubmit = async () => {
    if (!jawaban.trim()) return
    setIsSubmitting(true)

    if (isDemoMode()) {
      // Simulate submission with random grade for demo
      const newSubmission = {
        id: Date.now(),
        tugas_id: tugas.id,
        jawaban_teks: jawaban,
        nilai: Math.floor(Math.random() * 30) + 70, // Random grade 70-100 for demo
        feedback_guru: "Bagus! Terus tingkatkan.",
        submitted_at: new Date().toISOString()
      }
      setDemoPengumpulan(prev => [...prev.filter(p => p.tugas_id !== tugas.id), newSubmission])
      setSubmission(newSubmission)
      setIsSubmitting(false)
      return
    }

    try {
      await submitTugas({
        tugas_id: tugas.id,
        jawaban_teks: jawaban
      })
      // Refresh submission
      const data = await fetchMyPengumpulan()
      const sub = (data.pengumpulans || []).find(p => p.tugas_id === tugas.id)
      setSubmission(sub)
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const deadline = new Date(tugas.deadline)
  const isLate = new Date() > deadline
  const canSubmit = !submission && !isLate

  return (
    <div style={styles.viewContainer}>
      <div style={styles.tugasDetailContainer}>
        {/* Tugas Header */}
        <div style={styles.tugasDetailHeader}>
          <h1 style={styles.tugasDetailTitle}>{tugas.judul}</h1>
          <div style={styles.tugasDetailMeta}>
            <span style={{
              ...styles.tugasStatusBadge,
              backgroundColor: submission ? "#E6F7E6" : isLate ? "#FFEBEE" : "#FFF8E1",
              color: submission ? "#2E7D32" : isLate ? "#C62828" : "#F57C00"
            }}>
              {submission ? "Sudah Dikumpulkan" : isLate ? "Terlambat" : "Belum Dikumpulkan"}
            </span>
            <span style={styles.tugasDetailDeadline}>
              Deadline: {deadline.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Tugas Description */}
        <div style={styles.tugasDetailSection}>
          <h3 style={styles.tugasDetailSectionTitle}>Deskripsi Tugas</h3>
          <p style={styles.tugasDetailDesc}>{tugas.deskripsi}</p>
        </div>

        {/* Answer Section */}
        <div style={styles.tugasDetailSection}>
          <h3 style={styles.tugasDetailSectionTitle}>
            {submission ? "Jawaban Anda" : "Tulis Jawaban"}
          </h3>
          
          {canSubmit ? (
            <>
              <textarea
                value={jawaban}
                onChange={(e) => setJawaban(e.target.value)}
                placeholder="Tulis jawaban Anda di sini..."
                style={styles.jawabanTextarea}
              />
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !jawaban.trim()}
                style={{
                  ...styles.submitButton,
                  opacity: isSubmitting || !jawaban.trim() ? 0.6 : 1
                }}
              >
                {isSubmitting ? "Mengirim..." : "Kumpulkan Jawaban"}
              </button>
            </>
          ) : (
            <div style={styles.submittedAnswer}>
              <p style={styles.answerText}>{jawaban || submission?.jawaban_teks}</p>
              {submission?.submitted_at && (
                <span style={styles.submittedTime}>
                  Dikumpulkan pada {new Date(submission.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Grade Section */}
        {submission && (
          <div style={styles.gradeSection}>
            <h3 style={styles.tugasDetailSectionTitle}>Nilai</h3>
            {submission.nilai !== null && submission.nilai !== undefined ? (
              <div style={styles.gradeContainer}>
                <div style={styles.gradeCircle}>
                  <span style={styles.gradeValue}>{submission.nilai}</span>
                  <span style={styles.gradeMax}>/100</span>
                </div>
                {submission.feedback_guru && (
                  <div style={styles.feedbackBox}>
                    <span style={styles.feedbackLabel}>Feedback dari Guru:</span>
                    <p style={styles.feedbackText}>{submission.feedback_guru}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.pendingGrade}>
                <span style={styles.pendingIcon}>&#9203;</span>
                <p>Menunggu penilaian dari guru</p>
              </div>
            )}
          </div>
        )}

        {/* Late Notice */}
        {isLate && !submission && (
          <div style={styles.lateNotice}>
            <span style={styles.lateNoticeIcon}>&#9888;</span>
            <p>Batas waktu pengumpulan telah lewat. Anda tidak dapat mengumpulkan tugas ini.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ STYLES ============
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F5F7FA",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  
  // Header
  header: {
    backgroundColor: "#1F4E79",
    color: "white",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  roleTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#548235",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "1rem",
  },
  userName: {
    fontSize: "0.95rem",
  },
  logoutBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "transparent",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s",
  },

  // Breadcrumb
  breadcrumbContainer: {
    backgroundColor: "white",
    padding: "0.75rem 2rem",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    borderBottom: "1px solid #E5E7EB",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#F3F4F6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#374151",
    transition: "background-color 0.2s",
  },
  backIcon: {
    fontSize: "1.1rem",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  breadcrumbItem: {
    display: "flex",
    alignItems: "center",
  },
  breadcrumbSeparator: {
    margin: "0 0.5rem",
    color: "#9CA3AF",
  },
  breadcrumbLink: {
    background: "none",
    border: "none",
    color: "#1F4E79",
    cursor: "pointer",
    fontSize: "0.9rem",
    textDecoration: "underline",
  },
  breadcrumbCurrent: {
    color: "#6B7280",
    fontSize: "0.9rem",
  },

  // Main
  main: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  // View Container
  viewContainer: {
    animation: "fadeIn 0.3s ease",
  },
  viewHeader: {
    marginBottom: "2rem",
  },
  viewTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1F2937",
    margin: "0 0 0.5rem 0",
  },
  viewSubtitle: {
    color: "#6B7280",
    margin: 0,
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
    borderTop: "3px solid #1F4E79",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "1rem",
  },
  loadingSmall: {
    padding: "1rem",
    textAlign: "center",
    color: "#6B7280",
  },

  // Empty State
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.25rem",
    color: "#374151",
    margin: "0 0 0.5rem 0",
  },
  emptyText: {
    color: "#6B7280",
    margin: 0,
  },

  // Kelas Grid
  kelasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
  },
  kelasCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "2px solid transparent",
  },
  kelasCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  kelasIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#1F4E79",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    fontWeight: "700",
  },
  kelasInfo: {
    flex: 1,
  },
  kelasName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 0.25rem 0",
  },
  kelasGuru: {
    color: "#6B7280",
    fontSize: "0.9rem",
    margin: 0,
  },
  kelasDesc: {
    color: "#4B5563",
    fontSize: "0.9rem",
    lineHeight: "1.5",
    marginBottom: "1rem",
  },
  kelasStats: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1rem",
  },
  kelasStat: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.85rem",
    color: "#6B7280",
  },
  statIcon: {
    fontSize: "1rem",
  },
  kelasCardFooter: {
    paddingTop: "1rem",
    borderTop: "1px solid #E5E7EB",
  },
  enterClass: {
    color: "#1F4E79",
    fontWeight: "600",
    fontSize: "0.9rem",
  },

  // Kelas Detail Header
  kelasDetailHeader: {
    display: "flex",
    gap: "1.5rem",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  kelasDetailIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "14px",
    backgroundColor: "#1F4E79",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  kelasDetailInfo: {
    flex: 1,
  },
  kelasDetailTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1F2937",
    margin: "0 0 0.5rem 0",
  },
  kelasDetailGuru: {
    color: "#1F4E79",
    fontWeight: "500",
    margin: "0 0 0.5rem 0",
  },
  kelasDetailDesc: {
    color: "#6B7280",
    margin: 0,
    lineHeight: "1.5",
  },

  // Section Tabs
  sectionTabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  sectionTab: {
    padding: "0.75rem 1.5rem",
    border: "none",
    backgroundColor: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "#6B7280",
    transition: "all 0.2s",
  },
  sectionTabActive: {
    backgroundColor: "#1F4E79",
    color: "white",
  },
  sectionContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  // Materi List
  materiList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  materiCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid #E5E7EB",
  },
  materiNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#1F4E79",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    flexShrink: 0,
  },
  materiContent: {
    flex: 1,
  },
  materiTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 0.35rem 0",
  },
  materiPreview: {
    color: "#6B7280",
    fontSize: "0.85rem",
    margin: "0 0 0.35rem 0",
    lineHeight: "1.4",
  },
  materiDate: {
    color: "#9CA3AF",
    fontSize: "0.8rem",
  },
  materiArrow: {
    color: "#9CA3AF",
    fontSize: "1.25rem",
  },

  // Presensi
  presensiStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  presensiStatCard: {
    padding: "1.25rem",
    borderRadius: "10px",
    textAlign: "center",
  },
  presensiStatValue: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1F4E79",
  },
  presensiStatLabel: {
    fontSize: "0.85rem",
    color: "#6B7280",
  },
  percentageContainer: {
    marginBottom: "2rem",
  },
  percentageHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
    color: "#374151",
  },
  percentageValue: {
    fontWeight: "600",
    color: "#1F4E79",
  },
  percentageBar: {
    height: "8px",
    backgroundColor: "#E5E7EB",
    borderRadius: "4px",
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    backgroundColor: "#548235",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  presensiListTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "1rem",
  },
  presensiList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  presensiItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
  },
  presensiDate: {
    color: "#374151",
    fontSize: "0.9rem",
  },
  presensiBadge: {
    padding: "0.35rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },

  // Materi Detail
  materiDetailContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  materiDetailHeader: {
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #E5E7EB",
  },
  materiDetailKelas: {
    display: "inline-block",
    padding: "0.35rem 0.75rem",
    backgroundColor: "#EBF5FF",
    color: "#1F4E79",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "500",
    marginBottom: "0.75rem",
  },
  materiDetailTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1F2937",
    margin: "0 0 0.5rem 0",
  },
  materiDetailDate: {
    color: "#9CA3AF",
    fontSize: "0.85rem",
  },
  materiDetailContent: {
    lineHeight: "1.8",
  },
  materiParagraph: {
    color: "#374151",
    marginBottom: "1rem",
  },

  // Tugas Section
  tugasSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tugasSectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: "1rem",
  },
  noTugas: {
    textAlign: "center",
    padding: "2rem",
    color: "#6B7280",
  },
  noTugasIcon: {
    display: "block",
    fontSize: "2rem",
    color: "#548235",
    marginBottom: "0.5rem",
  },
  tugasList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  tugasCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid #E5E7EB",
  },
  tugasCardSubmitted: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  tugasCardLate: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  tugasCardLeft: {},
  tugasStatus: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
  },
  tugasCardContent: {
    flex: 1,
  },
  tugasTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1F2937",
    margin: "0 0 0.35rem 0",
  },
  tugasDesc: {
    color: "#6B7280",
    fontSize: "0.85rem",
    margin: "0 0 0.5rem 0",
  },
  tugasDeadline: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.8rem",
    color: "#6B7280",
  },
  deadlineIcon: {
    fontSize: "0.9rem",
  },
  lateTag: {
    color: "#DC2626",
    fontWeight: "600",
  },
  submittedTag: {
    color: "#16A34A",
    fontWeight: "600",
  },
  tugasArrow: {
    color: "#9CA3AF",
    fontSize: "1.25rem",
  },

  // Tugas Detail
  tugasDetailContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tugasDetailHeader: {
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #E5E7EB",
  },
  tugasDetailTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1F2937",
    margin: "0 0 1rem 0",
  },
  tugasDetailMeta: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  tugasStatusBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  tugasDetailDeadline: {
    color: "#6B7280",
    fontSize: "0.9rem",
  },
  tugasDetailSection: {
    marginBottom: "2rem",
  },
  tugasDetailSectionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "1rem",
  },
  tugasDetailDesc: {
    color: "#4B5563",
    lineHeight: "1.6",
  },
  jawabanTextarea: {
    width: "100%",
    minHeight: "200px",
    padding: "1rem",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    fontSize: "1rem",
    lineHeight: "1.6",
    resize: "vertical",
    fontFamily: "inherit",
    marginBottom: "1rem",
  },
  submitButton: {
    padding: "0.875rem 2rem",
    backgroundColor: "#548235",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  submittedAnswer: {
    padding: "1.5rem",
    backgroundColor: "#F9FAFB",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
  },
  answerText: {
    color: "#374151",
    lineHeight: "1.6",
    margin: "0 0 1rem 0",
    whiteSpace: "pre-wrap",
  },
  submittedTime: {
    color: "#9CA3AF",
    fontSize: "0.85rem",
  },
  gradeSection: {
    marginTop: "2rem",
    paddingTop: "2rem",
    borderTop: "1px solid #E5E7EB",
  },
  gradeContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "2rem",
    flexWrap: "wrap",
  },
  gradeCircle: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "#EBF5FF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  gradeValue: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#1F4E79",
  },
  gradeMax: {
    fontSize: "1rem",
    color: "#6B7280",
  },
  feedbackBox: {
    flex: 1,
    padding: "1.25rem",
    backgroundColor: "#F0FDF4",
    borderRadius: "10px",
    border: "1px solid #BBF7D0",
  },
  feedbackLabel: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#166534",
    marginBottom: "0.5rem",
  },
  feedbackText: {
    color: "#374151",
    margin: 0,
    lineHeight: "1.5",
  },
  pendingGrade: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#FFF8E1",
    borderRadius: "10px",
    color: "#6B7280",
  },
  pendingIcon: {
    display: "block",
    fontSize: "2rem",
    marginBottom: "0.5rem",
  },
  lateNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    padding: "1.25rem",
    backgroundColor: "#FEF2F2",
    borderRadius: "10px",
    marginTop: "2rem",
  },
  lateNoticeIcon: {
    fontSize: "1.5rem",
    color: "#DC2626",
  },
}

// Add CSS animation
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .kelas-card:hover {
    border-color: #1F4E79;
    box-shadow: 0 4px 12px rgba(31, 78, 121, 0.15);
  }
`
document.head.appendChild(styleSheet)

export default MuridDashboard
