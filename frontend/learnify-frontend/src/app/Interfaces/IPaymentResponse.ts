 import { IPackage } from './IPackage';
 export interface IPaymentResponse {
  success: boolean;
  payment_url?: string;
  package?: IPackage;
  payment?: any;
  message?: string;
  errors?: any;
}