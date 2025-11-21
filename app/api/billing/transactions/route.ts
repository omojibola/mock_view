import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ApiResponseBuilder } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return ApiResponseBuilder.unauthorized('Unauthorized');
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type'); // 'all', 'credit', 'debit'
    const offset = (page - 1) * limit;

    // Fetch user transactions
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply type filter
    if (type === 'credit') {
      query = query.in('transaction_type', ['CREDIT', 'top_up', 'REFUND']);
    } else if (type === 'debit') {
      query = query.in('transaction_type', ['DEBIT', 'USAGE']);
    }

    // Apply pagination and ordering
    const {
      data: transactions,
      error,
      count,
    } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      return ApiResponseBuilder.error(
        'Failed to fetch transactions',
        'FETCH_ERROR',
        500,
        error?.message
      );
    }

    // Transform data to match frontend interface
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      userId: transaction.user_id,
      type: transaction.transaction_type,
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.created_at,
    }));

    return ApiResponseBuilder.success({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in transactions route:', error);
    return ApiResponseBuilder.error(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      500,
      error?.toString()
    );
  }
}
