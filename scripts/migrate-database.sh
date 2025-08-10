#!/bin/bash
echo "🔄 Migrating database to new schema..."

# 1. Push schema ke database
npx prisma db push

# 2. Generate Prisma client baru
npx prisma generate

echo "✅ Database migration completed!"
echo "🌱 Now you can run: npm run db:seed"
