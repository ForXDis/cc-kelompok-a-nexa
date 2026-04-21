import { useState, useEffect } from 'react'
import theme from '../styles/theme'
import useResponsive from '../hooks/useResponsive'
import LayoutWrapper from './layout/LayoutWrapper'
import { Card, Button, Badge, StatCard, SubjectCard, EmptyState, Textarea } from './ui'
import {
  fetchKelas,
  fetchMateris,
  fetchTugas,
  submitTugas,
  fetchMyPengumpulan,
  fetchMyPresensi,
} from '../services/api'

// Demo Mode checker
const isDemoMode = () => localStorage.getItem('demo_mode') === 'true'

// Demo Data
const DEMO_KELAS = [
  { id: 1, nama_kelas: 'Matematika Dasar', deskripsi: 'Kelas matematika untuk pemula', guru: { name: 'Pak Ahmad' }, jumlah_materi: 3, jumlah_murid: 24 },
  { id: 2, nama_kelas: 'Bahasa Inggris', deskripsi: 'Kelas bahasa Inggris conversation', guru: { name: 'Bu Sarah' }, jumlah_materi: 2, jumlah_murid: 18 },
  { id: 3, nama_kelas: 'Fisika SMA', deskripsi: 'Fisika untuk persiapan UTBK', guru: { name: 'Pak Budi' }, jumlah_materi: 4, jumlah_murid: 15 },
]

const DEMO_MATERIS = {
  1: [
    { id: 1, judul: 'Pengenalan Aljabar', konten: 'Materi dasar aljabar meliputi variabel, konstanta, dan operasi dasar.\n\nKonsep dasar:\n1. Variabel adalah simbol yang mewakili nilai yang tidak diketahui\n2. Konstanta adalah nilai tetap\n3. Koefisien adalah angka yang mengalikan variabel', created_at: '2024-01-15' },
    { id: 2, judul: 'Persamaan Linear', konten: 'Cara menyelesaikan persamaan linear satu variabel.\n\nContoh: 2x + 5 = 15\nPenyelesaian:\n2x = 15 - 5\n2x = 10\nx = 5', created_at: '2024-01-20' },
    { id: 3, judul: 'Sistem Persamaan Linear', konten: 'Metode eliminasi dan substitusi untuk menyelesaikan sistem persamaan linear dua variabel.', created_at: '2024-01-25' },
  ],
  2: [
    { id: 4, judul: 'Basic Grammar', konten: 'Tenses, articles, dan struktur kalimat dasar dalam bahasa Inggris.', created_at: '2024-01-10' },
    { id: 5, judul: 'Vocabulary Building', konten: 'Teknik memperkaya kosakata bahasa Inggris.', created_at: '2024-01-18' },
  ],
  3: [
    { id: 6, judul: 'Hukum Newton', konten: 'Tiga hukum Newton tentang gerak.', created_at: '2024-01-12' },
    { id: 7, judul: 'Kinematika', konten: 'Gerak lurus beraturan (GLB) dan GLBB.', created_at: '2024-01-19' },
  ]
}

const DEMO_TUGAS = {
  1: { id: 1, judul: 'Latihan Aljabar', deskripsi: 'Kerjakan 10 soal aljabar', deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
  2: { id: 2, judul: 'Quiz Persamaan Linear', deskripsi: 'Quiz singkat persamaan linear', deadline: new Date(Date.now() + 3*24*60*60*1000).toISOString() },
  4: { id: 3, judul: 'Essay Writing', deskripsi: 'Tulis essay pendek tentang daily routine', deadline: new Date(Date.now() + 5*24*60*60*1000).toISOString() },
}

const DEMO_PRESENSI = [
  { id: 1, tanggal: '2024-01-15', status: 'hadir' },
  { id: 2, tanggal: '2024-01-17', status: 'hadir' },
  { id: 3, tanggal: '2024-01-19', status: 'izin' },
  { id: 4, tanggal: '2024-01-22', status: 'hadir' },
]

// Navigation views
const VIEWS = {
  DASHBOARD: 'dashboard',
  KELAS_DETAIL: 'kelas_detail',
  MATERI_DETAIL: 'materi_detail',
  TUGAS_DETAIL: 'tugas_detail',
}

// Menu items for sidebar
const MENU_ITEMS = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )
  },
  { 
    id: 'kelas', 
    label: 'Kelas Saya', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  },
  { 
    id: 'tugas', 
    label: 'Tugas', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    badge: '3'
  },
  { 
    id: 'nilai', 
    label: 'Nilai', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
]

