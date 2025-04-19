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
export interface ISubscriptionDetail {
  subscription_id: number;
  package: {
    id: number;
    name: string;
  };
  status: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  payment_status: string;
  renewal_options?: {
    id: number;
    name: string;
    price: string;
    duration_days: number;
  }[];
}