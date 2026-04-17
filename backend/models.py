from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, Date, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum


class UserRole(str, enum.Enum):
    GURU = "guru"
    MURID = "murid"


class PresensiStatus(str, enum.Enum):
    HADIR = "hadir"
    IZIN = "izin"
    SAKIT = "sakit"
    ALFA = "alfa"


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    nama = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.MURID)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kelas_yang_diampu = relationship("Kelas", back_populates="guru", foreign_keys="Kelas.guru_id")
    enrollments = relationship("KelasMurid", back_populates="murid")
    pengumpulan_list = relationship("Pengumpulan", back_populates="murid")
    presensi_list = relationship("Presensi", back_populates="murid")


class Kelas(Base):
    __tablename__ = "kelas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nama_kelas = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=True)
    guru_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    guru = relationship("User", back_populates="kelas_yang_diampu", foreign_keys=[guru_id])
    enrollments = relationship("KelasMurid", back_populates="kelas", cascade="all, delete-orphan")
    materis = relationship("Materi", back_populates="kelas", cascade="all, delete-orphan")
    tugass = relationship("Tugas", back_populates="kelas", cascade="all, delete-orphan")
    presensis = relationship("Presensi", back_populates="kelas", cascade="all, delete-orphan")


class KelasMurid(Base):
    __tablename__ = "kelas_murid"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    kelas_id = Column(Integer, ForeignKey("kelas.id"), nullable=False)
    murid_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kelas = relationship("Kelas", back_populates="enrollments")
    murid = relationship("User", back_populates="enrollments")


class Materi(Base):
    __tablename__ = "materi"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    kelas_id = Column(Integer, ForeignKey("kelas.id"), nullable=False)
    judul = Column(String(200), nullable=False)
    konten = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    kelas = relationship("Kelas", back_populates="materis")


class Tugas(Base):
    __tablename__ = "tugas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    kelas_id = Column(Integer, ForeignKey("kelas.id"), nullable=False)
    judul = Column(String(200), nullable=False)
    deskripsi = Column(Text, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kelas = relationship("Kelas", back_populates="tugass")
    pengumpulan_list = relationship("Pengumpulan", back_populates="tugas", cascade="all, delete-orphan")


class Pengumpulan(Base):
    __tablename__ = "pengumpulan"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tugas_id = Column(Integer, ForeignKey("tugas.id"), nullable=False)
    murid_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_jawaban = Column(String(500), nullable=True)
    jawaban_teks = Column(Text, nullable=True)
    nilai = Column(Integer, nullable=True)
    feedback_guru = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tugas = relationship("Tugas", back_populates="pengumpulan_list")
    murid = relationship("User", back_populates="pengumpulan_list")


class Presensi(Base):
    __tablename__ = "presensi"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    kelas_id = Column(Integer, ForeignKey("kelas.id"), nullable=False)
    murid_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tanggal = Column(Date, nullable=False)
    status = Column(SQLEnum(PresensiStatus), nullable=False, default=PresensiStatus.HADIR)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    kelas = relationship("Kelas", back_populates="presensis")
    murid = relationship("User", back_populates="presensi_list")
