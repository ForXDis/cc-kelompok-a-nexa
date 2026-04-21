import { useState, useEffect } from 'react'
import theme from '../styles/theme'
import useResponsive from '../hooks/useResponsive'
import LayoutWrapper from './layout/LayoutWrapper'
import { Card, Button, Badge, StatCard, SubjectCard, EmptyState, Input, Textarea } from './ui'
import {
  fetchKelas, createKelas, updateKelas, deleteKelas,
  fetchMateris, createMateri, updateMateri, deleteMateri,
  fetchTugas, createTugas, updateTugas, deleteTugas,
  giveNilai, fetchPengumpulanByTugas,
  fetchEnrolledMurids, enrollMurid, unenrollMurid,
  fetchMurids,
  fetchPresensis, createPresensi,
} from '../services/api'

// Demo Mode checker
const isDemoMode = () => localStorage.getItem('demo_mode') === 'true'

// Demo Data
const DEMO_KELAS = [
  { id: 1, nama_kelas: 'Matematika Dasar', deskripsi: 'Kelas matematika untuk pemula', guru_id: 1 },
  { id: 2, nama_kelas: 'Bahasa Inggris', deskripsi: 'Kelas bahasa Inggris conversation', guru_id: 1 },
  { id: 3, nama_kelas: 'Fisika SMA', deskripsi: 'Fisika untuk persiapan UTBK', guru_id: 1 },
]

const DEMO_MURIDS = [
  { id: 2, name: 'Ahmad Rizki', email: 'ahmad@demo.com' },
  { id: 3, name: 'Siti Nurhaliza', email: 'siti@demo.com' },
  { id: 4, name: 'Budi Santoso', email: 'budi@demo.com' },
]

const DEMO_MATERIS = [
  { id: 1, kelas_id: 1, judul: 'Pengenalan Aljabar', konten: 'Materi dasar aljabar meliputi variabel, konstanta, dan operasi dasar.' },
  { id: 2, kelas_id: 1, judul: 'Persamaan Linear', konten: 'Cara menyelesaikan persamaan linear satu variabel.' },
]

