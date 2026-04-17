from sqlalchemy.orm import Session
from sqlalchemy import or_, func, and_
from models import (
    Item, User, UserRole,
    Kelas, KelasMurid,
    Materi, Tugas, Pengumpulan, Presensi,
    PresensiStatus
)
from schemas import (
    ItemCreate, ItemUpdate, UserRegister, UserUpdate,
    KelasCreate, KelasUpdate,
    MateriCreate, MateriUpdate,
    TugasCreate, TugasUpdate,
    PengumpulanCreate, PengumpulanUpdate, PengumpulanNilai,
    PresensiCreate, PresensiUpdate
)
from auth import hash_password, verify_password
from typing import Optional, Any
from datetime import datetime


def serialize_model(obj: Any) -> dict:
    """Convert SQLAlchemy object to dict, handling relationships."""
    if obj is None:
        return None
    result = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        if isinstance(value, datetime):
            result[column.name] = value.isoformat() if value else None
        else:
            result[column.name] = value
    return result


def serialize_model_with_relations(obj: Any, relations: list[str] = None) -> dict:
    """Convert SQLAlchemy object to dict with optional nested relations."""
    if obj is None:
        return None
    result = serialize_model(obj)
    
    if relations:
        for rel in relations:
            if hasattr(obj, rel):
                rel_obj = getattr(obj, rel)
                if rel_obj is None:
                    result[rel] = None
                elif isinstance(rel_obj, list):
                    result[rel] = [serialize_model(item) for item in rel_obj]
                else:
                    result[rel] = serialize_model(rel_obj)
    
    return result


def create_item(db: Session, item_data: ItemCreate) -> Item:
    db_item = Item(**item_data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_items(db: Session, skip: int = 0, limit: int = 20, search: str = None):
    query = db.query(Item)
    if search:
        query = query.filter(
            or_(
                Item.name.ilike(f"%{search}%"),
                Item.description.ilike(f"%{search}%")
            )
        )
    total = query.count()
    items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


def get_item_stats(db: Session):
    total_items, total_quantity, total_value, average_price = db.query(
        func.count(Item.id),
        func.coalesce(func.sum(Item.quantity), 0),
        func.coalesce(func.sum(Item.price * Item.quantity), 0.0),
        func.coalesce(func.avg(Item.price), 0.0),
    ).one()
    return {
        "total_items": int(total_items or 0),
        "total_quantity": int(total_quantity or 0),
        "total_value": float(total_value or 0.0),
        "average_price": float(average_price or 0.0),
    }


def get_item(db: Session, item_id: int) -> Item | None:
    return db.query(Item).filter(Item.id == item_id).first()


def update_item(db: Session, item_id: int, item_data: ItemUpdate) -> Item | None:
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        return None
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int) -> bool:
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True


def create_user(db: Session, user_data: UserRegister) -> User | None:
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return None
    db_user = User(
        email=user_data.email,
        nama=user_data.name,
        password=hash_password(user_data.password),
        role=UserRole(user_data.role or "murid"),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 20, role: str = None):
    query = db.query(User)
    if role:
        query = query.filter(User.role == UserRole(role))
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    return {"total": total, "users": users}


def get_murids(db: Session) -> list[User]:
    return db.query(User).filter(User.role == UserRole.MURID).all()


def update_user(db: Session, user_id: int, user_data: UserUpdate) -> User | None:
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user


def create_kelas(db: Session, kelas_data: KelasCreate, guru_id: int):
    db_kelas = Kelas(
        nama_kelas=kelas_data.nama_kelas,
        deskripsi=kelas_data.deskripsi,
        guru_id=guru_id,
    )
    db.add(db_kelas)
    db.commit()
    db.refresh(db_kelas)
    return serialize_model_with_relations(db_kelas, ["guru"])


def get_kelas(db: Session, skip: int = 0, limit: int = 20):
    total = db.query(Kelas).count()
    kelass = db.query(Kelas).order_by(Kelas.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "kelass": kelass}


def get_kelas_by_id(db: Session, kelas_id: int) -> Kelas | None:
    return db.query(Kelas).filter(Kelas.id == kelas_id).first()


