#!/bin/bash
export DATABASE_URL='postgresql://postgres.cqwtficwurpfgbgbmgmq:GiftVibes2026%21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'
export DIRECT_DATABASE_URL='postgresql://postgres.cqwtficwurpfgbgbmgmq:GiftVibes2026%21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'

echo "Running prisma db push..."
npx prisma db push --schema=apps/storefront/prisma/schema.prisma
