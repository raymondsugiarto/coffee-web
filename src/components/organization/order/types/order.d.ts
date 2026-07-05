
export interface OrderDto {
  id?: string;
  orderAt: string;
  totalQty: string;
  totalAmount: string;
  status: string;
  orderItems?: OrderItemDto[];
}

