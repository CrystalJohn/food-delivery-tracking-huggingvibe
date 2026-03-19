# Food Delivery - Frontend

A food delivery web application built with **Next.js 16**, **React 19**, **TypeScript**, and **Sass**.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Directory Structure

```
frontend/src/
├── app/                          # Next.js App Router (Pages)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── page.module.scss          # Landing page styles
│   ├── globals.scss              # Global styles
│   ├── providers.tsx             # Context providers wrapper
│   ├── favicon.ico               # Favicon
│   ├── login/                    # Login route
│   │   └── page.tsx
│   ├── (customer)/               # Customer route group
│   │   ├── page.tsx              # Customer dashboard
│   │   ├── menu/page.tsx         # Browse menu
│   │   ├── cart/page.tsx         # Shopping cart
│   │   └── orders/               # Order management
│   │       ├── page.tsx          # Order list
│   │       └── [id]/page.tsx     # Order detail
│   ├── (staff)/                  # Staff route group
│   │   └── tickets/page.tsx      # Kitchen ticket queue
│   ├── (driver)/                 # Driver route group
│   │   └── jobs/                 # Delivery jobs
│   │       ├── page.tsx          # Job list
│   │       └── [orderId]/page.tsx # Job detail
│   └── (admin)/                  # Admin route group
│       ├── dashboard/page.tsx    # Admin dashboard
│       └── drivers/page.tsx      # Driver management
│
├── components/                   # Shared React components
│   ├── ui/                       # UI primitives
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   ├── layout/                   # Layout components
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   ├── PageContainer.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── shared/                   # Shared/common components
│       └── PageHeader.tsx
│
├── features/                     # Feature-Based Architecture
│   ├── auth/                     # Authentication & Authorization
│   │   ├── AuthContext.tsx       # Auth context provider
│   │   ├── auth.service.ts       # Auth API calls
│   │   ├── auth.storage.ts       # localStorage helpers
│   │   ├── useAuth.ts            # Auth hook
│   │   ├── LoginForm.tsx         # Login UI
│   │   └── index.ts
│   ├── cart/                     # Shopping Cart
│   │   ├── CartContext.tsx       # Cart context provider
│   │   ├── CartList.tsx          # Cart items UI
│   │   ├── CartSummary.tsx       # Cart summary UI
│   │   └── index.ts
│   ├── menu/                     # Menu & MenuItem
│   │   ├── menu.service.ts       # Menu API calls
│   │   ├── useMenu.ts            # Menu hook
│   │   ├── MenuItemCard.tsx      # Menu item card UI
│   │   ├── MenuList.tsx          # Menu list UI
│   │   └── index.ts
│   ├── orders/                   # Order Management (Customer)
│   │   ├── order.service.ts      # Order API calls
│   │   ├── useOrders.ts          # Orders hook
│   │   ├── OrderDetail.tsx       # Order detail UI
│   │   ├── OrderList.tsx         # Order list UI
│   │   ├── OrderStatusBadge.tsx  # Order status badge
│   │   └── index.ts
│   ├── staff/                    # Kitchen Staff (Ticket Queue)
│   │   ├── staff.service.ts      # Staff API calls
│   │   ├── ticket.service.ts     # Ticket API calls
│   │   ├── useStaffQueue.ts      # Staff queue hook
│   │   ├── useTickets.ts         # Tickets hook
│   │   ├── TicketCard.tsx        # Ticket card UI
│   │   ├── TicketQueue.tsx       # Ticket queue UI
│   │   └── index.ts
│   ├── driver/                   # Driver (Delivery Jobs)
│   │   ├── driver.service.ts     # Driver API calls
│   │   ├── job.service.ts        # Job API calls
│   │   ├── useDriverJobs.ts      # Driver jobs hook
│   │   ├── useJobs.ts            # Jobs hook
│   │   ├── JobCard.tsx           # Job card UI
│   │   ├── JobList.tsx           # Job list UI
│   │   └── index.ts
│   ├── tracking/                 # Real-time Order Tracking
│   │   ├── tracking.service.ts   # Tracking API calls
│   │   ├── useTracking.ts        # Tracking hook
│   │   ├── TrackingMap.tsx       # Map UI
│   │   ├── DriverMarker.tsx      # Driver marker UI
│   │   └── index.ts
│   └── admin/                    # Admin Dashboard
│       ├── admin.service.ts      # Admin API calls
│       ├── useAdminStats.ts      # Admin stats hook
│       ├── DriverTable.tsx       # Driver table UI
│       ├── StatsCards.tsx        # Stats cards UI
│       └── index.ts
│
├── lib/                          # API Infrastructure & Utilities
│   ├── api.ts                    # Base HTTP client (fetch wrapper)
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Utility functions
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Main exports
│   ├── user.ts                   # User types
│   ├── menu.ts                   # Menu types
│   ├── order.ts                  # Order types
│   ├── ticket.ts                 # Ticket types
│   └── delivery.ts               # Delivery types
│
└── styles/                       # Global styles
    └── globals.scss
```

