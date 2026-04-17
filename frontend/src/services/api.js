const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

let authToken = null

export function setToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem("token", token)
  } else {
    localStorage.removeItem("token")
  }
}

export function getToken() {
  if (!authToken) {
    authToken = localStorage.getItem("token")
  }
  return authToken
}

export function clearToken() {
  authToken = null
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUser() {
  const userStr = localStorage.getItem("user")
  return userStr ? JSON.parse(userStr) : null
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" }
  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse(response) {
  if (response.status === 401) {
    clearToken()
    throw new Error("UNAUTHORIZED")
  }
  if (!response.ok) {
    const text = await response.text()
    let errorMsg = `Request gagal (${response.status})`
    try {
      const error = JSON.parse(text)
      errorMsg = error.detail || errorMsg
    } catch {
      if (text) errorMsg = text
    }
    throw new Error(errorMsg)
  }
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`)
    const data = await response.json()
    return data.status === "healthy"
  } catch {
    return false
  }
}

export async function register(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function login(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const res = await handleResponse(response)
  setToken(res.access_token)
  setUser(res.user)
  return res
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function logout() {
  clearToken()
}

export async function fetchUsers(role = null) {
  const params = role ? `?role=${role}` : ""
  const response = await fetch(`${API_URL}/users${params}`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchMurids() {
  const response = await fetch(`${API_URL}/murids`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== KELAS API ====================

export async function fetchKelas() {
  const response = await fetch(`${API_URL}/kelas`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchKelasDetail(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createKelas(data) {
  const response = await fetch(`${API_URL}/kelas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateKelas(kelasId, data) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteKelas(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function enrollMurid(kelasId, muridId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/enroll`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ murid_id: muridId }),
  })
  return handleResponse(response)
}

export async function unenrollMurid(kelasId, muridId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/enroll/${muridId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchEnrolledMurids(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/murids`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function joinKelas(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/join`, {
    method: "POST",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function leaveKelas(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/leave`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== MATERI API ====================

export async function fetchMateris(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/materi`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createMateri(data) {
  const response = await fetch(`${API_URL}/materi`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateMateri(materiId, data) {
  const response = await fetch(`${API_URL}/materi/${materiId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteMateri(materiId) {
  const response = await fetch(`${API_URL}/materi/${materiId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== TUGAS API ====================

export async function fetchTugas(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/tugas`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchMyTugas() {
  const response = await fetch(`${API_URL}/tugas/my`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createTugas(data) {
  const response = await fetch(`${API_URL}/tugas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateTugas(tugasId, data) {
  const response = await fetch(`${API_URL}/tugas/${tugasId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteTugas(tugasId) {
  const response = await fetch(`${API_URL}/tugas/${tugasId}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return handleResponse(response)
}

// ==================== PENGUMPULAN API ====================

export async function submitTugas(data) {
  const response = await fetch(`${API_URL}/pengumpulan`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updatePengumpulan(pengumpulanId, data) {
  const response = await fetch(`${API_URL}/pengumpulan/${pengumpulanId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function fetchPengumpulanByTugas(tugasId) {
  const response = await fetch(`${API_URL}/tugas/${tugasId}/pengumpulan`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchMyPengumpulan() {
  const response = await fetch(`${API_URL}/pengumpulan/my`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function giveNilai(pengumpulanId, data) {
  const response = await fetch(`${API_URL}/pengumpulan/${pengumpulanId}/nilai`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

// ==================== PRESENSI API ====================

export async function fetchPresensis(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/presensi`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function createPresensi(data) {
  const response = await fetch(`${API_URL}/presensi`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updatePresensi(presensiId, data) {
  const response = await fetch(`${API_URL}/presensi/${presensiId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function fetchMyPresensi() {
  const response = await fetch(`${API_URL}/presensi/my`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchMyPresensiInKelas(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/presensi/my`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}

export async function fetchMyPresensiStats(kelasId) {
  const response = await fetch(`${API_URL}/kelas/${kelasId}/presensi/my/stats`, {
    headers: authHeaders(),
  })
  return handleResponse(response)
}
