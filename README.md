# ☁️ Cloud App - [STUDYFY]

*Studyfy* adalah platform *Learning Management System (LMS)* berbasis cloud yang dirancang untuk menciptakan pengalaman belajar digital yang simpel, terorganisir, dan menyenangkan dengan mengintegrasikan peran admin, pengajar, dan murid dalam satu sistem terpadu yang efisien. Melalui platform ini, murid dapat mengakses materi pembelajaran berbasis multimedia serta memantau progres belajar secara mandiri, sementara pengajar dibekali dashboard khusus untuk mengelola modul materi, menyusun penugasan, hingga melakukan penilaian secara langsung.

Di sisi lain, admin berperan sebagai pengendali utama yang mengelola hak akses pengguna berbasis peran serta memantau statistik aktivitas dan performa sistem secara menyeluruh. Dengan dukungan arsitektur cloud, *Studyfy* memungkinkan akses lintas perangkat, skalabilitas layanan, serta ketersediaan sistem yang optimal. Urgensi pengembangan *Studyfy* terletak pada penyederhanaan akses pendidikan, peningkatan efektivitas pembelajaran, serta digitalisasi dokumentasi belajar yang fleksibel melalui teknologi yang modern, aman, dan user-friendly.

## 👥 Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Dzaky Rasyiq Zuhair  | 10231035 | Lead Backend |
| Dhiya Afifah  | 10231031 | Lead Frontend |
| Ika Agustin Wulandari  | 10231041 | Lead DevOps |
| Gabriel Karmen Sanggalangi  | 10231039 | Lead QA & Docs |

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| FastAPI   | Backend REST API |
| React     | Frontend SPA |
| PostgreSQL | Database |
| Docker    | Containerization |
| GitHub Actions | CI/CD |
| Railway/Render | Cloud Deployment |

## 🏗️ Architecture

```
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
```


## 🚀 Getting Started

### Prasyarat
- Python 3.10+
- Node.js 18+
- Git

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ⬜ |
| 3 | React Frontend | ⬜ |
| 4 | Full-Stack Integration | ⬜ |
| 5-7 | Docker & Compose | ⬜ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |

---

## 📁 Project Structure
```
cc-kelompok-a-nexa/
│
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── main.py                  
│   ├── database.py              
│   ├── requirements.txt
│
│   ├── models/                  
│   │   ├── user.py              
│   │   ├── course.py            
│   │   ├── module.py            
│   │   ├── assignment.py        
│   │   └── submission.py        
│   │
│   ├── schemas/                 
│   │   ├── user_schema.py
│   │   ├── course_schema.py
│   │   ├── module_schema.py
│   │   ├── assignment_schema.py
│   │   └── auth_schema.py
│   │
│   ├── crud/                    
│   │   ├── user_crud.py
│   │   ├── course_crud.py
│   │   ├── module_crud.py
│   │   ├── assignment_crud.py
│   │   └── analytics_crud.py
│   │
│   ├── routers/                 
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── courses.py
│   │   ├── modules.py
│   │   ├── assignments.py
│   │   └── analytics.py
│   │
│   ├── core/                    
│   │   ├── security.py          
│   │   ├── config.py
│   │   └── dependencies.py
│   │
│   └── media/
│       └── materials/           
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── admin/
│   │   │   ├── teacher/
│   │   │   └── student/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── anggota/
│   │   ├── gabriel.md
│   │   └── wulan.md
│   │
│   ├── sistem/
│   │   ├── deskripsi_sistem.md
│   │   ├── usecase.md
│   │   └── arsitektur.md
│
├── .gitignore
├── .python-version
├── README.md
└── README.pdf

```

