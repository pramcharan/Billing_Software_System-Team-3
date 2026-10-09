# TEAM 3 — API DOCUMENTATION

## Billing Software System — MERN Stack

**Module:** Customer, Supplier & Purchase Management
**Team:** Team 3
**Member:** Member 4
**Responsibilities:** API Integration, Testing & Documentation
**API Testing Tool:** Postman
**Backend:** Node.js + Express.js
**Database:** MongoDB
**Frontend:** React.js

---

# 1. Introduction

This document contains the API documentation and testing details for Team 3 of the Billing Software System.

The Team 3 module is responsible for:

* Customer Management
* Supplier Management
* Purchase Management
* Customer Purchase History
* Purchase History and Filtering
* Purchase-to-Inventory Integration
* API Validation and Error Handling

The APIs are developed using the MERN stack and are tested using Postman.

---

# 2. Base URL

For local development:

```text
http://localhost:5000
```

All API endpoints are accessed using this base URL.

Example:

```text
http://localhost:5000/api/customers
```

---

# 3. API Modules

The APIs are divided into the following modules:

1. Health Check
2. Customer Management
3. Supplier Management
4. Purchase Management
5. Customer Purchase History
6. Purchase Filtering

---

# 4. API Summary

| #  | Method | Endpoint                     | Description                          |
| -- | ------ | ---------------------------- | ------------------------------------ |
| 1  | GET    | `/api/health`                | Check whether the backend is running |
| 2  | POST   | `/api/customers`             | Create a customer                    |
| 3  | GET    | `/api/customers`             | Get all customers                    |
| 4  | GET    | `/api/customers/:id`         | Get customer by ID                   |
| 5  | PUT    | `/api/customers/:id`         | Update customer                      |
| 6  | DELETE | `/api/customers/:id`         | Delete/deactivate customer           |
| 7  | GET    | `/api/customers/:id/history` | Get customer purchase history        |
| 8  | POST   | `/api/suppliers`             | Create a supplier                    |
| 9  | GET    | `/api/suppliers`             | Get all suppliers                    |
| 10 | GET    | `/api/suppliers/:id`         | Get supplier by ID                   |
| 11 | PUT    | `/api/suppliers/:id`         | Update supplier                      |
| 12 | DELETE | `/api/suppliers/:id`         | Delete/deactivate supplier           |
| 13 | POST   | `/api/purchases`             | Create a purchase                    |
| 14 | GET    | `/api/purchases`             | Get all purchases                    |
| 15 | GET    | `/api/purchases/:id`         | Get purchase by ID                   |

---

# 5. Postman Collection Structure

Create the following collection in Postman:

```text
Team 3 - Billing Software API
│
├── 01 Health
│   └── GET Health
│
├── 02 Customers
│   ├── POST Create Customer
│   ├── GET All Customers
│   ├── GET Customer By ID
│   ├── PUT Update Customer
│   ├── DELETE Customer
│   └── GET Customer Purchase History
│
├── 03 Suppliers
│   ├── POST Create Supplier
│   ├── GET All Suppliers
│   ├── GET Supplier By ID
│   ├── PUT Update Supplier
│   └── DELETE Supplier
│
└── 04 Purchases
    ├── POST Create Purchase
    ├── GET All Purchases
    └── GET Purchase By ID
```

---

# 6. Health Check API

## GET Health

### Endpoint

```text
GET /api/health
```

### Full URL

```text
http://localhost:5000/api/health
```

### Purpose

Checks whether the Team 3 backend server is running correctly.

### Request Body

No request body is required.

### Expected Status

```text
200 OK
```

### Expected Response

```json
{
  "success": true,
  "message": "Team 3 Backend is running"
}
```

### Test Result

* [ ] Passed

---

# 7. Customer Management APIs

## 7.1 Create Customer

### Method

```text
POST
```

### Endpoint

```text
/api/customers
```

### Full URL

```text
http://localhost:5000/api/customers
```

