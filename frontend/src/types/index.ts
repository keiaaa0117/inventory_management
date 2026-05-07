export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum Status {
  PENDING = 'PENDING',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
}

export interface Customer {
  id: string;
  name: string;
  contactInfo?: string;
  memo?: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderName: string;
  customerId: string;
  customerName: string;
  memo?: string;
  priority: Priority;
  status: Status;
  constructionDate: string; // YYYY-MM-DD
  deliveryDate: string; // YYYY-MM-DD
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderDTO = Omit<Order, 'id' | 'deleted' | 'createdAt' | 'updatedAt' | 'customerName'>;
export type UpdateOrderDTO = CreateOrderDTO;

export type CreateCustomerDTO = Omit<Customer, 'id' | 'deleted' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerDTO = CreateCustomerDTO;
