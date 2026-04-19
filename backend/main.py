import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User, Presensi
from schemas import (
    UserRegister, UserResponse, UserUpdate, LoginRequest, TokenResponse,
    ItemCreate, ItemUpdate, ItemResponse, ItemListResponse, ItemStatsResponse,
    KelasCreate, KelasUpdate, KelasResponse, KelasDetailResponse,
    EnrollCreate, EnrollResponse, EnrollDetailResponse,
    MateriCreate, MateriUpdate, MateriResponse, MateriListResponse,
    TugasCreate, TugasUpdate, TugasResponse, TugasListResponse,
    PengumpulanCreate, PengumpulanUpdate, PengumpulanNilai, PengumpulanResponse, PengumpulanListResponse,
    PresensiCreate, PresensiUpdate, PresensiResponse, PresensiListResponse, PresensiStatsResponse,
    GuruResponse, MuridResponse,
)
from auth import create_access_token, get_current_user, get_current_guru, get_current_murid
import crud

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Studyfy LMS API",
    description="REST API untuk sistem LMS Bimbel Studyfy",
    version="1.0.0",
    security = HTTPBearer(),
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/team")
def team_info():
    return {
        "team": "cloud-kelompok-a-nexa",
        "members": [
            {"name": "Dzaky Rasyiq Zuhair", "nim": "10231035", "role": "Lead Backend"},
            {"name": "Dhiya Afifah", "nim": "10231031", "role": "Lead Frontend"},
            {"name": "Ika Agustin Wulandari", "nim": "10231041", "role": "Lead DevOps"},
            {"name": "Gabriel Karmen Sanggalangi", "nim": "10231039", "role": "Lead QA & Docs"},
        ],
    }


@app.post("/auth/register", response_model=UserResponse, status_code=201)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    user = crud.create_user(db=db, user_data=user_data)
    if not user:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    return user