const DEMO_TUGAS = [
  { id: 1, materi_id: 1, kelas_id: 1, judul: 'Latihan Aljabar', deskripsi: 'Kerjakan 10 soal aljabar', deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
]

const DEMO_PENGUMPULAN = [
  { id: 1, tugas_id: 1, murid_id: 2, murid: DEMO_MURIDS[0], jawaban: 'Jawaban dari Ahmad', nilai: null, submitted_at: new Date().toISOString() },
  { id: 2, tugas_id: 1, murid_id: 3, murid: DEMO_MURIDS[1], jawaban: 'Jawaban dari Siti', nilai: 85, submitted_at: new Date().toISOString() },
]

// Navigation views
const VIEWS = {
  DASHBOARD: 'dashboard',
  KELAS_DETAIL: 'kelas_detail',
  MATERI_DETAIL: 'materi_detail',
  TUGAS_DETAIL: 'tugas_detail',
  PRESENSI: 'presensi',
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
    label: 'Kelola Kelas', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  },
  { 
    id: 'murid', 
    label: 'Data Murid', 
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
]

const TeacherDashboard = ({ user, onLogout }) => {
  const { isMobile } = useResponsive()
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD)
  
  // Data states
  const [kelasList, setKelasList] = useState([])
  const [muridList, setMuridList] = useState([])
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [selectedMateri, setSelectedMateri] = useState(null)
  const [selectedTugas, setSelectedTugas] = useState(null)
  const [materis, setMateris] = useState([])
  const [tugasList, setTugasList] = useState([])
  const [enrolledMurids, setEnrolledMurids] = useState([])
  const [pengumpulanList, setPengumpulanList] = useState([])
  const [presensiList, setPresensiList] = useState([])
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [modalData, setModalData] = useState(null)

  // Demo states
  const [demoKelasList, setDemoKelasList] = useState(DEMO_KELAS)
  const [demoMateris, setDemoMateris] = useState(DEMO_MATERIS)
  const [demoTugas, setDemoTugas] = useState(DEMO_TUGAS)
  const [demoPengumpulan, setDemoPengumpulan] = useState(DEMO_PENGUMPULAN)
  const [demoEnrolled, setDemoEnrolled] = useState([
    { id: 1, murid_id: 2, murid: DEMO_MURIDS[0] },
    { id: 2, murid_id: 3, murid: DEMO_MURIDS[1] },
  ])

  // Load initial data
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

  // Data loading functions
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
      console.error('Error load murids:', err)
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
      console.error('Error load enrolled:', err)
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
      console.error('Error load materis:', err)
    }
  }

  const loadTugasForMateri = async (materiId) => {
    if (isDemoMode()) {
      setTugasList(demoTugas.filter(t => t.materi_id === materiId))
      return
    }
    try {
      const data = await fetchTugas(selectedKelas.id)
      const filtered = (data.tugass || []).filter(t => t.materi_id === materiId)
      setTugasList(filtered)
    } catch (err) {
      console.error('Error load tugas:', err)
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
      console.error('Error load pengumpulan:', err)
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
      console.error('Error load presensi:', err)
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

  const goToPresensi = () => {
    if (selectedKelas) {
      loadPresensi(selectedKelas.id)
      setCurrentView(VIEWS.PRESENSI)
    }
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
    } else if (currentView === VIEWS.PRESENSI) {
      setCurrentView(VIEWS.KELAS_DETAIL)
    }
  }

  // Modal functions
  const openModal = (type, data = null) => {
    setModalType(type)
    setModalData(data)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
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
    if (!confirm('Yakin hapus kelas ini?')) return
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
    if (!confirm('Yakin hapus materi ini?')) return
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
    if (!confirm('Yakin hapus tugas ini?')) return
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
          const dbStatus = status === 'absen' ? 'alfa' : status
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

  // Get page title based on current view
  const getPageTitle = () => {
    switch (currentView) {
      case VIEWS.KELAS_DETAIL:
        return selectedKelas?.nama_kelas || 'Detail Kelas'
      case VIEWS.MATERI_DETAIL:
        return selectedMateri?.judul || 'Detail Materi'
      case VIEWS.TUGAS_DETAIL:
        return selectedTugas?.judul || 'Detail Tugas'
      case VIEWS.PRESENSI:
        return `Presensi - ${selectedKelas?.nama_kelas || 'Kelas'}`
      default:
        return 'Dashboard Pengajar'
    }
  }

  const getPageSubtitle = () => {
    switch (currentView) {
      case VIEWS.KELAS_DETAIL:
        return `${materis.length} materi, ${enrolledMurids.length} murid terdaftar`
      case VIEWS.MATERI_DETAIL:
        return `${tugasList.length} tugas dalam materi ini`
      case VIEWS.TUGAS_DETAIL:
        return `${pengumpulanList.length} pengumpulan`
      case VIEWS.PRESENSI:
        return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      default:
        return `Selamat datang, ${user?.name || 'Pengajar'}`
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
          kelasList={kelasList}
          loading={loading}
          onSelectKelas={goToKelasDetail}
          onAddKelas={() => openModal('kelas')}
          isMobile={isMobile}
        />
      )}

      {/* Kelas Detail View */}
      {currentView === VIEWS.KELAS_DETAIL && selectedKelas && (
        <KelasDetailView
          kelas={selectedKelas}
          materis={materis}
          enrolledMurids={enrolledMurids}
          muridList={muridList}
          onSelectMateri={goToMateriDetail}
          onAddMateri={() => openModal('materi')}
          onEditMateri={(m) => openModal('materi', m)}
          onDeleteMateri={handleDeleteMateri}
          onEditKelas={() => openModal('kelas', selectedKelas)}
          onDeleteKelas={() => handleDeleteKelas(selectedKelas.id)}
          onEnrollMurid={handleEnrollMurid}
          onUnenrollMurid={handleUnenrollMurid}
          onGoToPresensi={goToPresensi}
          isMobile={isMobile}
        />
      )}

      {/* Materi Detail View */}
      {currentView === VIEWS.MATERI_DETAIL && selectedMateri && (
        <MateriDetailView
          materi={selectedMateri}
          tugasList={tugasList}
          onSelectTugas={goToTugasDetail}
          onAddTugas={() => openModal('tugas')}
          onEditTugas={(t) => openModal('tugas', t)}
          onDeleteTugas={handleDeleteTugas}
          onEditMateri={() => openModal('materi', selectedMateri)}
          onDeleteMateri={() => handleDeleteMateri(selectedMateri.id)}
          isMobile={isMobile}
        />
      )}

      {/* Tugas Detail View */}
      {currentView === VIEWS.TUGAS_DETAIL && selectedTugas && (
        <TugasDetailView
          tugas={selectedTugas}
          pengumpulanList={pengumpulanList}
          onEditTugas={() => openModal('tugas', selectedTugas)}
          onDeleteTugas={() => handleDeleteTugas(selectedTugas.id)}
          onGiveNilai={(p) => openModal('nilai', p)}
          isMobile={isMobile}
        />
      )}

      {/* Presensi View */}
      {currentView === VIEWS.PRESENSI && selectedKelas && (
        <PresensiView
          presensiList={presensiList}
          enrolledMurids={enrolledMurids}
          onAddPresensi={() => openModal('presensi')}
          isMobile={isMobile}
        />
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          type={modalType}
          data={modalData}
          onClose={closeModal}
          onSaveKelas={handleSaveKelas}
          onSaveMateri={handleSaveMateri}
          onSaveTugas={handleSaveTugas}
          onSaveNilai={handleGiveNilai}
          onSavePresensi={handleSavePresensi}
          enrolledMurids={enrolledMurids}
          isMobile={isMobile}
        />
      )}
    </LayoutWrapper>
  )
}