### Purpose

Creates a new customer.

### Headers

```text
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Test Customer",
  "phone": "9876543210",
  "email": "testcustomer@gmail.com",
  "address": "Tirupati",
  "gstNumber": "GST123456"
}
```

### Expected Status

```text
201 Created
```

### Expected Response

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {}
}
```

The created customer ID should be saved for testing the other customer APIs.

### Test Result

* [ ] Passed

---

# 7.2 Get All Customers

### Method

```text
GET
```

### Endpoint

```text
/api/customers
```

### Full URL

```text
http://localhost:5000/api/customers
```

### Purpose

Retrieves all customers.

### Request Body

No body required.

### Expected Status

```text
200 OK
```

### Expected Response

```json
{
  "success": true,
  "data": []
}
```

### Test Result

* [ ] Passed

---

# 7.3 Get Customer By ID

### Method

```text
GET
```

### Endpoint

```text
/api/customers/:id
```

### Example

```text
http://localhost:5000/api/customers/CUSTOMER_ID
```

Replace `CUSTOMER_ID` with the actual MongoDB customer ID.

### Purpose

Retrieves a single customer using the customer ID.

### Request Body

No body required.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 7.4 Update Customer

### Method

```text
PUT
```

### Endpoint

```text
/api/customers/:id
```

### Example

```text
http://localhost:5000/api/customers/CUSTOMER_ID
```

### Request Body

```json
{
  "name": "Updated Customer",
  "phone": "9876543211",
  "email": "updated@gmail.com",
  "address": "Nellore",
  "gstNumber": "GST987654"
}
```

### Expected Status

```text
200 OK
```

### Purpose

Updates the details of an existing customer.

### Test Result

* [ ] Passed

---

# 7.5 Delete Customer

### Method

```text
DELETE
```

### Endpoint

```text
/api/customers/:id
```

### Example

```text
http://localhost:5000/api/customers/CUSTOMER_ID
```

### Purpose

Deletes or deactivates a customer.

### Expected Status

```text
200 OK
```

### Important

Perform this test after completing the customer purchase-history testing.

### Test Result

* [ ] Passed

---

# 7.6 Get Customer Purchase History

### Method

```text
GET
```

### Endpoint

```text
/api/customers/:id/history
```

### Example

```text
http://localhost:5000/api/customers/CUSTOMER_ID/history
```

### Purpose

Retrieves the purchase history of a particular customer.

### Request Body

No body required.

### Expected Status

```text
200 OK
```

### Expected Response Structure

```json
{
  "success": true,
  "customer": {},
  "count": 0,
  "totalAmount": 0,
  "data": []
}
```

### Test Result

* [ ] Passed

---

# 8. Supplier Management APIs

## 8.1 Create Supplier

### Method

```text
POST
```

### Endpoint

```text
/api/suppliers
```

### Full URL

```text
http://localhost:5000/api/suppliers
```

### Headers

```text
Content-Type: application/json
```

### Request Body

```json
{
  "companyName": "ABC Suppliers",
  "contactPerson": "Ravi Kumar",
  "phone": "9876543210",
  "email": "abc@gmail.com",
  "address": "Chennai",
  "gstNumber": "GST123456"
}
```

### Expected Status

```text
201 Created
```

### Purpose

Creates a new supplier.

### Test Result

* [ ] Passed

---

# 8.2 Get All Suppliers

### Method

```text
GET
```

### Endpoint

```text
/api/suppliers
```

### Full URL

```text
http://localhost:5000/api/suppliers
```

### Purpose

Retrieves all suppliers.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 8.3 Get Supplier By ID

### Method

```text
GET
```

### Endpoint

```text
/api/suppliers/:id
```

### Example

```text
http://localhost:5000/api/suppliers/SUPPLIER_ID
```

### Purpose

Retrieves a specific supplier using the supplier ID.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 8.4 Update Supplier

### Method

```text
PUT
```

### Endpoint

```text
/api/suppliers/:id
```

### Example

```text
http://localhost:5000/api/suppliers/SUPPLIER_ID
```

### Request Body

```json
{
  "companyName": "Updated ABC Suppliers",
  "contactPerson": "Ravi Kumar",
  "phone": "9999999999",
  "email": "updatedabc@gmail.com",
  "address": "Bangalore",
  "gstNumber": "GST999999"
}
```

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 8.5 Delete Supplier

### Method

```text
DELETE
```

### Endpoint

```text
/api/suppliers/:id
```

### Example

```text
http://localhost:5000/api/suppliers/SUPPLIER_ID
```

### Purpose

Deletes or deactivates a supplier.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 9. Purchase Management APIs

## 9.1 Create Purchase

### Method

```text
POST
```

### Endpoint

```text
/api/purchases
```

### Full URL

```text
http://localhost:5000/api/purchases
```

### Headers

```text
Content-Type: application/json
```

### Request Body

```json
{
  "purchaseId": "PUR-TEST-001",
  "supplierId": "SUPPLIER_ID",
  "customerId": "CUSTOMER_ID",
  "purchaseDate": "2026-10-08",
  "items": [
    {
      "productId": "PRODUCT_ID",
      "quantity": 5,
      "purchasePrice": 100,
      "tax": 18
    }
  ],
  "subtotal": 500,
  "discount": 20,
  "tax": 90,
  "totalAmount": 570,
  "paymentStatus": "paid"
}
```

### Important

Replace:

```text
SUPPLIER_ID
CUSTOMER_ID
PRODUCT_ID
```

with actual IDs from the database.

The product must already exist because the purchase workflow depends on product information from the inventory/product module.

### Valid Payment Status Values

```text
paid
pending
partial
unpaid
```

### Expected Status

```text
201 Created
```

### Purpose

Creates a purchase and integrates the purchase with inventory.

### Integration Check

After creating a completed purchase, verify whether the related product stock has been updated.

### Test Result

* [ ] Purchase created
* [ ] Correct total calculated
* [ ] Inventory updated
* [ ] Passed
* [ ] Failed

---

# 9.2 Get All Purchases

### Method

```text
GET
```

### Endpoint

```text
/api/purchases
```

### Full URL

```text
http://localhost:5000/api/purchases
```

### Purpose

Retrieves all purchases.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 9.3 Get Purchase By ID

### Method

```text
GET
```

### Endpoint

```text
/api/purchases/:id
```

### Example

```text
http://localhost:5000/api/purchases/PURCHASE_ID
```

### Purpose

Retrieves a specific purchase using its ID.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 10. Purchase Filtering

## 10.1 Filter Purchases By Supplier

### Method

```text
GET
```

### URL

```text
http://localhost:5000/api/purchases?supplier=SUPPLIER_ID
```

### Purpose

Retrieves purchases associated with a particular supplier.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 10.2 Filter Purchases By Date

### Method

```text
GET
```

### URL

```text
http://localhost:5000/api/purchases?from=2026-10-01&to=2026-10-08
```

### Purpose

Retrieves purchases within the specified date range.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 10.3 Filter By Date and Supplier

### Method

```text
GET
```

### URL

```text
http://localhost:5000/api/purchases?from=2026-10-01&to=2026-10-08&supplier=SUPPLIER_ID
```

### Purpose

Retrieves purchases using both date range and supplier filters.

### Expected Status

```text
200 OK
```

### Test Result

* [ ] Passed

---

# 11. Negative API Testing

Negative testing is performed to verify that the APIs correctly handle invalid input and invalid requests.

## 11.1 Invalid Customer

### Request

```text
POST /api/customers
```

### Body

```json
{
  "name": "",
  "phone": "9876543210",
  "email": "test@gmail.com"
}
```

### Expected

```text
400 Bad Request
```

---

## 11.2 Invalid Customer ID

### Request

```text
GET /api/customers/123
```

### Expected

```text
400 Bad Request
```

---

## 11.3 Customer Not Found

Use a valid MongoDB ObjectId that does not exist.

```text
GET /api/customers/507f1f77bcf86cd799439011
```

### Expected

```text
404 Not Found
```

---

## 11.4 Invalid Supplier ID

```text
GET /api/suppliers/123
```

### Expected

```text
400 Bad Request
```

---

## 11.5 Supplier Not Found

Use a valid MongoDB ObjectId that does not exist.

### Expected

```text
404 Not Found
```

---

## 11.6 Invalid Purchase Quantity

Example:

```json
{
  "quantity": 0
}
```

### Expected

```text
400 Bad Request
```

---

## 11.7 Negative Purchase Price

Example:

```json
{
  "purchasePrice": -100
}
```

### Expected

```text
400 Bad Request
```

---

## 11.8 Invalid Payment Status

Example:

```json
{
  "paymentStatus": "completed"
}
```

### Expected

```text
400 Bad Request
```

Valid values are:

```text
paid
pending
partial
unpaid
```

---

## 11.9 Invalid Product

Use a product ID that does not exist.

### Expected

```text
404 Not Found
```

The purchase should not be created when the referenced product is invalid.

---

# 12. API Validation Checklist

The following validations should be tested:

| Validation                 | Expected Result |
| -------------------------- | --------------- |
| Missing customer name      | 400 Bad Request |
| Invalid customer ID        | 400 Bad Request |
| Customer not found         | 404 Not Found   |
| Invalid supplier ID        | 400 Bad Request |
| Supplier not found         | 404 Not Found   |
| Missing purchase ID        | 400 Bad Request |
| Invalid supplier reference | 400/404         |
| Invalid product reference  | 404             |
| Quantity = 0               | 400 Bad Request |
| Negative quantity          | 400 Bad Request |
| Negative purchase price    | 400 Bad Request |
| Invalid payment status     | 400 Bad Request |
| Invalid purchase ID        | 400 Bad Request |
| Purchase not found         | 404 Not Found   |

---

# 13. Postman Test Cases

The following test cases should be executed in Postman.

## Customer Tests

| Test Case            | Method | Expected Status | Result |
| -------------------- | ------ | --------------: | ------ |
| Create customer      | POST   |             201 | [ ]    |
| Get all customers    | GET    |             200 | [ ]    |
| Get customer by ID   | GET    |             200 | [ ]    |
| Update customer      | PUT    |             200 | [ ]    |
| Get customer history | GET    |             200 | [ ]    |
| Delete customer      | DELETE |             200 | [ ]    |
| Invalid customer     | POST   |             400 | [ ]    |
| Invalid customer ID  | GET    |             400 | [ ]    |
| Customer not found   | GET    |             404 | [ ]    |

## Supplier Tests

| Test Case           | Method | Expected Status | Result |
| ------------------- | ------ | --------------: | ------ |
| Create supplier     | POST   |             201 | [ ]    |
| Get all suppliers   | GET    |             200 | [ ]    |
| Get supplier by ID  | GET    |             200 | [ ]    |
| Update supplier     | PUT    |             200 | [ ]    |
| Delete supplier     | DELETE |             200 | [ ]    |
| Invalid supplier ID | GET    |             400 | [ ]    |
| Supplier not found  | GET    |             404 | [ ]    |

## Purchase Tests

| Test Case                   | Method | Expected Status | Result |
| --------------------------- | ------ | --------------: | ------ |
| Create purchase             | POST   |             201 | [ ]    |
| Get all purchases           | GET    |             200 | [ ]    |
| Get purchase by ID          | GET    |             200 | [ ]    |
| Filter by supplier          | GET    |             200 | [ ]    |
| Filter by date              | GET    |             200 | [ ]    |
| Filter by date and supplier | GET    |             200 | [ ]    |
| Invalid purchase            | POST   |             400 | [ ]    |
| Invalid quantity            | POST   |             400 | [ ]    |
| Invalid price               | POST   |             400 | [ ]    |
| Invalid product             | POST   |             404 | [ ]    |
| Invalid purchase ID         | GET    |             400 | [ ]    |
| Purchase not found          | GET    |             404 | [ ]    |

---

# 14. API Integration Testing

The main integration workflow is:

```text
Customer
   ↓
