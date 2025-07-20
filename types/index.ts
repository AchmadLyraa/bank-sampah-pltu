// Interface definitions untuk semua data types
export interface BankSampah {
  id: string
  nama: string
  alamat: string
  telepon: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface Nasabah {
  id: string
  nama: string
  alamat: string
  telepon: string
  email: string
  password: string
  saldo: number
  bankSampahId: string
  createdAt: Date
  updatedAt: Date
}

export interface InventarisSampah {
  id: string
  jenisSampah: string
  hargaPerKg: number
  stokKg: number
  isActive: boolean // 🆕 NEW FIELD
  bankSampahId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaksi {
  id: string
  jenis: "PEMASUKAN" | "PENGELUARAN" | "PENJUALAN_SAMPAH"
  totalNilai: number
  keterangan?: string | null
  nasabahId: string | null
  bankSampahId: string
  createdAt: Date
  nasabah?: Nasabah | null
  detailTransaksi?: DetailTransaksi[]
}

export interface DetailTransaksi {
  id: string
  transaksiId: string
  inventarisSampahId: string
  beratKg: number
  hargaPerKg: number
  subtotal: number
  createdAt: Date
  inventarisSampah?: InventarisSampah
}

export interface LoginFormData {
  email: string
  password: string
  userType: "bank-sampah" | "nasabah"
}

export interface PenimbanganFormData {
  nasabahId: string
  items: {
    inventarisSampahId: string
    beratKg: number
  }[]
}

export interface PenarikanFormData {
  nasabahId: string
  jumlah: number
}
