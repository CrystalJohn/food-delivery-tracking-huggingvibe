/**
 * API Contract: GET /api/menu
 *
 * Đây là cấu trúc response mà backend CẦN TRẢ VỀ cho endpoint menu.
 * Frontend sẽ thay thế mảng này bằng API call thực khi backend sẵn sàng.
 *
 * @see backend/src/modules/ordering/menu-item.schema.ts
 *
 * Fields:
 * @field _id         - MongoDB ObjectId (string)
 * @field name        - Tên món ăn
 * @field description - Mô tả món ăn
 * @field price       - Giá bán (VND, số nguyên)
 * @field imageUrl    - URL hình ảnh
 * @field category    - Danh mục: 'Combos' | 'Burgers' | 'Fried Chicken' | 'Rice Bowls' | 'Pizza' | 'Drinks'
 * @field available   - Còn phục vụ hay không
 */
export const MOCK_MENU_ITEMS = [
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Super Combo Meal - 4 pcs',
    description: 'Crispy chicken combo with 4 pieces, seasoned fries, and a drink',
    price: 159000,
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=2068',
    category: 'Combos',
    available: true,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d2',
    name: 'Spicy Zinger Burger',
    description: 'Crispy spicy chicken fillet with fresh lettuce and pepper mayo',
    price: 89000,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2070',
    category: 'Burgers',
    available: true,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d3',
    name: 'Crispy Drumsticks (6pcs)',
    description: 'Golden fried drumsticks seasoned with our secret spice blend',
    price: 129000,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=2070',
    category: 'Fried Chicken',
    available: true,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d4',
    name: 'Family Fiesta Bucket',
    description: 'Large family bucket with 12 pieces of crispy chicken, 2 large fries, and 4 drinks',
    price: 299000,
    imageUrl: '/Image-menu.png',
    category: 'Combos',
    available: true,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d5',
    name: 'Cheese Burger Deluxe',
    description: 'Double beef patty with melted cheddar, pickles, and special sauce',
    price: 99000,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2065',
    category: 'Burgers',
    available: true,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d6',
    name: 'Crispy Chicken Wings (8pcs)',
    description: 'Juicy wings with a perfectly crispy coating, served with dipping sauce',
    price: 149000,
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=2070',
    category: 'Fried Chicken',
    available: true,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d7',
    name: 'Vietnamese Chicken Rice Bowl',
    description: 'Grilled chicken thigh over jasmine rice with pickled vegetables',
    price: 69000,
    imageUrl: '/Image-menu.png',
    category: 'Rice Bowls',
    available: true,
  },
  {
    _id: '65f1a2b3c4d5e6f7a8b9c0d8',
    name: 'BBQ Chicken Pizza',
    description: 'Hand-stretched pizza with BBQ chicken, caramelized onions, and mozzarella',
    price: 179000,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2081',
    category: 'Pizza',
    available: true,
  },
];