const StudentDashboard = ({ user, onLogout }) => {
  const { isMobile } = useResponsive()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD)
  
  // Data states
  const [enrolledKelas, setEnrolledKelas] = useState([])
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [selectedMateri, setSelectedMateri] = useState(null)
  const [selectedTugas, setSelectedTugas] = useState(null)
  const [materis, setMateris] = useState([])
  const [presensis, setPresensis] = useState([])
  const [pengumpulanList, setPengumpulanList] = useState([])
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Demo states
  const [demoPengumpulan, setDemoPengumpulan] = useState([])

  // Load initial data
  useEffect(() => {
    loadKelas()
    loadPengumpulan()
  }, [])

  useEffect(() => {
    if (selectedKelas) {
      loadMateris(selectedKelas.id)
      loadPresensi()
    }
  }, [selectedKelas])

  // Data loading functions
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMateris = async (kelasId) => {
    if (isDemoMode()) {
      setMateris(DEMO_MATERIS[kelasId] || [])
      return
    }
    try {
      const data = await fetchMateris(kelasId)
      setMateris(data.materis || [])
    } catch (err) {
      console.error('Error load materis:', err)
    }
  }

  const loadPresensi = async () => {
    if (isDemoMode()) {
      setPresensis(DEMO_PRESENSI)
      return
    }
    try {
      const data = await fetchMyPresensi()
      setPresensis(data.presensis || [])
    } catch (err) {
      console.error('Error load presensi:', err)
    }
  }

  const loadPengumpulan = async () => {
    if (isDemoMode()) return
    try {
      const data = await fetchMyPengumpulan()
      setPengumpulanList(data.pengumpulans || [])
    } catch (err) {
      console.error('Error loading pengumpulan:', err)
    }
  }

  // Navigation functions
  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId)
    if (menuId === 'dashboard' || menuId === 'kelas') {
      setCurrentView(VIEWS.DASHBOARD)
      setSelectedKelas(null)
      setSelectedMateri(null)
      setSelectedTugas(null)
    }
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
      setCurrentView(VIEWS.DASHBOARD)
      setSelectedKelas(null)
    }
  }

  // Submit tugas handler
  const handleSubmitTugas = async (tugasId, jawaban) => {
    if (isDemoMode()) {
      const newSubmit = { id: Date.now(), tugas_id: tugasId, jawaban, submitted_at: new Date().toISOString(), nilai: null }
      setDemoPengumpulan([...demoPengumpulan, newSubmit])
      return
    }
    try {
      await submitTugas({ tugas_id: tugasId, jawaban })
      loadPengumpulan()
    } catch (err) {
      setError(err.message)
    }
  }

  // Get presensi stats
  const getPresensiStats = () => {
    const total = presensis.length
    const hadir = presensis.filter(p => p.status === 'hadir').length
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0
    return { total, hadir, percentage }
  }

  // Get page title based on current view
  const getPageTitle = () => {
    switch (currentView) {
      case VIEWS.KELAS_DETAIL:
        return selectedKelas?.nama_kelas || 'Detail Kelas'
      case VIEWS.MATERI_DETAIL:
        return selectedMateri?.judul || 'Detail Materi'
      case VIEWS.TUGAS_DETAIL:
        return selectedTugas?.judul || 'Detail Tugas'
      default:
        return 'Dashboard Pelajar'
    }
  }

  const getPageSubtitle = () => {
    switch (currentView) {
      case VIEWS.KELAS_DETAIL:
        return `Pengajar: ${selectedKelas?.guru?.name || 'Tidak diketahui'}`
      case VIEWS.MATERI_DETAIL:
        return 'Pelajari materi dengan seksama'
      case VIEWS.TUGAS_DETAIL:
        return `Deadline: ${new Date(selectedTugas?.deadline).toLocaleDateString('id-ID')}`
      default:
        return `Selamat belajar, ${user?.name || 'Pelajar'}`
    }
  }

  const styles = getStyles(isMobile)

  return (
    <LayoutWrapper
      user={user}
      onLogout={onLogout}
      menuItems={MENU_ITEMS}
      activeMenu={activeMenu}
      onMenuClick={handleMenuClick}
      pageTitle={getPageTitle()}
      pageSubtitle={getPageSubtitle()}
    >
      {/* Error Alert */}
      {error && (
        <div style={styles.errorAlert}>
          <span>{error}</span>
          <button style={styles.errorClose} onClick={() => setError('')}>x</button>
        </div>
      )}

      {/* Back Button for sub-views */}
      {currentView !== VIEWS.DASHBOARD && (
        <button style={styles.backButton} onClick={goBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali
        </button>
      )}

      {/* Dashboard View */}
      {currentView === VIEWS.DASHBOARD && (
        <DashboardView 
          enrolledKelas={enrolledKelas}
          loading={loading}
          onSelectKelas={goToKelasDetail}
          isMobile={isMobile}
        />
      )}

      {/* Kelas Detail View */}
      {currentView === VIEWS.KELAS_DETAIL && selectedKelas && (
        <KelasDetailView
          kelas={selectedKelas}
          materis={materis}
          presensis={presensis}
          onSelectMateri={goToMateriDetail}
          isMobile={isMobile}
        />
      )}

      {/* Materi Detail View */}
      {currentView === VIEWS.MATERI_DETAIL && selectedMateri && selectedKelas && (
        <MateriDetailView
          materi={selectedMateri}
          kelasId={selectedKelas.id}
          onSelectTugas={goToTugasDetail}
          demoPengumpulan={demoPengumpulan}
          isMobile={isMobile}
        />
      )}

      {/* Tugas Detail View */}
      {currentView === VIEWS.TUGAS_DETAIL && selectedTugas && (
        <TugasDetailView
          tugas={selectedTugas}
          demoPengumpulan={demoPengumpulan}
          realPengumpulan={pengumpulanList}
          onSubmit={handleSubmitTugas}
          isMobile={isMobile}
        />
      )}
    </LayoutWrapper>
  )
}