Customer ID
   ↓
Purchase
   ↓
Supplier + Product
   ↓
Purchase Creation
   ↓
Purchase Total
   ↓
Inventory Update
   ↓
Customer Purchase History
```

The purchase workflow should verify that:

1. A valid supplier can be selected.
2. A valid product can be selected.
3. A valid quantity is entered.
4. A valid purchase price is entered.
5. Tax and discount are processed.
6. Purchase total is calculated.
7. Purchase is successfully created.
8. Product stock is updated after a completed purchase.
9. Customer purchase history can be retrieved.

---

# 15. Postman Environment Variables

The following variables can be created in Postman:

```text
baseUrl
customerId
supplierId
productId
purchaseId
```

Example:

```text
baseUrl = http://localhost:5000
```

Then requests can use:

```text
{{baseUrl}}/api/customers
```

Instead of:

```text
http://localhost:5000/api/customers
```

After creating a customer, save its ID as:

```text
customerId
```

After creating a supplier, save its ID as:

```text
supplierId
```

After creating a purchase, save its ID as:

```text
purchaseId
```

---

# 16. Recommended Testing Order

The APIs should be tested in this order:

```text
1. Start Backend
       ↓
2. Test Health API
       ↓
3. Create Customer
       ↓
4. Get Customer
       ↓