@app.post("/auth/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db=db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/auth/me", response_model=UserResponse)
def update_me(user_data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = crud.update_user(db=db, user_id=current_user.id, user_data=user_data)
    return updated


@app.get("/users", response_model=dict)
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    role: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if role and role not in ["guru", "murid"]:
        raise HTTPException(status_code=400, detail="Role harus 'guru' atau 'murid'")
    return crud.get_users(db=db, skip=skip, limit=limit, role=role)


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = crud.get_user_by_id(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return user


@app.get("/gurus", response_model=list[GuruResponse])
def list_gurus(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_users(db=db, role="guru")["users"]


@app.get("/murids", response_model=list[MuridResponse])
def list_murids(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_murids(db=db)


@app.post("/kelas", response_model=KelasResponse, status_code=201)
def create_kelas(kelas_data: KelasCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    return crud.create_kelas(db=db, kelas_data=kelas_data, guru_id=current_user.id)


@app.get("/kelas")
def list_kelas(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.value == "guru":
        return crud.get_kelas_by_guru(db=db, guru_id=current_user.id)
    else:
        return crud.get_kelas_by_murid(db=db, murid_id=current_user.id)


@app.get("/kelas/{kelas_id}")
def get_kelas(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    enrollments = crud.get_enrolled_murids(db=db, kelas_id=kelas_id)
    return {
        "id": kelas.id,
        "nama_kelas": kelas.nama_kelas,
        "deskripsi": kelas.deskripsi,
        "guru_id": kelas.guru_id,
        "created_at": kelas.created_at.isoformat() if kelas.created_at else None,
        "guru": {
            "id": kelas.guru.id,
            "name": kelas.guru.name,
            "email": kelas.guru.email,
            "role": kelas.guru.role.value if hasattr(kelas.guru.role, 'value') else kelas.guru.role,
        } if kelas.guru else None,
        "jumlah_murid": enrollments["total"],
    }


@app.put("/kelas/{kelas_id}")
def update_kelas(kelas_id: int, kelas_data: KelasUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    updated = crud.update_kelas(db=db, kelas_id=kelas_id, kelas_data=kelas_data)
    return {
        "id": updated.id,
        "nama_kelas": updated.nama_kelas,
        "deskripsi": updated.deskripsi,
        "guru_id": updated.guru_id,
        "created_at": updated.created_at.isoformat() if updated.created_at else None,
    }


@app.delete("/kelas/{kelas_id}", status_code=204)
def delete_kelas(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    crud.delete_kelas(db=db, kelas_id=kelas_id)
    return None


@app.post("/kelas/{kelas_id}/enroll")
def enroll_murid(kelas_id: int, enroll_data: EnrollCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if current_user.role.value == "murid":
        raise HTTPException(status_code=403, detail="Hanya guru yang dapat mendaftarkan murid")
    
    try:
        enrollment = crud.enroll_murid(db=db, kelas_id=kelas_id, murid_id=enroll_data.murid_id)
        if not enrollment:
            raise HTTPException(status_code=400, detail="Murid sudah terdaftar di kelas ini")
        return enrollment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/kelas/{kelas_id}/enroll/{murid_id}", status_code=204)
def unenroll_murid(kelas_id: int, murid_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    success = crud.unenroll_murid(db=db, kelas_id=kelas_id, murid_id=murid_id)
    if not success:
        raise HTTPException(status_code=404, detail="Murid tidak ditemukan di kelas ini")
    return None


@app.get("/kelas/{kelas_id}/murids")
def get_enrolled_murids(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    return crud.get_enrolled_murids(db=db, kelas_id=kelas_id)


@app.post("/kelas/{kelas_id}/join")
def join_kelas(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    enrollment = crud.enroll_murid(db=db, kelas_id=kelas_id, murid_id=current_user.id)
    if not enrollment:
        raise HTTPException(status_code=400, detail="Anda sudah terdaftar di kelas ini")
    return {
        "id": enrollment.id,
        "kelas_id": enrollment.kelas_id,
        "murid_id": enrollment.murid_id,
        "created_at": enrollment.created_at.isoformat() if enrollment.created_at else None,
    }


@app.delete("/kelas/{kelas_id}/leave", status_code=204)
def leave_kelas(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    success = crud.unenroll_murid(db=db, kelas_id=kelas_id, murid_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Anda tidak terdaftar di kelas ini")
    return None


@app.post("/materi", response_model=MateriResponse, status_code=201)
def create_materi(materi_data: MateriCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=materi_data.kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    return crud.create_materi(db=db, materi_data=materi_data)


@app.get("/kelas/{kelas_id}/materi", response_model=MateriListResponse)
def list_materis(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if current_user.role.value == "murid" and not crud.is_murid_enrolled(db=db, kelas_id=kelas_id, murid_id=current_user.id):
        raise HTTPException(status_code=403, detail="Anda tidak terdaftar di kelas ini")
    return crud.get_materis_by_kelas(db=db, kelas_id=kelas_id)


@app.get("/materi/{materi_id}", response_model=MateriResponse)
def get_materi(materi_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    materi = crud.get_materi_by_id(db=db, materi_id=materi_id)
    if not materi:
        raise HTTPException(status_code=404, detail="Materi tidak ditemukan")
    if current_user.role.value == "murid" and not crud.is_murid_enrolled(db=db, kelas_id=materi.kelas_id, murid_id=current_user.id):
        raise HTTPException(status_code=403, detail="Anda tidak terdaftar di kelas ini")
    return materi


@app.put("/materi/{materi_id}", response_model=MateriResponse)
def update_materi(materi_id: int, materi_data: MateriUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    materi = crud.get_materi_by_id(db=db, materi_id=materi_id)
    if not materi:
        raise HTTPException(status_code=404, detail="Materi tidak ditemukan")
    kelas = crud.get_kelas_by_id(db=db, kelas_id=materi.kelas_id)
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    return crud.update_materi(db=db, materi_id=materi_id, materi_data=materi_data)


@app.delete("/materi/{materi_id}", status_code=204)
def delete_materi(materi_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    materi = crud.get_materi_by_id(db=db, materi_id=materi_id)
    if not materi:
        raise HTTPException(status_code=404, detail="Materi tidak ditemukan")
    kelas = crud.get_kelas_by_id(db=db, kelas_id=materi.kelas_id)
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    crud.delete_materi(db=db, materi_id=materi_id)
    return None


@app.post("/tugas", response_model=TugasResponse, status_code=201)
def create_tugas(tugas_data: TugasCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=tugas_data.kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    return crud.create_tugas(db=db, tugas_data=tugas_data)


@app.get("/kelas/{kelas_id}/tugas", response_model=TugasListResponse)
def list_tugas(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if current_user.role.value == "murid" and not crud.is_murid_enrolled(db=db, kelas_id=kelas_id, murid_id=current_user.id):
        raise HTTPException(status_code=403, detail="Anda tidak terdaftar di kelas ini")
    return crud.get_tugas_by_kelas(db=db, kelas_id=kelas_id)


@app.get("/tugas/my", response_model=TugasListResponse)
def list_my_tugas(db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    return crud.get_all_tugas_by_murid(db=db, murid_id=current_user.id)


@app.get("/tugas/{tugas_id}", response_model=TugasResponse)
def get_tugas(tugas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tugas = crud.get_tugas_by_id(db=db, tugas_id=tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")
    if current_user.role.value == "murid" and not crud.is_murid_enrolled(db=db, kelas_id=tugas.kelas_id, murid_id=current_user.id):
        raise HTTPException(status_code=403, detail="Anda tidak terdaftar di kelas ini")
    return tugas


@app.put("/tugas/{tugas_id}", response_model=TugasResponse)
def update_tugas(tugas_id: int, tugas_data: TugasUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    tugas = crud.get_tugas_by_id(db=db, tugas_id=tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")
    kelas = crud.get_kelas_by_id(db=db, kelas_id=tugas.kelas_id)
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    return crud.update_tugas(db=db, tugas_id=tugas_id, tugas_data=tugas_data)


@app.delete("/tugas/{tugas_id}", status_code=204)
def delete_tugas(tugas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    tugas = crud.get_tugas_by_id(db=db, tugas_id=tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")
    kelas = crud.get_kelas_by_id(db=db, kelas_id=tugas.kelas_id)
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    crud.delete_tugas(db=db, tugas_id=tugas_id)
    return None


@app.post("/pengumpulan", response_model=PengumpulanResponse, status_code=201)
def submit_tugas(pengumpulan_data: PengumpulanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    tugas = crud.get_tugas_by_id(db=db, tugas_id=pengumpulan_data.tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")
    if not crud.is_murid_enrolled(db=db, kelas_id=tugas.kelas_id, murid_id=current_user.id):
        raise HTTPException(status_code=403, detail="Anda tidak terdaftar di kelas ini")
    pengumpulan = crud.create_pengumpulan(db=db, pengumpulan_data=pengumpulan_data, murid_id=current_user.id)
    if not pengumpulan:
        raise HTTPException(status_code=400, detail="Anda sudah mengumpulkan tugas ini")
    return pengumpulan


@app.get("/tugas/{tugas_id}/pengumpulan", response_model=PengumpulanListResponse)
def list_pengumpulan_by_tugas(tugas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tugas = crud.get_tugas_by_id(db=db, tugas_id=tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")
    kelas = crud.get_kelas_by_id(db=db, kelas_id=tugas.kelas_id)
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Hanya guru yang dapat melihat semua pengumpulan")
    return crud.get_pengumpulan_by_tugas(db=db, tugas_id=tugas_id)


@app.get("/pengumpulan/my", response_model=PengumpulanListResponse)
def list_my_pengumpulan(db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    return crud.get_pengumpulan_by_murid(db=db, murid_id=current_user.id)


@app.put("/pengumpulan/{pengumpulan_id}", response_model=PengumpulanResponse)
def update_pengumpulan(pengumpulan_id: int, pengumpulan_data: PengumpulanUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    pengumpulan = crud.get_pengumpulan_by_id(db=db, pengumpulan_id=pengumpulan_id)
    if not pengumpulan:
        raise HTTPException(status_code=404, detail="Pengumpulan tidak ditemukan")
    if pengumpulan.murid_id != current_user.id:
        raise HTTPException(status_code=403, detail="Ini bukan tugas Anda")
    return crud.update_pengumpulan(db=db, pengumpulan_id=pengumpulan_id, pengumpulan_data=pengumpulan_data)


@app.post("/pengumpulan/{pengumpulan_id}/nilai", response_model=PengumpulanResponse)
def give_nilai(pengumpulan_id: int, nilai_data: PengumpulanNilai, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    pengumpulan = crud.get_pengumpulan_by_id(db=db, pengumpulan_id=pengumpulan_id)
    if not pengumpulan:
        raise HTTPException(status_code=404, detail="Pengumpulan tidak ditemukan")
    tugas = crud.get_tugas_by_id(db=db, tugas_id=pengumpulan.tugas_id)
    kelas = crud.get_kelas_by_id(db=db, kelas_id=tugas.kelas_id)
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    return crud.give_nilai(db=db, pengumpulan_id=pengumpulan_id, nilai_data=nilai_data)


@app.post("/presensi", response_model=PresensiResponse, status_code=201)
def create_presensi(presensi_data: PresensiCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=presensi_data.kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    presensi = crud.create_presensi(db=db, presensi_data=presensi_data)
    if not presensi:
        raise HTTPException(status_code=400, detail="Presensi sudah ada untuk murid ini pada tanggal ini")
    return presensi


@app.get("/kelas/{kelas_id}/presensi", response_model=PresensiListResponse)
def list_presensis_by_kelas(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Hanya guru yang dapat melihat semua presensi")
    return crud.get_presensis_by_kelas(db=db, kelas_id=kelas_id)


@app.get("/presensi/my", response_model=PresensiListResponse)
def list_my_presensi(db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    return crud.get_presensis_by_murid(db=db, murid_id=current_user.id)


@app.get("/kelas/{kelas_id}/presensi/my", response_model=PresensiListResponse)
def list_my_presensi_in_kelas(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if not crud.is_murid_enrolled(db=db, kelas_id=kelas_id, murid_id=current_user.id):
        raise HTTPException(status_code=403, detail="Anda tidak terdaftar di kelas ini")
    return crud.get_presensis_by_kelas_and_murid(db=db, kelas_id=kelas_id, murid_id=current_user.id)


@app.get("/kelas/{kelas_id}/presensi/my/stats", response_model=PresensiStatsResponse)
def get_my_presensi_stats(kelas_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_murid)):
    kelas = crud.get_kelas_by_id(db=db, kelas_id=kelas_id)
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan")
    if not crud.is_murid_enrolled(db=db, kelas_id=kelas_id, murid_id=current_user.id):
        raise HTTPException(status_code=403, detail="Anda tidak terdaftar di kelas ini")
    return crud.get_presensi_stats_by_murid(db=db, murid_id=current_user.id, kelas_id=kelas_id)


@app.put("/presensi/{presensi_id}", response_model=PresensiResponse)
def update_presensi(presensi_id: int, presensi_data: PresensiUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_guru)):
    presensi = db.query(Presensi).filter(Presensi.id == presensi_id).first()
    if not presensi:
        raise HTTPException(status_code=404, detail="Presensi tidak ditemukan")
    kelas = crud.get_kelas_by_id(db=db, kelas_id=presensi.kelas_id)
    if kelas.guru_id != current_user.id:
        raise HTTPException(status_code=403, detail="Anda bukan guru kelas ini")
    return crud.update_presensi(db=db, presensi_id=presensi_id, presensi_data=presensi_data)


@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create_item(db=db, item_data=item)


@app.get("/items", response_model=ItemListResponse)
def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud.get_items(db=db, skip=skip, limit=limit, search=search)


@app.get("/items/stats", response_model=ItemStatsResponse)
def get_items_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_item_stats(db=db)


@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = crud.get_item(db=db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {item_id} tidak ditemukan")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = crud.update_item(db=db, item_id=item_id, item_data=item)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Item {item_id} tidak ditemukan")
    return updated


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud.delete_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Item {item_id} tidak ditemukan")
    return None