// ============================================
// SUB COMPONENTS
// ============================================

const DashboardView = ({ kelasList, loading, onSelectKelas, onAddKelas, isMobile }) => {
  const styles = getStyles(isMobile)

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
          label="Total Kelas"
          value={kelasList.length}
        />
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
          label="Total Murid"
          value={kelasList.length * 15}
        />
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          label="Total Materi"
          value={kelasList.length * 3}
        />
      </div>

      {/* Kelas Section */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Kelas Saya</h2>
        <Button variant="primary" size="sm" onClick={onAddKelas}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Kelas
        </Button>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <p>Memuat kelas...</p>
        </div>
      ) : kelasList.length === 0 ? (
        <EmptyState
          icon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          title="Belum Ada Kelas"
          description="Buat kelas pertama Anda untuk mulai mengajar"
          action={
            <Button variant="primary" onClick={onAddKelas}>
              Buat Kelas Baru
            </Button>
          }
        />
      ) : (
        <div style={styles.kelasGrid}>
          {kelasList.map((kelas) => (
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
                { value: '3', label: 'Materi' },
                { value: '15', label: 'Murid' },
              ]}
              onClick={() => onSelectKelas(kelas)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const KelasDetailView = ({ 
  kelas, materis, enrolledMurids, muridList,
  onSelectMateri, onAddMateri, onEditMateri, onDeleteMateri,
  onEditKelas, onDeleteKelas,
  onEnrollMurid, onUnenrollMurid,
  onGoToPresensi,
  isMobile 
}) => {
  const styles = getStyles(isMobile)
  const [activeTab, setActiveTab] = useState('materi')
  const enrolledIds = enrolledMurids.map(e => e.murid_id)

  return (
    <div>
      {/* Kelas Actions */}
      <div style={styles.actionsBar}>
        <Button variant="primary" size="sm" onClick={onGoToPresensi}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Presensi
        </Button>
        <Button variant="secondary" size="sm" onClick={onEditKelas}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Kelas
        </Button>
        <Button variant="danger" size="sm" onClick={onDeleteKelas}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Hapus Kelas
        </Button>
      </div>

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
            ...(activeTab === 'murid' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('murid')}
        >
          Murid ({enrolledMurids.length})
        </button>
      </div>

      {/* Materi Tab */}
      {activeTab === 'materi' && (
        <div>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionSubtitle}>Daftar Materi</h3>
            <Button variant="primary" size="sm" onClick={onAddMateri}>
              Tambah Materi
            </Button>
          </div>
          {materis.length === 0 ? (
            <EmptyState
              title="Belum Ada Materi"
              description="Tambahkan materi pembelajaran untuk kelas ini"
            />
          ) : (
            <div style={styles.listContainer}>
              {materis.map((materi) => (
                <div
                  key={materi.id}
                  onClick={() => onSelectMateri(materi)}
                  style={{
                    ...styles.listItem,
                    cursor: 'pointer',
                    transition: `all ${theme.transitions.fast}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
              <Card padding="md" style={{ ...styles.listItem, boxShadow: 'none', width: '100%' }}>
                <div style={styles.listItemContent}>
                  <div style={styles.listItemIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={styles.listItemText}>
                    <h4 style={styles.listItemTitle}>{materi.judul}</h4>
                    <p style={styles.listItemDesc}>{materi.konten?.substring(0, 100)}...</p>
                  </div>
                </div>
                <div style={styles.listItemActions}>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onEditMateri(materi) }}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteMateri(materi.id) }}>
                    Hapus
                  </Button>
                </div>
              </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Murid Tab */}
      {activeTab === 'murid' && (
        <div>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionSubtitle}>Murid Terdaftar</h3>
          </div>
          
          {/* Enroll new student */}
          <Card padding="md" style={{ marginBottom: theme.spacing[4] }}>
            <p style={styles.cardLabel}>Tambah Murid ke Kelas</p>
            <div style={styles.enrollSection}>
              <select
                style={styles.select}
                onChange={(e) => {
                  if (e.target.value) {
                    onEnrollMurid(e.target.value)
                    e.target.value = ''
                  }
                }}
                defaultValue=""
              >
                <option value="">Pilih Murid...</option>
                {muridList.filter(m => !enrolledIds.includes(m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.name} - {m.email}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Enrolled list */}
          {enrolledMurids.length === 0 ? (
            <EmptyState
              title="Belum Ada Murid"
              description="Daftarkan murid ke kelas ini"
            />
          ) : (
            <div style={styles.listContainer}>
              {enrolledMurids.map((enrollment) => (
                <Card key={enrollment.id} padding="md" style={styles.listItem}>
                  <div style={styles.listItemContent}>
                    <div style={styles.avatar}>
                      {enrollment.murid?.name?.charAt(0) || 'M'}
                    </div>
                    <div style={styles.listItemText}>
                      <h4 style={styles.listItemTitle}>{enrollment.murid?.name || 'Unknown'}</h4>
                      <p style={styles.listItemDesc}>{enrollment.murid?.email}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => onUnenrollMurid(enrollment.murid_id)}>
                    Keluarkan
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const MateriDetailView = ({
  materi, tugasList,
  onSelectTugas, onAddTugas, onEditTugas, onDeleteTugas,
  onEditMateri, onDeleteMateri,
  isMobile
}) => {
  const styles = getStyles(isMobile)

  return (
    <div>
      {/* Materi Content */}
      <Card padding="lg" style={{ marginBottom: theme.spacing[6] }}>
        <div style={styles.actionsBar}>
          <Button variant="secondary" size="sm" onClick={onEditMateri}>
            Edit Materi
          </Button>
          <Button variant="danger" size="sm" onClick={onDeleteMateri}>
            Hapus Materi
          </Button>
        </div>
        <h3 style={styles.contentTitle}>Konten Materi</h3>
        <p style={styles.contentText}>{materi.konten || 'Tidak ada konten'}</p>
      </Card>

      {/* Tugas Section */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionSubtitle}>Daftar Tugas</h3>
        <Button variant="primary" size="sm" onClick={onAddTugas}>
          Tambah Tugas
        </Button>
      </div>

      {tugasList.length === 0 ? (
        <EmptyState
          title="Belum Ada Tugas"
          description="Buat tugas untuk materi ini"
        />
      ) : (
        <div style={styles.listContainer}>
          {tugasList.map((tugas) => (
            <div
              key={tugas.id}
              onClick={() => onSelectTugas(tugas)}
              style={{
                ...styles.listItem,
                cursor: 'pointer',
                transition: `all ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Card padding="md" style={{ ...styles.listItem, boxShadow: 'none', width: '100%' }}>
                <div style={styles.listItemContent}>
                  <div style={{ ...styles.listItemIcon, backgroundColor: theme.colors.warning.light, color: theme.colors.warning.dark }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                  </div>
                  <div style={styles.listItemText}>
                    <h4 style={styles.listItemTitle}>{tugas.judul}</h4>
                    <p style={styles.listItemDesc}>
                      Deadline: {new Date(tugas.deadline).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div style={styles.listItemActions}>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onEditTugas(tugas) }}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteTugas(tugas.id) }}>
                    Hapus
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TugasDetailView = ({
  tugas, pengumpulanList,
  onEditTugas, onDeleteTugas, onGiveNilai,
  isMobile
}) => {
  const styles = getStyles(isMobile)

  const sudahDinilai = pengumpulanList.filter(p => p.nilai !== null).length
  const belumDinilai = pengumpulanList.filter(p => p.nilai === null).length

  return (
    <div>
      {/* Tugas Info */}
      <Card padding="lg" style={{ marginBottom: theme.spacing[6] }}>
        <div style={styles.actionsBar}>
          <Button variant="secondary" size="sm" onClick={onEditTugas}>
            Edit Tugas
          </Button>
          <Button variant="danger" size="sm" onClick={onDeleteTugas}>
            Hapus Tugas
          </Button>
        </div>
        <h3 style={styles.contentTitle}>Deskripsi Tugas</h3>
        <p style={styles.contentText}>{tugas.deskripsi || 'Tidak ada deskripsi'}</p>
        <div style={styles.tugasInfo}>
          <Badge variant="warning">
            Deadline: {new Date(tugas.deadline).toLocaleDateString('id-ID')}
          </Badge>
          <Badge variant="info">{pengumpulanList.length} Pengumpulan</Badge>
          <Badge variant="success">{sudahDinilai} Sudah Dinilai</Badge>
          <Badge variant="danger">{belumDinilai} Belum Dinilai</Badge>
        </div>
      </Card>

      {/* Pengumpulan List */}
      <h3 style={styles.sectionSubtitle}>Daftar Pengumpulan</h3>
      {pengumpulanList.length === 0 ? (
        <EmptyState
          title="Belum Ada Pengumpulan"
          description="Belum ada murid yang mengumpulkan tugas ini"
        />
      ) : (
        <div style={styles.listContainer}>
          {pengumpulanList.map((p) => (
            <Card key={p.id} padding="md" style={styles.listItem}>
              <div style={styles.listItemContent}>
                <div style={styles.avatar}>
                  {p.murid?.name?.charAt(0) || 'M'}
                </div>
                <div style={styles.listItemText}>
                  <h4 style={styles.listItemTitle}>{p.murid?.name || 'Unknown'}</h4>
                  <p style={styles.listItemDesc}>
                    Dikumpulkan: {new Date(p.submitted_at).toLocaleString('id-ID')}
                  </p>
                  <p style={styles.listItemDesc}>Jawaban: {p.jawaban?.substring(0, 50)}...</p>
                </div>
              </div>
              <div style={styles.listItemActions}>
                {p.nilai !== null ? (
                  <Badge variant="success" size="md">Nilai: {p.nilai}</Badge>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => onGiveNilai(p)}>
                    Beri Nilai
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

const PresensiView = ({ presensiList, enrolledMurids, onAddPresensi, isMobile }) => {
  const styles = getStyles(isMobile)

  return (
    <div>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionSubtitle}>Daftar Presensi</h3>
        <Button variant="primary" size="sm" onClick={onAddPresensi}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Presensi
        </Button>
      </div>

      {presensiList.length === 0 ? (
        <EmptyState
          icon={
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
          title="Belum Ada Presensi"
          description="Tambahkan presensi untuk kelas ini"
          action={
            <Button variant="primary" onClick={onAddPresensi}>
              Tambah Presensi Pertama
            </Button>
          }
        />
      ) : (
        <div style={styles.listContainer}>
          {presensiList.map((p) => (
            <Card key={p.id} padding="md" style={styles.listItem}>
              <div style={styles.listItemContent}>
                <div style={styles.listItemIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div style={styles.listItemText}>
                  <h4 style={styles.listItemTitle}>
                    {new Date(p.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h4>
                  <p style={styles.listItemDesc}>
                    Murid: {p.murid?.name || 'Unknown'} - Status: <strong>{p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}</strong>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Modal Component
const Modal = ({ type, data, onClose, onSaveKelas, onSaveMateri, onSaveTugas, onSaveNilai, onSavePresensi, enrolledMurids, isMobile }) => {
  const styles = getStyles(isMobile)
  const [formData, setFormData] = useState({})
  const [presensiData, setPresensiData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    presensi: {}
  })

  useEffect(() => {
    if (data) {
      setFormData({ ...data })
    } else {
      setFormData({})
    }
  }, [data])

  useEffect(() => {
    if (type === 'presensi' && enrolledMurids) {
      const initialPresensi = {}
      enrolledMurids.forEach(m => {
        initialPresensi[m.murid_id] = 'absen'
      })
      setPresensiData({ tanggal: new Date().toISOString().split('T')[0], presensi: initialPresensi })
    }
  }, [type, enrolledMurids])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (type === 'kelas') onSaveKelas(formData)
    if (type === 'materi') onSaveMateri(formData)
    if (type === 'tugas') onSaveTugas(formData)
    if (type === 'nilai') onSaveNilai(data.id, parseInt(formData.nilai))
    if (type === 'presensi') onSavePresensi(presensiData)
  }

  const cycleStatus = (muridId) => {
    const current = presensiData.presensi[muridId] || 'absen'
    const statusOrder = ['absen', 'hadir', 'izin']
    const currentIndex = statusOrder.indexOf(current)
    const nextIndex = (currentIndex + 1) % statusOrder.length
    setPresensiData(prev => ({
      ...prev,
      presensi: { ...prev.presensi, [muridId]: statusOrder[nextIndex] }
    }))
  }

  const getStatusStyle = (status) => {
    if (status === 'hadir') return { backgroundColor: theme.colors.success.main, color: 'white' }
    if (status === 'izin') return { backgroundColor: theme.colors.warning.main, color: 'white' }
    return { backgroundColor: theme.colors.danger.main, color: 'white' }
  }

  const getTitle = () => {
    if (type === 'nilai') return 'Beri Nilai'
    if (type === 'presensi') return 'Tambah Presensi'
    const action = data ? 'Edit' : 'Tambah'
    const entity = type === 'kelas' ? 'Kelas' : type === 'materi' ? 'Materi' : 'Tugas'
    return `${action} ${entity}`
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{getTitle()}</h3>
          <button style={styles.modalClose} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={styles.modalBody}>
          {type === 'kelas' && (
            <>
              <Input
                label="Nama Kelas"
                name="nama_kelas"
                value={formData.nama_kelas || ''}
                onChange={handleChange}
                placeholder="Contoh: Matematika Dasar"
                required
                fullWidth
              />
              <Textarea
                label="Deskripsi"
                name="deskripsi"
                value={formData.deskripsi || ''}
                onChange={handleChange}
                placeholder="Deskripsi kelas..."
                rows={3}
                fullWidth
              />
            </>
          )}
          {type === 'materi' && (
            <>
              <Input
                label="Judul Materi"
                name="judul"
                value={formData.judul || ''}
                onChange={handleChange}
                placeholder="Contoh: Pengenalan Aljabar"
                required
                fullWidth
              />
              <Textarea
                label="Konten"
                name="konten"
                value={formData.konten || ''}
                onChange={handleChange}
                placeholder="Isi materi pembelajaran..."
                rows={5}
                fullWidth
              />
            </>
          )}
          {type === 'tugas' && (
            <>
              <Input
                label="Judul Tugas"
                name="judul"
                value={formData.judul || ''}
                onChange={handleChange}
                placeholder="Contoh: Latihan Soal Bab 1"
                required
                fullWidth
              />
              <Textarea
                label="Deskripsi"
                name="deskripsi"
                value={formData.deskripsi || ''}
                onChange={handleChange}
                placeholder="Deskripsi tugas..."
                rows={3}
                fullWidth
              />
              <Input
                label="Deadline"
                name="deadline"
                type="datetime-local"
                value={formData.deadline ? formData.deadline.slice(0, 16) : ''}
                onChange={handleChange}
                required
                fullWidth
              />
            </>
          )}
          {type === 'nilai' && (
            <>
              <p style={styles.nilaiInfo}>
                Murid: <strong>{data?.murid?.name}</strong>
              </p>
              <p style={styles.nilaiInfo}>
                Jawaban: {data?.jawaban}
              </p>
              <Input
                label="Nilai (0-100)"
                name="nilai"
                type="number"
                min="0"
                max="100"
                value={formData.nilai || ''}
                onChange={handleChange}
                placeholder="Masukkan nilai"
                required
                fullWidth
              />
            </>
          )}
          {type === 'presensi' && (
            <>
              <Input
                label="Tanggal"
                name="tanggal"
                type="date"
                value={presensiData.tanggal}
                onChange={(e) => setPresensiData(prev => ({ ...prev, tanggal: e.target.value }))}
                required
                fullWidth
              />
              <div style={styles.presensiFormSection}>
                <label style={styles.presensiFormLabel}>Kehadiran Murid</label>
                <div style={styles.presensiFormList}>
                  {enrolledMurids?.map(enrollment => (
                    <div key={enrollment.id} style={styles.presensiFormItem}>
                      <span style={styles.presensiFormName}>{enrollment.murid?.name}</span>
                      <button
                        type="button"
                        style={{ ...styles.presensiStatusBtn, ...getStatusStyle(presensiData.presensi[enrollment.murid_id]) }}
                        onClick={() => cycleStatus(enrollment.murid_id)}
                      >
                        {presensiData.presensi[enrollment.murid_id]?.charAt(0).toUpperCase() + presensiData.presensi[enrollment.murid_id]?.slice(1) || 'Absen'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <div style={styles.modalFooter}>
            <Button variant="secondary" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </div>
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
  actionsBar: {
    display: 'flex',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
    flexWrap: 'wrap',
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
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    flexDirection: isMobile ? 'column' : 'row',
    gap: theme.spacing[4],
    width: '100%',
    boxSizing: 'border-box',
  },
  listItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[4],
    flex: 1,
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
  listItemActions: {
    display: 'flex',
    gap: theme.spacing[2],
    flexWrap: 'wrap',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    color: theme.colors.primary.dark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
    flexShrink: 0,
  },
  cardLabel: {
    margin: 0,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  enrollSection: {
    display: 'flex',
    gap: theme.spacing[3],
  },
  select: {
    flex: 1,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily,
    border: `2px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
    outline: 'none',
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
  tugasInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.border.light}`,
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
    padding: theme.spacing[4],
  },
  modal: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: theme.shadows.xl,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[5],
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  modalTitle: {
    margin: 0,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  modalClose: {
    padding: theme.spacing[2],
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: theme.colors.text.secondary,
    borderRadius: theme.borderRadius.md,
  },
  modalBody: {
    padding: theme.spacing[5],
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTop: `1px solid ${theme.colors.border.light}`,
  },
  nilaiInfo: {
    margin: 0,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  presensiFormSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[3],
  },
  presensiFormLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  presensiFormList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
  },
  presensiFormItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[3],
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
  },
  presensiFormName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  presensiStatusBtn: {
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    borderRadius: theme.borderRadius.lg,
    border: 'none',
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    transition: `all ${theme.transitions.fast}`,
  },
})

export default TeacherDashboard
