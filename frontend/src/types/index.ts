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

export enum OrderCustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
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
  customFields?: OrderCustomFieldValue[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCustomField {
  id: string;
  fieldName: string;
  fieldType: OrderCustomFieldType;
  required: boolean;
  displayOrder: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCustomFieldValue {
  fieldId: string;
  fieldName?: string;
  fieldType?: OrderCustomFieldType;
  value?: string;
}

export type CreateOrderDTO = Omit<Order, 'id' | 'deleted' | 'createdAt' | 'updatedAt' | 'customerName'>;
export type UpdateOrderDTO = CreateOrderDTO;

export type CreateOrderCustomFieldDTO = Omit<OrderCustomField, 'id' | 'deleted' | 'createdAt' | 'updatedAt'>;
export type UpdateOrderCustomFieldDTO = CreateOrderCustomFieldDTO;

export type CreateCustomerDTO = Omit<Customer, 'id' | 'deleted' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerDTO = CreateCustomerDTO;