## 🧩 Architecture Pattern: Feature-Based

Each feature is self-contained with its own:
- **Service** - API calls
- **Hooks** - Business logic & state
- **Context** - Global state (if needed)
- **Components** - UI components

### Data Flow

```
Page (app/) 
    ↓ imports
Feature Component (features/{feature}/)
    ↓ uses
Custom Hook (features/{feature}/use{Feature}.ts)
    ↓ calls
Service (features/{feature}/{feature}.service.ts)
    ↓ calls
HTTP Client (lib/api.ts)
    ↓ calls
Backend API
```

### Example: Auth Flow

```
LoginForm.tsx (features/auth/LoginForm.tsx)
    ↓ calls
useAuth() hook (features/auth/useAuth.ts)
    ↓ calls
AuthContext (features/auth/AuthContext.tsx)
    ↓ calls
authService.login() (features/auth/auth.service.ts)
    ↓ calls
api.post() (lib/api.ts)
    ↓ calls
POST /auth/login
```

## 📐 Simple Rules

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Page** | Routing & Layout | `app/(customer)/menu/page.tsx` |
| **Component** | UI Rendering | `MenuList.tsx`, `OrderCard.tsx` |
| **Hook** | Business Logic & State | `useOrders.ts`, `useOrder(id)` |
| **Context** | Global State | `AuthContext.tsx`, `CartContext.tsx` |
| **Service** | API Communication | `order.service.ts` |
| **API Client** | HTTP Request | `lib/api.ts` |
| **Types** | Define data shapes | `interface Order { ... }` |

## 🔐 User Login Flow

1. User submits login form
2. Call `authService.login(email, password)`
3. Store token in localStorage (`auth.storage.ts`)
4. Update `AuthContext` with user info
5. Redirect based on user role:
   - `CUSTOMER` → /menu
   - `STAFF`    → /staff/tickets
   - `DRIVER`   → /driver/jobs
   - `ADMIN`    → /admin/dashboard

## 🌐 API Infrastructure

### Base HTTP Client (`lib/api.ts`)

```typescript
// Generic HTTP client with JWT auto-attach
export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

### Auth Storage (`features/auth/auth.storage.ts`)

```typescript
// JWT token management
export const authStorage = {
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  getToken: () => localStorage.getItem('auth_token'),
  removeToken: () => localStorage.removeItem('auth_token'),
  hasToken: () => !!localStorage.getItem('auth_token'),
};
```

### Feature Services

Each feature has its own service file for API communication:

```typescript
// features/auth/auth.service.ts
import { api } from '@/lib/api';

export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<LoginResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
};
```

```typescript
// features/menu/menu.service.ts
import { api } from '@/lib/api';

export const menuService = {
  getMenuItems: () => api.get<MenuItem[]>('/menu'),
  getMenuItem: (id: string) => api.get<MenuItem>(`/menu/${id}`),
};
```

```typescript
// features/orders/order.service.ts
import { api } from '@/lib/api';

export const orderService = {
  createOrder: (data: CreateOrderRequest) => api.post<Order>('/orders', data),
  getMyOrders: () => api.get<Order[]>('/orders/my'),
  getOrderById: (id: string) => api.get<Order>(`/orders/${id}`),
};
```

## 🎯 Key Features

### Route Groups

- `(customer)` - Customer pages (menu, cart, orders)
- `(staff)` - Staff pages (kitchen ticket queue)
- `(driver)` - Driver pages (delivery jobs)
- `(admin)` - Admin pages (dashboard, driver management)

### Route Protection

- Middleware checks JWT validity
- Redirect to `/login` if not authenticated
- Redirect to appropriate page if wrong role

### State Management

- **AuthContext** - Global auth state (user, isAuthenticated, login, logout)
- **CartContext** - Cart state (items, addItem, removeItem, clearCart)
- **Custom Hooks** - Feature-specific state (useOrders, useMenu, etc.)

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Sass** - CSS preprocessing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO** - Real-time communication (planned)