def get_kelas_by_guru(db: Session, guru_id: int):
    total = db.query(Kelas).filter(Kelas.guru_id == guru_id).count()
    kelass = db.query(Kelas).filter(Kelas.guru_id == guru_id).order_by(Kelas.created_at.desc()).all()
    return {"total": total, "kelass": [serialize_model_with_relations(k, ["guru"]) for k in kelass]}


def get_kelas_by_murid(db: Session, murid_id: int):
    enrollments = db.query(KelasMurid).filter(KelasMurid.murid_id == murid_id).all()
    kelas_ids = [e.kelas_id for e in enrollments]
    kelass = db.query(Kelas).filter(Kelas.id.in_(kelas_ids)).all() if kelas_ids else []
    return {"total": len(kelass), "kelass": [serialize_model_with_relations(k, ["guru"]) for k in kelass]}


def update_kelas(db: Session, kelas_id: int, kelas_data: KelasUpdate):
    db_kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not db_kelas:
        return None
    update_data = kelas_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_kelas, field, value)
    db.commit()
    db.refresh(db_kelas)
    return serialize_model_with_relations(db_kelas, ["guru"])


def delete_kelas(db: Session, kelas_id: int) -> bool:
    db_kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not db_kelas:
        return False
    db.delete(db_kelas)
    db.commit()
    return True


def enroll_murid(db: Session, kelas_id: int, murid_id: int):
    existing = db.query(KelasMurid).filter(
        and_(KelasMurid.kelas_id == kelas_id, KelasMurid.murid_id == murid_id)
    ).first()
    if existing:
        return None
    db_enroll = KelasMurid(kelas_id=kelas_id, murid_id=murid_id)
    db.add(db_enroll)
    db.commit()
    db.refresh(db_enroll)
    return serialize_model(db_enroll)


def unenroll_murid(db: Session, kelas_id: int, murid_id: int) -> bool:
    db_enroll = db.query(KelasMurid).filter(
        and_(KelasMurid.kelas_id == kelas_id, KelasMurid.murid_id == murid_id)
    ).first()
    if not db_enroll:
        return False
    db.delete(db_enroll)
    db.commit()
    return True


def get_enrolled_murids(db: Session, kelas_id: int):
    enrollments = db.query(KelasMurid).filter(KelasMurid.kelas_id == kelas_id).all()
    return {"total": len(enrollments), "enrollments": [serialize_model_with_relations(e, ["murid"]) for e in enrollments]}


def is_murid_enrolled(db: Session, kelas_id: int, murid_id: int) -> bool:
    enrollment = db.query(KelasMurid).filter(
        and_(KelasMurid.kelas_id == kelas_id, KelasMurid.murid_id == murid_id)
    ).first()
    return enrollment is not None


def create_materi(db: Session, materi_data: MateriCreate):
    db_materi = Materi(**materi_data.model_dump())
    db.add(db_materi)
    db.commit()
    db.refresh(db_materi)
    return serialize_model(db_materi)


def get_materis_by_kelas(db: Session, kelas_id: int):
    total = db.query(Materi).filter(Materi.kelas_id == kelas_id).count()
    materis = db.query(Materi).filter(Materi.kelas_id == kelas_id).order_by(Materi.created_at.desc()).all()
    return {"total": total, "materis": [serialize_model(m) for m in materis]}


def get_materi_by_id(db: Session, materi_id: int) -> Materi | None:
    return db.query(Materi).filter(Materi.id == materi_id).first()


def update_materi(db: Session, materi_id: int, materi_data: MateriUpdate):
    db_materi = db.query(Materi).filter(Materi.id == materi_id).first()
    if not db_materi:
        return None
    update_data = materi_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_materi, field, value)
    db.commit()
    db.refresh(db_materi)
    return serialize_model(db_materi)


def delete_materi(db: Session, materi_id: int) -> bool:
    db_materi = db.query(Materi).filter(Materi.id == materi_id).first()
    if not db_materi:
        return False
    db.delete(db_materi)
    db.commit()
    return True


def create_tugas(db: Session, tugas_data: TugasCreate):
    db_tugas = Tugas(**tugas_data.model_dump())
    db.add(db_tugas)
    db.commit()
    db.refresh(db_tugas)
    return serialize_model(db_tugas)


