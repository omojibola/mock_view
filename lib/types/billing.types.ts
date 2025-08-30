export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
}

export interface BillingInfo {
  userId: string;
  credits: number;
  totalSpent: number;
  lastPurchase?: string;
}

export interface PurchaseCreditsRequest {
  credits: number;
  paymentMethodId?: string;
}

export interface CreditUsage {
  interviewId: string;
  creditsUsed: number;
  timestamp: string;
}
