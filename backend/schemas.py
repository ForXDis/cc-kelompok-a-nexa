import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime, date


EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"


class UserRole(str):
    GURU = "guru"
    MURID = "murid"


class PresensiStatus(str):
    HADIR = "hadir"
    IZIN = "izin"
    SAKIT = "sakit"
    ALFA = "alfa"


class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, examples=["Laptop"])
    description: Optional[str] = Field(None, examples=["Laptop untuk cloud computing"])
    price: float = Field(..., gt=0, examples=[15000000])
    quantity: int = Field(0, ge=0, examples=[10])


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)


class ItemResponse(ItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    total: int
    items: list[ItemResponse]


class ItemStatsResponse(BaseModel):
    total_items: int
    total_quantity: int
    total_value: float
    average_price: float


class UserRegister(BaseModel):
    email: str = Field(
        ...,
        pattern=EMAIL_REGEX,
        examples=["user@student.itk.ac.id"],
        description="Format email harus valid",
    )
    name: str = Field(..., min_length=2, max_length=100, examples=["Aidil Saputra"])
    password: str = Field(
        ...,
        min_length=8,
        examples=["P@ssword123"],
        description="Password minimal 8 karakter",
    )
    role: Optional[str] = Field(default="murid", examples=["guru", "murid"])

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str) -> str:
        if not re.fullmatch(EMAIL_REGEX, value):
            raise ValueError("Format email tidak valid")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password minimal 8 karakter")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password harus mengandung huruf besar")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password harus mengandung huruf kecil")
        if not re.search(r"\d", value):
            raise ValueError("Password harus mengandung angka")
        return value

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value and value not in ["guru", "murid"]:
            raise ValueError("Role harus 'guru' atau 'murid'")
        return value or "murid"


class UserResponse(BaseModel):
    id: int
    email: str
    name: str = Field(validation_alias="nama")
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class UserUpdate(BaseModel):
    nama: Optional[str] = Field(None, min_length=2, max_length=100)


class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(...)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class GuruResponse(BaseModel):
    id: int
    nama: str
    email: str
    role: str

    class Config:
        from_attributes = True


class MuridResponse(BaseModel):
    id: int
    nama: str
    email: str
    role: str

    class Config:
        from_attributes = True


class KelasCreate(BaseModel):
    nama_kelas: str = Field(..., min_length=1, max_length=100)
    deskripsi: Optional[str] = None


class KelasUpdate(BaseModel):
    nama_kelas: Optional[str] = Field(None, min_length=1, max_length=100)
    deskripsi: Optional[str] = None


class KelasResponse(BaseModel):
    id: int
    nama_kelas: str
    deskripsi: Optional[str]
    guru_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class KelasDetailResponse(KelasResponse):
    guru: GuruResponse
    jumlah_murid: int = 0


class EnrollCreate(BaseModel):
    murid_id: int


class EnrollResponse(BaseModel):
    id: int
    kelas_id: int
    murid_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        exclude = ["murid", "kelas"]


class EnrollDetailResponse(BaseModel):
    id: int
    kelas_id: int
    murid_id: int
    created_at: datetime
    murid: Optional[MuridResponse] = None

    class Config:
        from_attributes = True


class MateriCreate(BaseModel):
    kelas_id: int
    judul: str = Field(..., min_length=1, max_length=200)
    konten: Optional[str] = None


class MateriUpdate(BaseModel):
    judul: Optional[str] = Field(None, min_length=1, max_length=200)
    konten: Optional[str] = None


class MateriResponse(BaseModel):
    id: int
    kelas_id: int
    judul: str
    konten: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class MateriListResponse(BaseModel):
    total: int
    materis: list[MateriResponse]


class TugasCreate(BaseModel):
    kelas_id: int
    judul: str = Field(..., min_length=1, max_length=200)
    deskripsi: Optional[str] = None
    deadline: datetime


class TugasUpdate(BaseModel):
    judul: Optional[str] = Field(None, min_length=1, max_length=200)
    deskripsi: Optional[str] = None
    deadline: Optional[datetime] = None


class TugasResponse(BaseModel):
    id: int
    kelas_id: int
    judul: str
    deskripsi: Optional[str]
    deadline: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class TugasListResponse(BaseModel):
    total: int
    tugass: list[TugasResponse]


class PengumpulanCreate(BaseModel):
    tugas_id: int
    file_jawaban: Optional[str] = None
    jawaban_teks: Optional[str] = None


class PengumpulanUpdate(BaseModel):
    file_jawaban: Optional[str] = None
    jawaban_teks: Optional[str] = None


class PengumpulanNilai(BaseModel):
    nilai: int = Field(..., ge=0, le=100)
    feedback_guru: Optional[str] = None


class PengumpulanResponse(BaseModel):
    id: int
    tugas_id: int
    murid_id: int
    file_jawaban: Optional[str]
    jawaban_teks: Optional[str]
    nilai: Optional[int]
    feedback_guru: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PengumpulanListResponse(BaseModel):
    total: int
    pengumpulans: list[PengumpulanResponse]


class PresensiCreate(BaseModel):
    kelas_id: int
    murid_id: int
    tanggal: date
    status: str = Field(default="hadir", examples=["hadir", "izin", "sakit", "alfa"])

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in ["hadir", "izin", "sakit", "alfa"]:
            raise ValueError("Status harus 'hadir', 'izin', 'sakit', atau 'alfa'")
        return value


class PresensiUpdate(BaseModel):
    status: str = Field(..., examples=["hadir", "izin", "sakit", "alfa"])

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in ["hadir", "izin", "sakit", "alfa"]:
            raise ValueError("Status harus 'hadir', 'izin', 'sakit', atau 'alfa'")
        return value


class PresensiResponse(BaseModel):
    id: int
    kelas_id: int
    murid_id: int
    tanggal: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PresensiListResponse(BaseModel):
    total: int
    presensis: list[PresensiResponse]


class PresensiStatsResponse(BaseModel):
    total_pertemuan: int
    hadir: int
    izin: int
    sakit: int
    alfa: int
    presentase_hadir: float