def get_tugas_by_kelas(db: Session, kelas_id: int):
    total = db.query(Tugas).filter(Tugas.kelas_id == kelas_id).count()
    tugass = db.query(Tugas).filter(Tugas.kelas_id == kelas_id).order_by(Tugas.deadline.desc()).all()
    return {"total": total, "tugass": [serialize_model(t) for t in tugass]}


def get_tugas_by_id(db: Session, tugas_id: int) -> Tugas | None:
    return db.query(Tugas).filter(Tugas.id == tugas_id).first()


def get_all_tugas_by_murid(db: Session, murid_id: int):
    enrollments = db.query(KelasMurid).filter(KelasMurid.murid_id == murid_id).all()
    kelas_ids = [e.kelas_id for e in enrollments]
    tugass = db.query(Tugas).filter(Tugas.kelas_id.in_(kelas_ids)).order_by(Tugas.deadline.desc()).all() if kelas_ids else []
    return {"total": len(tugass), "tugass": [serialize_model(t) for t in tugass]}


def update_tugas(db: Session, tugas_id: int, tugas_data: TugasUpdate):
    db_tugas = db.query(Tugas).filter(Tugas.id == tugas_id).first()
    if not db_tugas:
        return None
    update_data = tugas_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tugas, field, value)
    db.commit()
    db.refresh(db_tugas)
    return serialize_model(db_tugas)


def delete_tugas(db: Session, tugas_id: int) -> bool:
    db_tugas = db.query(Tugas).filter(Tugas.id == tugas_id).first()
    if not db_tugas:
        return False
    db.delete(db_tugas)
    db.commit()
    return True


def create_pengumpulan(db: Session, pengumpulan_data: PengumpulanCreate, murid_id: int):
    existing = db.query(Pengumpulan).filter(
        and_(Pengumpulan.tugas_id == pengumpulan_data.tugas_id, Pengumpulan.murid_id == murid_id)
    ).first()
    if existing:
        return None
    db_pengumpulan = Pengumpulan(
        tugas_id=pengumpulan_data.tugas_id,
        murid_id=murid_id,
        file_jawaban=pengumpulan_data.file_jawaban,
        jawaban_teks=pengumpulan_data.jawaban_teks,
    )
    db.add(db_pengumpulan)
    db.commit()
    db.refresh(db_pengumpulan)
    return serialize_model(db_pengumpulan)


def update_pengumpulan(db: Session, pengumpulan_id: int, pengumpulan_data: PengumpulanUpdate):
    db_pengumpulan = db.query(Pengumpulan).filter(Pengumpulan.id == pengumpulan_id).first()
    if not db_pengumpulan:
        return None
    update_data = pengumpulan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pengumpulan, field, value)
    db.commit()
    db.refresh(db_pengumpulan)
    return serialize_model(db_pengumpulan)


def give_nilai(db: Session, pengumpulan_id: int, nilai_data: PengumpulanNilai):
    db_pengumpulan = db.query(Pengumpulan).filter(Pengumpulan.id == pengumpulan_id).first()
    if not db_pengumpulan:
        return None
    db_pengumpulan.nilai = nilai_data.nilai
    db_pengumpulan.feedback_guru = nilai_data.feedback_guru
    db.commit()
    db.refresh(db_pengumpulan)
    return serialize_model(db_pengumpulan)


def get_pengumpulan_by_tugas(db: Session, tugas_id: int):
    total = db.query(Pengumpulan).filter(Pengumpulan.tugas_id == tugas_id).count()
    pengumpulans = db.query(Pengumpulan).filter(Pengumpulan.tugas_id == tugas_id).all()
    return {"total": total, "pengumpulans": [serialize_model(p) for p in pengumpulans]}


def get_pengumpulan_by_murid(db: Session, murid_id: int):
    total = db.query(Pengumpulan).filter(Pengumpulan.murid_id == murid_id).count()
    pengumpulans = db.query(Pengumpulan).filter(Pengumpulan.murid_id == murid_id).all()
    return {"total": total, "pengumpulans": [serialize_model(p) for p in pengumpulans]}


