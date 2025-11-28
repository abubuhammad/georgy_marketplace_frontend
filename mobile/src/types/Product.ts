export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  rating: number;
  seller_id: string;
  category_id?: string;
  stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
}
