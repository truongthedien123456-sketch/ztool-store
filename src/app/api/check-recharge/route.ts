import { NextResponse } from 'next/server';
import { successfulTransactions } from '../sepay-webhook/route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ transactions: [] });
  }

  // Lọc các giao dịch mới thuộc về username này
  const userTx = successfulTransactions.filter(
    (tx) => tx.username.toLowerCase() === username.trim().toLowerCase()
  );

  return NextResponse.json({
    transactions: userTx,
  });
}