def get_pengumpulan_by_id(db: Session, pengumpulan_id: int) -> Pengumpulan | None:
    return db.query(Pengumpulan).filter(Pengumpulan.id == pengumpulan_id).first()


def create_presensi(db: Session, presensi_data: PresensiCreate):
    existing = db.query(Presensi).filter(
        and_(Presensi.kelas_id == presensi_data.kelas_id, Presensi.murid_id == presensi_data.murid_id, Presensi.tanggal == presensi_data.tanggal)
    ).first()
    if existing:
        return None
    db_presensi = Presensi(
        kelas_id=presensi_data.kelas_id,
        murid_id=presensi_data.murid_id,
        tanggal=presensi_data.tanggal,
        status=PresensiStatus(presensi_data.status),
    )
    db.add(db_presensi)
    db.commit()
    db.refresh(db_presensi)
    return serialize_model(db_presensi)


def create_presensi_bulk(db: Session, presensis_data: list[PresensiCreate]) -> list[Presensi]:
    created = []
    for presensi_data in presensis_data:
        existing = db.query(Presensi).filter(
            and_(Presensi.kelas_id == presensi_data.kelas_id, Presensi.murid_id == presensi_data.murid_id, Presensi.tanggal == presensi_data.tanggal)
        ).first()
        if existing:
            continue
        db_presensi = Presensi(
            kelas_id=presensi_data.kelas_id,
            murid_id=presensi_data.murid_id,
            tanggal=presensi_data.tanggal,
            status=PresensiStatus(presensi_data.status),
        )
        db.add(db_presensi)
        created.append(db_presensi)
    db.commit()
    for p in created:
        db.refresh(p)
    return created


def get_presensis_by_kelas(db: Session, kelas_id: int):
    total = db.query(Presensi).filter(Presensi.kelas_id == kelas_id).count()
    presensis = db.query(Presensi).filter(Presensi.kelas_id == kelas_id).order_by(Presensi.tanggal.desc()).all()
    return {"total": total, "presensis": [serialize_model(p) for p in presensis]}


def get_presensis_by_murid(db: Session, murid_id: int):
    total = db.query(Presensi).filter(Presensi.murid_id == murid_id).count()
    presensis = db.query(Presensi).filter(Presensi.murid_id == murid_id).order_by(Presensi.tanggal.desc()).all()
    return {"total": total, "presensis": [serialize_model(p) for p in presensis]}


def get_presensis_by_kelas_and_murid(db: Session, kelas_id: int, murid_id: int):
    total = db.query(Presensi).filter(
        and_(Presensi.kelas_id == kelas_id, Presensi.murid_id == murid_id)
    ).count()
    presensis = db.query(Presensi).filter(
        and_(Presensi.kelas_id == kelas_id, Presensi.murid_id == murid_id)
    ).order_by(Presensi.tanggal.desc()).all()
    return {"total": total, "presensis": [serialize_model(p) for p in presensis]}


def update_presensi(db: Session, presensi_id: int, presensi_data: PresensiUpdate):
    db_presensi = db.query(Presensi).filter(Presensi.id == presensi_id).first()
    if not db_presensi:
        return None
    db_presensi.status = PresensiStatus(presensi_data.status)
    db.commit()
    db.refresh(db_presensi)
    return serialize_model(db_presensi)


def get_presensi_stats_by_murid(db: Session, murid_id: int, kelas_id: int = None):
    query = db.query(Presensi).filter(Presensi.murid_id == murid_id)
    if kelas_id:
        query = query.filter(Presensi.kelas_id == kelas_id)
    
    presensis = query.all()
    total = len(presensis)
    hadir = len([p for p in presensis if p.status == PresensiStatus.HADIR])
    izin = len([p for p in presensis if p.status == PresensiStatus.IZIN])
    sakit = len([p for p in presensis if p.status == PresensiStatus.SAKIT])
    alfa = len([p for p in presensis if p.status == PresensiStatus.ALFA])
    presentase_hadir = (hadir / total * 100) if total > 0 else 0.0
    
    return {
        "total_pertemuan": total,
        "hadir": hadir,
        "izin": izin,
        "sakit": sakit,
        "alfa": alfa,
        "presentase_hadir": round(presentase_hadir, 2),
    }
