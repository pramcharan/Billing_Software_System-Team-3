# Billing Software System — Team 3

## Customers, Suppliers & Purchases

Team 3 is responsible for the **Customer, Supplier & Purchase Management** module of the Billing Software System.

This module is part of the common Billing Software System and is not a separate application.

---

## Team 3 Objective

Build the customer and supplier master data modules and the purchase workflow that adds purchased quantities to inventory.

---

## Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Architecture:** MERN Stack
- **Authentication:** JWT where applicable
- **API Testing:** Postman
- **Version Control:** Git & GitHub

---

# Team 3 Modules

## 1. Customer Management

### Features

- Add customer
- View customer
- Edit customer
- Delete / deactivate customer
- Search customer
- View customer purchase history

### Customer Fields

- Name
- Phone
- Email
- Address
- GST Number (Optional)

---

## 2. Supplier Management

### Features

- Add supplier
- View supplier
- Edit supplier
- Delete / deactivate supplier
- Search supplier

### Supplier Fields

- Company Name
- Contact Person
- Phone
- Email
- Address
- GST Number

---

## 3. Purchase Management

### Features

- Create purchase
- Select supplier
- Select products
- Enter quantities
- Enter purchase prices
- Apply tax
- Apply discount
- Calculate total
- Set payment status
- View purchase details
- View purchase history
- Filter purchases by supplier
- Filter purchases by date

---

## 4. Inventory Integration

Completed purchases must increase product stock.

Purchase items must reference valid products.

The system must:

- Increase inventory when a purchase is completed
- Validate product references
- Validate quantities
- Prevent invalid products or quantities

Team 3 uses the products and inventory functionality provided by Team 2.

---

# API Endpoints

## Customer APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | Get customers |
| POST | `/api/customers` | Create customer |
| GET | `/api/customers/:id` | Get customer by ID |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete / deactivate customer |
| GET | `/api/customers/:id/history` | Get customer purchase history |

## Supplier APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/suppliers` | Get suppliers |
| POST | `/api/suppliers` | Create supplier |
| GET | `/api/suppliers/:id` | Get supplier by ID |
| PUT | `/api/suppliers/:id` | Update supplier |
| DELETE | `/api/suppliers/:id` | Delete / deactivate supplier |

## Purchase APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/purchases` | Get purchases |
| POST | `/api/purchases` | Create purchase |
| GET | `/api/purchases/:id` | Get purchase by ID |
| GET | `/api/purchases?from=&to=&supplier=` | Filter purchases |

---

# MongoDB Collections

Team 3 mainly owns / uses:

- `customers`
- `suppliers`
- `purchases`
- `purchase_items` or embedded purchase items

Database naming, fields, IDs, references, required fields and data types must remain consistent with the other teams.

---

# Purchase Calculation

Purchase creation should support:

- Purchase subtotal
- Discount
- Tax
- Total amount
- Payment status

The purchase workflow must calculate the purchase total correctly.

---

# Validation & Error Handling

The module must validate:

- Required supplier/customer fields
- Valid quantities
- Valid purchase prices
- Valid supplier references
- Valid product references
- Invalid or missing data

The API should return meaningful error messages.

---

# Team Responsibilities

| Member | Responsibility |
|---|---|
| Member 1 | Team Lead + Backend/API |
| Member 2 | Backend + MongoDB |
| Member 3 | React Frontend |
| Member 4 | Frontend/API Integration + Testing + Documentation |

### Member 1 — Team Lead + Backend/API

- Team coordination
- Backend APIs
- Business logic

### Member 2 — Backend + MongoDB

- MongoDB schemas
- Database operations

### Member 3 — React Frontend

- React pages
- Forms
- Tables
- UI

### Member 4 — Frontend/API Integration + Testing

- API integration
- UI testing
- Postman testing
- Documentation

---

# Team Development Tasks

1. Design customer, supplier and purchase schemas
2. Create customer CRUD APIs
3. Create supplier CRUD APIs
4. Create purchase creation and viewing APIs
5. Calculate purchase subtotal, discount, tax and total
6. Integrate completed purchases with Team 2 inventory logic
7. Create customer and supplier React screens
8. Create purchase form and purchase history screens
9. Test purchase-to-inventory workflow
10. Document APIs and integration requirements

---

# Team Dependencies

### Team 2 — Products, Categories & Inventory

Team 3 uses products/categories and inventory functionality from Team 2.

When a purchase is completed, the purchased quantity must update inventory.

### Team 5 — Payments, Expenses, Dashboard & Reports

Team 5 uses purchase data for reports.

---
