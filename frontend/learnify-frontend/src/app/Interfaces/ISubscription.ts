export interface ISubscription {
  id: number;
  amount_paid: string;
  transaction_reference: string;
  payment_status: string;
  created_at: string;
  package_user: {
    user: {
      email: string;
      grade: string;
    };
    package: {
      name: string;
    };
  };
}