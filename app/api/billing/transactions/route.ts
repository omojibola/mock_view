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

    // Fetch user transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return ApiResponseBuilder.error(
        'Failed to fetch transactions',
        'FETCH_ERROR',
        500,
        error
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

    return ApiResponseBuilder.success(formattedTransactions);
  } catch (error) {
    console.error('Error in transactions route:', error);
    return ApiResponseBuilder.error(
      'Internal server error',
      'INTERNAL_SERVER_ERROR',
      500,
      error
    );
  }
}