// ============================================
// SUB COMPONENTS
// ============================================

const DashboardView = ({ enrolledKelas, loading, onSelectKelas, isMobile }) => {
  const styles = getStyles(isMobile)

  // Calculate stats
  const totalMateri = enrolledKelas.reduce((acc, k) => acc + (k.jumlah_materi || 3), 0)

  return (
    <div>
      {/* Stats Row */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          label="Kelas Aktif"
          value={enrolledKelas.length}
        />
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          label="Total Materi"
          value={totalMateri}
        />
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
          label="Kehadiran"
          value="95%"
          trend="+5%"
          trendDirection="up"
        />
      </div>

      {/* Welcome Card */}
      <Card padding="lg" style={{ marginBottom: theme.spacing[6] }}>
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeContent}>
            <h2 style={styles.welcomeTitle}>Selamat Belajar!</h2>
            <p style={styles.welcomeText}>
              Pilih kelas di bawah untuk mulai belajar. Setiap kelas berisi materi dan tugas yang harus kamu selesaikan.
            </p>
          </div>
          <div style={styles.welcomeIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary.main} strokeWidth="1.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
        </div>
      </Card>

      {/* Kelas Section */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Kelas Saya</h2>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <p>Memuat kelas...</p>
        </div>
      ) : enrolledKelas.length === 0 ? (
        <EmptyState
          icon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          title="Belum Ada Kelas"
          description="Kamu belum terdaftar di kelas manapun. Hubungi guru untuk didaftarkan."
        />
      ) : (
        <div style={styles.kelasGrid}>
          {enrolledKelas.map((kelas) => (
            <SubjectCard
              key={kelas.id}
              title={kelas.nama_kelas}
              description={kelas.deskripsi || 'Tidak ada deskripsi'}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              }
              stats={[
                { value: kelas.jumlah_materi || '3', label: 'Materi' },
                { value: kelas.guru?.name || 'Guru', label: 'Pengajar' },
              ]}
              onClick={() => onSelectKelas(kelas)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const KelasDetailView = ({ kelas, materis, presensis, onSelectMateri, isMobile }) => {
  const styles = getStyles(isMobile)
  const [activeTab, setActiveTab] = useState('materi')

  // Calculate presensi stats
  const presensiStats = {
    total: presensis.length,
    hadir: presensis.filter(p => p.status === 'hadir').length,
    izin: presensis.filter(p => p.status === 'izin').length,
    alfa: presensis.filter(p => p.status === 'alfa').length,
  }
  presensiStats.percentage = presensiStats.total > 0 
    ? Math.round((presensiStats.hadir / presensiStats.total) * 100) 
    : 0

  return (
    <div>
      {/* Kelas Info Card */}
      <Card padding="lg" style={{ marginBottom: theme.spacing[6] }}>
        <h3 style={styles.cardTitle}>{kelas.nama_kelas}</h3>
        <p style={styles.cardDesc}>{kelas.deskripsi}</p>
        <div style={styles.kelasStats}>
          <div style={styles.kelasStat}>
            <span style={styles.kelasStatValue}>{materis.length}</span>
            <span style={styles.kelasStatLabel}>Materi</span>
          </div>
          <div style={styles.kelasStat}>
            <span style={styles.kelasStatValue}>{presensiStats.percentage}%</span>
            <span style={styles.kelasStatLabel}>Kehadiran</span>
          </div>
          <div style={styles.kelasStat}>
            <span style={styles.kelasStatValue}>{kelas.guru?.name || '-'}</span>
            <span style={styles.kelasStatLabel}>Pengajar</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'materi' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('materi')}
        >
          Materi ({materis.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'presensi' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('presensi')}
        >
          Kehadiran
        </button>
      </div>

      {/* Materi Tab */}
      {activeTab === 'materi' && (
        <div>
          {materis.length === 0 ? (
            <EmptyState
              title="Belum Ada Materi"
              description="Guru belum menambahkan materi untuk kelas ini"
            />
          ) : (
            <div style={styles.listContainer}>
              {materis.map((materi, index) => (
                <Card key={materi.id} padding="md" style={styles.listItem} onClick={() => onSelectMateri(materi)}>
                  <div style={styles.listItemContent}>
                    <div style={styles.listItemNumber}>{index + 1}</div>
                    <div style={styles.listItemText}>
                      <h4 style={styles.listItemTitle}>{materi.judul}</h4>
                      <p style={styles.listItemDesc}>{materi.konten?.substring(0, 80)}...</p>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.text.secondary} strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Presensi Tab */}
      {activeTab === 'presensi' && (
        <div>
          {/* Presensi Stats */}
          <div style={styles.presensiStatsGrid}>
            <Card padding="md" style={styles.presensiStatCard}>
              <span style={{ ...styles.presensiStatValue, color: theme.colors.success.main }}>{presensiStats.hadir}</span>
              <span style={styles.presensiStatLabel}>Hadir</span>
            </Card>
            <Card padding="md" style={styles.presensiStatCard}>
              <span style={{ ...styles.presensiStatValue, color: theme.colors.warning.main }}>{presensiStats.izin}</span>
              <span style={styles.presensiStatLabel}>Izin</span>
            </Card>
            <Card padding="md" style={styles.presensiStatCard}>
              <span style={{ ...styles.presensiStatValue, color: theme.colors.danger.main }}>{presensiStats.alfa}</span>
              <span style={styles.presensiStatLabel}>Alfa</span>
            </Card>
          </div>

          {/* Presensi List */}
          {presensis.length === 0 ? (
            <EmptyState
              title="Belum Ada Data Kehadiran"
              description="Data kehadiran akan muncul setelah guru melakukan absensi"
            />
          ) : (
            <div style={styles.listContainer}>
              {presensis.map((p) => (
                <Card key={p.id} padding="md" style={styles.presensiItem}>
                  <div style={styles.presensiDate}>
                    {new Date(p.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <Badge 
                    variant={p.status === 'hadir' ? 'success' : p.status === 'izin' ? 'warning' : 'danger'}
                  >
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const MateriDetailView = ({ materi, kelasId, onSelectTugas, demoPengumpulan, isMobile }) => {
  const styles = getStyles(isMobile)
  
  // Get tugas for this materi
  const tugas = isDemoMode() ? DEMO_TUGAS[materi.id] : null

  return (
    <div>
      {/* Materi Content */}
      <Card padding="lg" style={{ marginBottom: theme.spacing[6] }}>
        <h3 style={styles.contentTitle}>Konten Materi</h3>
        <p style={styles.contentText}>{materi.konten || 'Tidak ada konten'}</p>
      </Card>

      {/* Tugas Section */}
      <h3 style={styles.sectionSubtitle}>Tugas Terkait</h3>
      {tugas ? (
        <Card padding="md" style={styles.listItem} onClick={() => onSelectTugas(tugas)}>
          <div style={styles.listItemContent}>
            <div style={{ ...styles.listItemIcon, backgroundColor: theme.colors.warning.light, color: theme.colors.warning.dark }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div style={styles.listItemText}>
              <h4 style={styles.listItemTitle}>{tugas.judul}</h4>
              <p style={styles.listItemDesc}>Deadline: {new Date(tugas.deadline).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
          <Button variant="primary" size="sm">
            Kerjakan
          </Button>
        </Card>
      ) : (
        <EmptyState
          title="Tidak Ada Tugas"
          description="Belum ada tugas untuk materi ini"
        />
      )}
    </div>
  )
}

const TugasDetailView = ({ tugas, demoPengumpulan, realPengumpulan, onSubmit, isMobile }) => {
  const styles = getStyles(isMobile)
  const [jawaban, setJawaban] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Check if already submitted
  const isDemo = isDemoMode()
  const submitted = isDemo 
    ? demoPengumpulan.find(p => p.tugas_id === tugas.id)
    : realPengumpulan.find(p => p.tugas_id === tugas.id)

  const handleSubmit = async () => {
    if (!jawaban.trim()) return
    setSubmitting(true)
    await onSubmit(tugas.id, jawaban)
    setSubmitting(false)
    setJawaban('')
  }

  const isOverdue = new Date(tugas.deadline) < new Date()

  return (
    <div>
      {/* Tugas Info */}
      <Card padding="lg" style={{ marginBottom: theme.spacing[6] }}>
        <div style={styles.tugasHeader}>
          <Badge variant={isOverdue ? 'danger' : 'warning'}>
            {isOverdue ? 'Sudah Lewat Deadline' : `Deadline: ${new Date(tugas.deadline).toLocaleDateString('id-ID')}`}
          </Badge>
        </div>
        <h3 style={styles.contentTitle}>Deskripsi Tugas</h3>
        <p style={styles.contentText}>{tugas.deskripsi || 'Tidak ada deskripsi'}</p>
      </Card>

      {/* Submission Section */}
      {submitted ? (
        <Card padding="lg">
          <div style={styles.submittedHeader}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.success.main} strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 style={styles.submittedTitle}>Tugas Sudah Dikumpulkan</h3>
          </div>
          <div style={styles.submittedInfo}>
            <p style={styles.submittedLabel}>Jawaban Kamu:</p>
            <p style={styles.submittedText}>{submitted.jawaban}</p>
          </div>
          {submitted.nilai !== null && (
            <div style={styles.nilaiContainer}>
              <span style={styles.nilaiLabel}>Nilai:</span>
              <span style={styles.nilaiValue}>{submitted.nilai}</span>
            </div>
          )}
        </Card>
      ) : (
        <Card padding="lg">
          <h3 style={styles.contentTitle}>Kumpulkan Jawaban</h3>
          <Textarea
            label="Jawaban"
            value={jawaban}
            onChange={(e) => setJawaban(e.target.value)}
            placeholder="Tulis jawaban kamu di sini..."
            rows={6}
            fullWidth
            disabled={isOverdue}
          />
          <div style={styles.submitSection}>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!jawaban.trim() || submitting || isOverdue}
            >
              {submitting ? 'Mengirim...' : 'Kumpulkan Tugas'}
            </Button>
            {isOverdue && (
              <p style={styles.overdueText}>Tidak dapat mengumpulkan, deadline sudah lewat</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

// Styles generator
const getStyles = (isMobile) => ({
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.danger.light,
    color: theme.colors.danger.dark,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[4],
  },
  errorClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.colors.danger.dark,
    fontSize: theme.typography.fontSize.lg,
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    backgroundColor: theme.colors.background.elevated,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[4],
    fontFamily: theme.typography.fontFamily,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  welcomeCard: {
    display: 'flex',
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    flexDirection: isMobile ? 'column' : 'row',
    gap: theme.spacing[4],
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    margin: 0,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  welcomeText: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  welcomeIcon: {
    padding: theme.spacing[4],
    backgroundColor: `${theme.colors.primary.main}10`,
    borderRadius: theme.borderRadius.xl,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  sectionTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    margin: 0,
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  kelasGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: theme.spacing[4],
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[12],
    color: theme.colors.text.secondary,
  },
  cardTitle: {
    margin: 0,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  cardDesc: {
    margin: 0,
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  kelasStats: {
    display: 'flex',
    gap: theme.spacing[6],
    paddingTop: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.border.light}`,
    flexWrap: 'wrap',
  },
  kelasStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  kelasStatValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  kelasStatLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  tabContainer: {
    display: 'flex',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[6],
    borderBottom: `1px solid ${theme.colors.border.light}`,
    paddingBottom: theme.spacing[2],
  },
  tab: {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    transition: `all ${theme.transitions.fast}`,
    fontFamily: theme.typography.fontFamily,
  },
  tabActive: {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[3],
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[4],
    cursor: 'pointer',
  },
  listItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[4],
    flex: 1,
  },
  listItemNumber: {
    width: '36px',
    height: '36px',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.sm,
    flexShrink: 0,
  },
  listItemIcon: {
    width: '44px',
    height: '44px',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary.main}10`,
    color: theme.colors.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listItemText: {
    flex: 1,
    minWidth: 0,
  },
  listItemTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  listItemDesc: {
    margin: 0,
    marginTop: theme.spacing[1],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  presensiStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[6],
  },
  presensiStatCard: {
    textAlign: 'center',
  },
  presensiStatValue: {
    display: 'block',
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  presensiStatLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  presensiItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presensiDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  contentTitle: {
    margin: 0,
    marginBottom: theme.spacing[3],
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  contentText: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    whiteSpace: 'pre-wrap',
  },
  tugasHeader: {
    marginBottom: theme.spacing[4],
  },
  submittedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  submittedTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success.main,
  },
  submittedInfo: {
    backgroundColor: theme.colors.background.elevated,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[4],
  },
  submittedLabel: {
    margin: 0,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  submittedText: {
    margin: 0,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  nilaiContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.success.light,
    borderRadius: theme.borderRadius.lg,
  },
  nilaiLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.success.dark,
  },
  nilaiValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success.dark,
  },
  submitSection: {
    marginTop: theme.spacing[4],
  },
  overdueText: {
    margin: 0,
    marginTop: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.danger.main,
  },
})

export default StudentDashboard
