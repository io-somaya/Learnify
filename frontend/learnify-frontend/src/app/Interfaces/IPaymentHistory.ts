export interface IPaymentHistory {
  id: number;
  package: string;
  amount_paid: number;
  status: string;
  date: string;
  subscription_status: string;
  start_date: string;
  end_date: string;
  transaction_reference: string;
}