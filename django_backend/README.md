# ShopNest Retail Enterprise - Python Django REST Backend

This directory houses the robust, enterprise-grade Python Django backend for the ShopNest React Native system. It features a complete database architecture mapping directly to the high-fidelity inventory, point-of-sale (POS), vendor procurement (PO), and staff management specifications of the React Native client.

---

## 🏗️ Architectural Overview

The backend uses a clean Model-Serializer-ViewSet architecture powered by **Django REST Framework (DRF)**. It is ready to run on any relational SQL engine (configured out-of-the-box for **SQLite** during development, and pre-wired with standard environmental hooks for production cloud databases like **PostgreSQL / Google Cloud SQL**).

### Data Schema Mapping

All models are mapped seamlessly to the React Native typescript entities (`src/types.ts`):

| Conceptual Entity | Django Relational Model (`retail_api/models.py`) | Rest API Endpoint |
| :--- | :--- | :--- |
| **Stores** | `Store` | `/api/stores/` |
| **Categories** | `Category` | `/api/categories/` |
| **Products** | `Product` (ForeignKey to Supplier) | `/api/products/` |
| **Suppliers** | `Supplier` | `/api/suppliers/` |
| **Purchase Orders** | `PurchaseOrder` | `/api/purchase-orders/` |
| **Transactions/POS** | `SalesTransaction` + `TransactionItem` | `/api/transactions/` |
| **Customers** | `Customer` | `/api/customers/` |
| **Employees** | `Employee` | `/api/employees/` |
| **System Alarms** | `SystemNotification` | `/api/notifications/` |

---

## 🚀 Quick Start Setup

### 1. Install System Dependencies
Ensure you have Python 3.9+ installed, then establish a virtual environment and load the required dependencies:

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install required backend libraries
pip install django djangorestframework django-cors-headers dj-database-url
```

### 2. Generate Schema & Database Migrations
Create and execute migrations on your SQLite database (or connect to a production SQL instance by supplying the `DATABASE_URL` environment flag):

```bash
# Create local migrations for our retail_api models
python manage.py makemigrations retail_api

# Run standard structural database migrations 
python manage.py migrate
```

### 3. Seed High-Fidelity Mock Records
A custom Django administrative command is pre-packaged to load consistent initial records (e.g., Downtown Flagship Hub, Marcus Sterling profiles, decaying lots, coffee bags) to match your active React Native screens:

```bash
# Seed records and handshake configurations
python manage.py seed_shopnest
```

### 4. Direct Server Deployment
Fire up the server locally. It is pre-configured with **CORS headers** enabling React Native for iOS, Android, or React Native Web to query it without restriction:

```bash
python manage.py runserver 0.0.0.0:8000
```
Your RESTful endpoints are now live at `http://localhost:8000/api/`.

---

## 🔗 Connecting the React Native Frontend

An API-aware services layer is pre-coded on the React Native side inside `src/services/api.ts`. 

To connect the React Native app to your live Django backend, simply configure the base URL inside your environment variables:
```env
# .env file
VITE_BACKEND_PROVIDER=django
VITE_DJANGO_API_URL=http://localhost:8000/api/
```
Once established, the React Native client will read/write inventory state, publish sales transactions from the registers, and claim loyalty points straight from the Django sqlite/postgres database.