5. Update Customer
       ↓
6. Create Supplier
       ↓
7. Get Supplier
       ↓
8. Update Supplier
       ↓
9. Get Product ID
       ↓
10. Create Purchase
       ↓
11. Verify Purchase
       ↓
12. Verify Inventory Update
       ↓
13. Verify Customer Purchase History
       ↓
14. Test Purchase Filters
       ↓
15. Perform Negative Tests
       ↓
16. Complete Postman Collection
       ↓
17. Generate API Documentation
```

---

# 17. API Documentation Completion Checklist

## Backend

* [ ] Backend starts successfully
* [ ] Health API works
* [ ] Customer APIs tested
* [ ] Supplier APIs tested
* [ ] Purchase APIs tested
* [ ] Customer history tested
* [ ] Purchase filtering tested
* [ ] Inventory integration tested

## Postman

* [ ] Collection created
* [ ] All requests added
* [ ] Request bodies added
* [ ] IDs tested correctly
* [ ] Positive tests completed
* [ ] Negative tests completed
* [ ] Response status codes verified
* [ ] Error responses verified

## Documentation

* [ ] API endpoints documented
* [ ] Methods documented
* [ ] Request bodies documented
* [ ] Expected responses documented
* [ ] Validation rules documented
* [ ] Error cases documented
* [ ] Integration workflow documented
* [ ] Test results updated

---

# 18. Final Deliverables — Member 4

The final Member 4 deliverables are:

```text
API Documentation
Postman Collection
Postman Test Results
API Integration Testing
Validation Testing
Purchase-to-Inventory Integration Testing
Customer Purchase History Testing
```

The API documentation and Postman collection should be maintained along with the Team 3 project and reviewed before merging into the main branch.

---

# 19. Conclusion

Team 3 provides the Customer, Supplier and Purchase Management APIs for the Billing Software System.

The APIs are tested using Postman to verify:

* Correct API functionality
* Request and response handling
* Validation
* Error handling
* Customer management
* Supplier management
* Purchase management
* Purchase history
* Purchase filtering
* Purchase-to-inventory integration

All successful and failed test cases should be recorded in the Postman collection and this documentation.

**Prepared by:** Member 4
**Role:** Frontend/API Integration + Testing + Documentation
**Project:** Billing Software System — Team 3