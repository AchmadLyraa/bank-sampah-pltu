// Interface definitions untuk semua data types
export interface BankSampah {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
  password: string;
  longitude?: number | null; // Added longitude field
  latitude?: number | null; // Added latitude field
  isActive: boolean; // Added isActive field
  role: Role; // Added role field
  createdAt: Date;
  updatedAt: Date;
}

// 🆕 NEW: Interface untuk Person (individu)
export interface Person {
  id: string;
  nama: string;
  nik: string;
  alamat: string;
  telepon: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// 🔄 MODIFIED: Interface untuk Nasabah (sekarang adalah hubungan)
export interface Nasabah {
  id: string;
  saldo: number;
  isActive: boolean;
  bankSampahId: string;
  personId: string;
  createdAt: Date;
  updatedAt: Date;
  // 🆕 NEW: Sertakan data Person terkait
  person?: Person;
  // 🆕 NEW: Sertakan data BankSampah terkait (opsional di sini karena tidak selalu di-include)
  bankSampah?: BankSampah;
}

// 🆕 NEW: Tipe untuk hubungan Nasabah yang disimpan di sesi
export interface NasabahRelationshipForSession {
  nasabahId: string; // ID dari hubungan Nasabah
  bankSampahId: string; // ID dari Bank Sampah
  bankSampahNama: string; // Nama Bank Sampah
  saldo: number; // Saldo spesifik untuk hubungan ini
}

// 🆕 NEW: Tipe untuk sesi nasabah
export interface NasabahSession {
  personId: string;
  userType: "nasabah";
  email: string;
  nama: string;
  bankSampahRelationships: NasabahRelationshipForSession[];
  selectedBankSampahId: string;
}

export interface AuthenticatedNasabah extends Nasabah {
  person: Person; // Override untuk membuat 'person' wajib
}

export interface InventarisSampah {
  id: string;
  jenisSampah: string;
  hargaPerKg: number;
  stokKg: number;
  isActive: boolean; // 🆕 NEW FIELD
  bankSampahId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaksi {
  id: string;
  jenis:
    | "PEMASUKAN"
    | "PENGELUARAN"
    | "PENJUALAN_SAMPAH"
    | "PEMASUKAN_UMUM"
    | "PENGELUARAN_UMUM";
  totalNilai: number;
  keterangan?: string | null;
  nasabahId: string | null;
  bankSampahId: string;
  // createdAt: Date
  createdAt: string;
  nasabah: Nasabah | null;
  detailTransaksi: DetailTransaksi[];
}

export interface DetailTransaksi {
  id: string;
  transaksiId: string;
  inventarisSampahId: string;
  beratKg: number;
  hargaPerKg: number;
  subtotal: number;
  createdAt: Date;
  inventarisSampah?: InventarisSampah;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface PenimbanganFormData {
  nasabahId: string;
  items: {
    inventarisSampahId: string;
    beratKg: number;
  }[];
}

export interface PenarikanFormData {
  nasabahId: string;
  jumlah: number;
}

export enum Role {
  CONTROLLER = "CONTROLLER",
  BANK_SAMPAH = "BANK_SAMPAH",
}

export interface Controller {
  id: string;
  nama: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
