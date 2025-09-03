'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  CreditCard,
  Coins,
  Plus,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
} from 'lucide-react';
import toastService from '@/lib/services/toast.service';
import type { CreditTransaction } from '@/lib/types/billing.types';
import { useTheme } from '@/lib/contexts/theme-context';

const CREDIT_PACKAGES = [
  { credits: 5, price: 12.5, popular: false },
  { credits: 10, price: 25, popular: true },
  { credits: 25, price: 62.5, popular: false },
];

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CustomCreditsForm({
  onPurchase,
  purchasing,
}: {
  onPurchase: (credits: number) => void;
  purchasing: boolean;
}) {
  const [customCredits, setCustomCredits] = useState('');
  const [customPrice, setCustomPrice] = useState(0);

  const handleCustomCreditsChange = (value: string) => {
    const credits = Number.parseInt(value) || 0;
    setCustomCredits(value);
    setCustomPrice(credits * 2.5);
  };

  const handleCustomPurchase = () => {
    const credits = Number.parseInt(customCredits);
    if (credits > 0) {
      onPurchase(credits);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='custom-credits'>Number of Credits</Label>
        <Input
          id='custom-credits'
          type='number'
          placeholder='Enter number of credits'
          value={customCredits}
          onChange={(e) => handleCustomCreditsChange(e.target.value)}
          min='1'
          max='1000'
        />
      </div>

      {customPrice > 0 && (
        <div className='p-3 bg-muted rounded-lg'>
          <div className='text-sm text-muted-foreground'>Total Cost</div>
          <div className='text-2xl font-bold text-foreground'>
            ${customPrice.toFixed(2)}
          </div>
          <div className='text-xs text-muted-foreground'>
            ${(customPrice / Number.parseInt(customCredits || '1')).toFixed(2)}{' '}
            per credit
          </div>
        </div>
      )}

      <Button
        onClick={handleCustomPurchase}
        disabled={
          !customCredits || Number.parseInt(customCredits) <= 0 || purchasing
        }
        className='w-full'
      >
        {purchasing ? (
          <div className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
            Processing...
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Purchase {customCredits || 0} Credits
          </div>
        )}
      </Button>
    </div>
  );
}

export default function BillingPage() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [credits, setCredits] = useState(0);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [paymentStatusModal, setPaymentStatusModal] = useState<
    'success' | 'cancelled' | null
  >(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      fetchCredits();
      fetchTransactions();
    }

    const status = searchParams.get('status');
    if (status === 'success' || status === 'cancelled') {
      setPaymentStatusModal(status);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('status');
      window.history.replaceState({}, '', newUrl.pathname);
    }
  }, [user, loading, router]);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/billing/credits');
      const data = await response.json();
      if (data.success) {
        setCredits(data.data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await fetch('/api/billing/transactions');
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  //   const purchaseCredits = async (creditAmount: number) => {
  //     setPurchasing(creditAmount);
  //     try {
  //       const response = await fetch('/api/billing/credits', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ credits: creditAmount }),
  //       });

  //       const data = await response.json();
  //       if (data.success) {
  //         setCredits(data.data.credits);
  //         fetchTransactions();
  //         toastService.success(`Successfully purchased ${creditAmount} credits!`);
  //         setCustomModalOpen(false);
  //       } else {
  //         toastService.error('Failed to purchase credits');
  //       }
  //     } catch (error) {
  //       console.error('Error purchasing credits:', error);
  //       toastService.error('Failed to purchase credits');
  //     } finally {
  //       setPurchasing(null);
  //     }
  //   };

  const purchaseCredits = async (credits: number) => {
    try {
      const response = await fetch('/api/stripe/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      });

      const { id: sessionId } = await response.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js failed to load');

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.log(err);
      toastService.error('Failed to initiate purchase. Please try again.');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <ArrowUpCircle className='h-4 w-4 text-green-500' />;
      case 'DEBIT':
        return <ArrowDownCircle className='h-4 w-4 text-red-500' />;
      default:
        return <Coins className='h-4 w-4' />;
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'Credit Purchase';
      case 'DEBIT':
        return 'Interview Credit Used';
      default:
        return type;
    }
  };

  const closePaymentStatusModal = () => {
    setPaymentStatusModal(null);
    if (paymentStatusModal === 'success') {
      fetchCredits();
      fetchTransactions();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        <Dialog
          open={paymentStatusModal === 'success'}
          onOpenChange={closePaymentStatusModal}
        >
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-green-600 dark:text-green-400'>
                <ArrowUpCircle className='h-6 w-6' />
                Payment Successful!
              </DialogTitle>
              <DialogDescription>
                Your payment has been processed successfully and credits have
                been added to your account.
              </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-center py-6'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <ArrowUpCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
                </div>
                <p className='text-sm text-muted-foreground'>
                  You can now use your credits to take interviews
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={closePaymentStatusModal} className='w-full'>
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Cancelled Modal */}
        <Dialog
          open={paymentStatusModal === 'cancelled'}
          onOpenChange={closePaymentStatusModal}
        >
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-orange-600 dark:text-orange-400'>
                <Settings className='h-6 w-6' />
                Payment Cancelled
              </DialogTitle>
              <DialogDescription>
                Your payment was cancelled. No charges were made to your
                account.
              </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-center py-6'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Settings className='h-8 w-8 text-orange-600 dark:text-orange-400' />
                </div>
                <p className='text-sm text-muted-foreground'>
                  You can try purchasing credits again anytime
                </p>
              </div>
            </div>
            <DialogFooter className='flex gap-2'>
              <Button
                variant='outline'
                onClick={closePaymentStatusModal}
                className='flex-1 bg-transparent'
              >
                Maybe Later
              </Button>
              <Button onClick={closePaymentStatusModal} className='flex-1'>
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div>
          <h1 className='text-xl font-bold text-foreground'>
            Billing & Credits
          </h1>
          <p className='text-md text-muted-foreground'>
            Manage your interview credits and billing information
          </p>
        </div>

        {/* Current Credits */}
        <Card
          className={`w-full rounded-lg border transition-colors ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800 hover:border-cyan-400/50'
              : 'bg-white border-gray-200 hover:border-cyan-400/50 shadow-sm'
          }`}
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Coins className='h-5 w-5 text-cyan-400' />
              Current Balance
            </CardTitle>
            <CardDescription>Your available interview credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-3xl font-bold text-foreground'>
                  {credits}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Credits available
                </div>
              </div>
              <div className='text-right'>
                <div className='text-sm text-muted-foreground'>
                  Cost per interview
                </div>
                <div className='text-lg font-semibold text-foreground'>
                  1 Credit
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div>
          <h2 className='text-xl font-semibold text-foreground mb-4'>
            Purchase Credits
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.credits}
                className={`relative w-full rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800 hover:border-cyan-400/50'
                    : 'bg-white border-gray-200 hover:border-cyan-400/50 shadow-sm'
                }`}
              >
                {pkg.popular && (
                  <Badge className='absolute -top-2 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-black'>
                    Most Popular
                  </Badge>
                )}
                <CardHeader className='text-center'>
                  <CardTitle className='text-lg'>
                    {pkg.credits} Credits
                  </CardTitle>
                  <CardDescription>
                    <span className='text-2xl font-bold text-foreground'>
                      ${pkg.price}
                    </span>
                    <div className='text-xs text-muted-foreground'>
                      ${(pkg.price / pkg.credits).toFixed(2)} per credit
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => purchaseCredits(pkg.credits)}
                    disabled={purchasing === pkg.credits}
                    className={`w-full font-medium ${
                      theme === 'dark'
                        ? 'bg-white hover:bg-gray-100 text-black'
                        : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    {purchasing === pkg.credits ? (
                      <div className='flex items-center gap-2'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-current'></div>
                        Processing...
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <Plus className='h-4 w-4' />
                        Purchase
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Card
              className={`relative w-full rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-900 border-gray-800 hover:border-cyan-400/50'
                  : 'bg-white border-gray-200 hover:border-cyan-400/50 shadow-sm'
              }`}
            >
              <CardHeader className='text-center'>
                <CardTitle className='text-lg flex items-center justify-center gap-2'>
                  <Settings className='h-5 w-5' />
                  Custom
                </CardTitle>
                <CardDescription>
                  <span className='text-lg font-bold text-foreground'>
                    Choose your amount
                  </span>
                  <div className='text-xs text-muted-foreground'>
                    $2.50 per credit
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isMobile ? (
                  <Drawer
                    open={customModalOpen}
                    onOpenChange={setCustomModalOpen}
                  >
                    <DrawerTrigger asChild>
                      <Button
                        className={`w-full font-medium ${
                          theme === 'dark'
                            ? 'bg-white hover:bg-gray-100 text-black'
                            : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        <div className='flex items-center gap-2'>
                          <Settings className='h-4 w-4' />
                          Custom Amount
                        </div>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Purchase Custom Credits</DrawerTitle>
                        <DrawerDescription>
                          Enter the number of credits you&apos;d like to
                          purchase at $2.50 per credit.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className='px-4'>
                        <CustomCreditsForm
                          onPurchase={purchaseCredits}
                          purchasing={purchasing !== null}
                        />
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant='outline'>Cancel</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Dialog
                    open={customModalOpen}
                    onOpenChange={setCustomModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className={`w-full font-medium ${
                          theme === 'dark'
                            ? 'bg-white hover:bg-gray-100 text-black'
                            : 'bg-black hover:bg-gray-800 text-white'
                        }`}
                      >
                        <div className='flex items-center gap-2'>
                          <Settings className='h-4 w-4' />
                          Custom Amount
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Purchase Custom Credits</DialogTitle>
                        <DialogDescription>
                          Enter the number of credits you&apos;d like to
                          purchase at $2.50 per credit.
                        </DialogDescription>
                      </DialogHeader>
                      <CustomCreditsForm
                        onPurchase={purchaseCredits}
                        purchasing={purchasing !== null}
                      />
                      <DialogFooter>
                        <Button
                          variant='outline'
                          onClick={() => setCustomModalOpen(false)}
                        >
                          Cancel
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card
          className={`w-full rounded-lg border transition-colors ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800 hover:border-cyan-400/50'
              : 'bg-white border-gray-200 hover:border-cyan-400/50 shadow-sm'
          }`}
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <History className='h-5 w-5' />
              Transaction History
            </CardTitle>
            <CardDescription>Your recent credit transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400'></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <History className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No transactions yet</p>
                <p className='text-sm'>
                  Your credit purchases and usage will appear here
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`${
                      theme === 'dark' && 'border-gray-800'
                    } flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors`}
                  >
                    <div className='flex items-center gap-3'>
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className='font-medium text-sm text-foreground'>
                          {formatTransactionType(transaction.type)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {transaction.description}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {new Date(transaction.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`font-semibold ${
                          transaction.type === 'CREDIT'
                            ? 'text-green-600 dark:text-green-400'
                            : transaction.type === 'DEBIT'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {transaction.type === 'CREDIT' ? '+' : '-'}
                        {Math.abs(transaction.amount)} credits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Info */}
        <Card
          className={`w-full rounded-lg border transition-colors ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-800 hover:border-cyan-400/50'
              : 'bg-white border-gray-200 hover:border-cyan-400/50 shadow-sm'
          }`}
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              How Credits Work
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-cyan-400 rounded-full mt-2'></div>
              <div className='flex flex-col gap-2'>
                <div className='font-medium text-sm text-foreground'>
                  Free Credits
                </div>
                <div className='text-xs text-muted-foreground'>
                  Every new account starts with 3 free credits
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-cyan-400 rounded-full mt-2'></div>
              <div className='flex flex-col gap-2'>
                <div className='font-medium text-sm text-foreground'>
                  Credit Usage
                </div>
                <div className='text-xs text-muted-foreground'>
                  1 credit is deducted when you start an interview session
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-cyan-400 rounded-full mt-2'></div>
              <div className='flex flex-col gap-2'>
                <div className='font-medium text-foreground text-sm'>
                  No Expiration
                </div>
                <div className='text-xs text-muted-foreground'>
                  Your credits never expire and can be used anytime
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
