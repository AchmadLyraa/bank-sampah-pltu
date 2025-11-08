# Bank Sampah MVP

Aplikasi manajemen bank sampah sederhana dengan fitur lengkap untuk mengelola nasabah, inventaris sampah, dan transaksi.

## Fitur Utama

### Bank Sampah (Admin)
- Dashboard dengan statistik lengkap
- Penimbangan sampah dari nasabah
- Manajemen inventaris sampah dan harga
- Penarikan saldo nasabah
- Penjualan sampah ke pihak ketiga
- Riwayat transaksi lengkap

### Nasabah
- Login dan lihat saldo
- Riwayat transaksi (read-only)
- Informasi profil

## Tech Stack

- **Framework**: Next.js 14 dengan App Router
- **Database**: SQLite dengan Prisma ORM
- **Authentication**: Session-based dengan cookies
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Setup & Installation

1. **Clone dan install dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Setup database**
\`\`\`bash
# Copy environment file
cp .env.example .env

# Push database schema
### use session pooler
npx prisma generate
npm run db:push

# Seed database dengan data demo
npm run db:seed
\`\`\`

3. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

4. **Access aplikasi**
- URL: http://localhost:3000
- Bank Sampah: admin@banksampah.com / password123
- Nasabah: budi@email.com / password123

## Database Schema

- **BankSampah**: Data bank sampah
- **Nasabah**: Data nasabah dengan saldo
- **InventarisSampah**: Jenis sampah dan harga per kg
- **Transaksi**: Record semua transaksi
- **DetailTransaksi**: Detail penimbangan sampah

## Fitur MVP

✅ **Authentication**: Login untuk bank sampah dan nasabah
✅ **Dashboard**: Statistik dan overview
✅ **Penimbangan**: Catat penjualan sampah dari nasabah
✅ **Inventaris**: Kelola jenis sampah dan harga
✅ **Penarikan**: Proses penarikan saldo nasabah
✅ **Penjualan**: Jual sampah ke pihak ketiga
✅ **Transaksi**: Riwayat lengkap semua transaksi
✅ **Responsive**: Mobile-friendly design

## Struktur Project

\`\`\`
├── app/
│   ├── actions/          # Server actions
│   ├── bank-sampah/      # Bank sampah pages
│   ├── nasabah/          # Nasabah pages
│   └── page.tsx          # Login page
├── components/           # Reusable components
├── lib/                  # Utilities
├── types/                # TypeScript interfaces
└── prisma/              # Database schema & seed
\`\`\`

Aplikasi ini dibuat sebagai MVP (Minimum Viable Product) yang fokus pada fungsionalitas inti tanpa kompleksitas berlebihan.
