from django.core.management.base import BaseCommand
from retail_api.models import (
    Company,
    Store,
    Category,
    Supplier,
    Product,
    PurchaseOrder,
    SalesTransaction,
    TransactionItem,
    Customer,
    Employee,
    SystemNotification,
)


class Command(BaseCommand):
    help = "Seeds the ShopNest database with realistic high-fidelity retail records"

    def handle(self, *args, **options):
        self.stdout.write("Purging existing data...")
        TransactionItem.objects.all().delete()
        SalesTransaction.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        Product.objects.all().delete()
        Supplier.objects.all().delete()
        Category.objects.all().delete()
        Store.objects.all().delete()
        Company.objects.all().delete()
        Customer.objects.all().delete()
        Employee.objects.all().delete()
        SystemNotification.objects.all().delete()

        self.stdout.write("Seeding core corporate details...")
        company = Company.objects.create(
            id="CMP-4820",
            name="ShopNest Retail Corporation",
            registration_number="US-CO-994827-Z",
            owner_name="Marcus Sterling Sr.",
            address="940 Enterprise Blvd, Suite 240, New York, NY 10001",
            phone="+1 (800) 555-0199",
            tax_number="TX-482-990-11",
        )

        self.stdout.write("Seeding store locations...")
        stores_data = [
            {
                "id": "STR-001",
                "name": "Downtown Flagship Hub",
                "code": "STR-NYC-001",
                "address": "50 Fifth Avenue, Flatiron, New York, NY 10010",
                "phone": "+1 (212) 555-0145",
                "manager_id": "U-003",
                "manager_name": "Jameson Chen",
                "daily_sales": 12450.00,
                "sales_growth": 8.4,
                "inventory_count": 4280,
                "inventory_capacity_pct": 82,
                "status": "Online",
            },
            {
                "id": "STR-002",
                "name": "Westside Urban Store",
                "code": "STR-LAX-002",
                "address": "9421 Wilshire Blvd, Beverly Hills, Los Angeles, CA 90212",
                "phone": "+1 (310) 555-0211",
                "manager_id": "U-002",
                "manager_name": "Elena Rodriguez",
                "daily_sales": 8210.00,
                "sales_growth": -1.2,
                "inventory_count": 1150,
                "inventory_capacity_pct": 45,
                "status": "Online",
            },
            {
                "id": "STR-003",
                "name": "Lakeside Plaza Center",
                "code": "STR-CHI-003",
                "address": "320 Michigan Ave, River North, Chicago, IL 60611",
                "phone": "+1 (312) 555-0399",
                "manager_id": "E-005",
                "manager_name": "David Vance",
                "daily_sales": 6940.00,
                "sales_growth": 14.7,
                "inventory_count": 5120,
                "inventory_capacity_pct": 94,
                "status": "Online",
            },
        ]
        for store_info in stores_data:
            Store.objects.create(**store_info)

        self.stdout.write("Seeding product categories...")
        categories_data = [
            {"id": "CAT-001", "name": "Premium Electronics", "parent_category": "Consumer Tech", "total_products": 342, "revenue_generated": 189020.00},
            {"id": "CAT-002", "name": "Artisanal Beverages", "parent_category": "Gourmet Food", "total_products": 120, "revenue_generated": 42950.00},
            {"id": "CAT-003", "name": "Athletic Wear", "parent_category": "Apparel", "total_products": 215, "revenue_generated": 84320.00},
            {"id": "CAT-004", "name": "Organic Dry Goods", "parent_category": "Gourmet Food", "total_products": 480, "revenue_generated": 32410.00},
            {"id": "CAT-005", "name": "Home Accessories", "parent_category": "Living & Decor", "total_products": 127, "revenue_generated": 15300.00},
        ]
        for cat_info in categories_data:
            Category.objects.create(**cat_info)

        self.stdout.write("Seeding material vendor suppliers...")
        suppliers_data = [
            {"id": "SPL-001", "name": "Global Bean Importers Co.", "phone": "+1 (800) 555-6611", "email": "orders@globalbeans.com", "address": "Seattle, WA, USA", "license_number": "LIC-BEANS-48A", "outstanding_balance": 12450.00, "fulfillment_rate_pct": 98.4, "status": "Preferred"},
            {"id": "SPL-002", "name": "Studio Sonic Tech LLC", "phone": "+1 (888) 555-9022", "email": "b2b@studiosonic.io", "address": "San Jose, CA, USA", "license_number": "LIC-TECH-993K", "outstanding_balance": 4280.00, "fulfillment_rate_pct": 94.2, "status": "Preferred"},
            {"id": "SPL-003", "name": "Vanguard Athletics Ltd.", "phone": "+1 (800) 555-3211", "email": "sales@vanguardathletic.com", "address": "Portland, OR, USA", "license_number": "LIC-VAN-115D", "outstanding_balance": 0.00, "fulfillment_rate_pct": 88.7, "status": "Standard"},
            {"id": "SPL-004", "name": "Apex Smart Living Corp", "phone": "+1 (877) 555-8833", "email": "distribution@apexliving.com", "address": "Austin, TX, USA", "license_number": "LIC-APEX-77E", "outstanding_balance": 24700.00, "fulfillment_rate_pct": 74.5, "status": "Overdue"},
        ]
        suppliers_dict = {}
        for sup_info in suppliers_data:
            suppliers_dict[sup_info["id"]] = Supplier.objects.create(**sup_info)

        self.stdout.write("Seeding product inventory catalog...")
        products_data = [
            {
                "id": "PRD-001",
                "name": "Artisan Roast: Ethiopia Yirgacheffe",
                "sku": "COF-YIR-2024-01",
                "barcode": "748201290334",
                "category": "Artisanal Beverages",
                "brand": "ShopNest Reserve",
                "description": "Single-origin specialty medium roast coffee with prominent floral notes.",
                "cost_price": 18.50,
                "selling_price": 42.00,
                "quantity": 1240,
                "reorder_level": 200,
                "expiry_date": "2026-10-12",
                "batch_number": "BATCH-ETH-993",
                "status": "Healthy",
                "supplier": suppliers_dict["SPL-001"],
            },
            {
                "id": "PRD-002",
                "name": "AeroFlow Runner X1",
                "sku": "SHO-RED-42-001",
                "barcode": "884920485901",
                "category": "Athletic Wear",
                "brand": "Vanguard Athletics",
                "description": "High-performance marathon running shoe.",
                "cost_price": 65.00,
                "selling_price": 129.99,
                "quantity": 2,
                "reorder_level": 10,
                "expiry_date": "2029-12-31",
                "batch_number": "B-VAN-X1-44",
                "status": "Critical",
                "supplier": suppliers_dict["SPL-003"],
            },
            {
                "id": "PRD-003",
                "name": "Horizon Smartwatch Elite",
                "sku": "WTC-SIL-WHT-09",
                "barcode": "192305781442",
                "category": "Premium Electronics",
                "brand": "Apex Smart Living",
                "description": "Titanium aerospace grade dynamic hybrid fitness watch.",
                "cost_price": 120.00,
                "selling_price": 249.00,
                "quantity": 156,
                "reorder_level": 15,
                "status": "Healthy",
                "supplier": suppliers_dict["SPL-004"],
            },
            {
                "id": "PRD-004",
                "name": "Organic Oat Clusters",
                "sku": "FOD-OAT-400G",
                "barcode": "284910394851",
                "category": "Organic Dry Goods",
                "brand": "Grain & Harvest",
                "description": "Whole-grain organic gluten-free rolled oat clusters.",
                "cost_price": 3.20,
                "selling_price": 8.50,
                "quantity": 42,
                "reorder_level": 50,
                "expiry_date": "2026-06-16",
                "batch_number": "B-GRAIN-OAT-12",
                "status": "Expiring",
                "supplier": suppliers_dict["SPL-001"],
            },
            {
                "id": "PRD-005",
                "name": "Studio Pro Wireless ANC",
                "sku": "AUD-HP-BLK-01",
                "barcode": "503928174928",
                "category": "Premium Electronics",
                "brand": "Studio Sonic Tech",
                "description": "Elite wireless over-ear noise-canceling headphones.",
                "cost_price": 160.00,
                "selling_price": 349.99,
                "quantity": 28,
                "reorder_level": 5,
                "status": "Healthy",
                "supplier": suppliers_dict["SPL-002"],
            },
        ]
        for prod_info in products_data:
            Product.objects.create(**prod_info)

        self.stdout.write("Seeding procurement ledger records...")
        PurchaseOrder.objects.create(id="PO-88291", supplier_id="SPL-001", supplier_name="Global Bean Importers Co.", item_count=500, total_amount=9250.00, created_by_name="Jameson Chen", created_at="2 hours ago", status="PENDING", delivery_status="Scheduled")
        PurchaseOrder.objects.create(id="PO-88285", supplier_id="SPL-002", supplier_name="Studio Sonic Tech LLC", item_count=50, total_amount=8000.00, created_by_name="Marcus Sterling", created_at="3 days ago", status="APPROVED", delivery_status="In-Transit")
        PurchaseOrder.objects.create(id="PO-88210", supplier_id="SPL-003", supplier_name="Vanguard Athletics Ltd.", item_count=120, total_amount=7800.00, created_by_name="Elena Rodriguez", created_at="1 week ago", status="RECEIVED", delivery_status="Arrived")

        self.stdout.write("Seeding walk-in VIP clients...")
        customers_data = [
            {"id": "CS-001", "name": "Benjamin Cardozo", "phone": "+1 (917) 555-1212", "email": "b.cardozo@gmail.com", "address": "11 Pine St, Manhattan, NY", "segment": "VIP Member", "total_spend": 2410.50, "loyalty_points": 450},
            {"id": "CS-002", "name": "Charlotte Bronte", "phone": "+1 (415) 555-5431", "email": "c.bronte@outlook.com", "address": "90 Elm Road, San Francisco, CA", "segment": "Standard", "total_spend": 1229.00, "loyalty_points": 120},
            {"id": "CS-003", "name": "Arthur Dent", "phone": "+1 (512) 555-4242", "email": "dent.a@hitchhiker.org", "address": "42 Galaxy Way, Austin, TX", "segment": "New Client", "total_spend": 42.00, "loyalty_points": 4},
        ]
        for cust in customers_data:
            Customer.objects.create(**cust)

        self.stdout.write("Seeding organizational employees...")
        employees_data = [
            {"id": "E-001", "name": "Marcus Sterling", "phone": "+1 (555) 0101", "email": "m.sterling@shopnest.com", "role": "Super Admin", "salary": 180000.00, "store_id": "STR-001", "store_name": "Downtown Flagship Hub", "joined_date": "2020-03-12", "status": "Active"},
            {"id": "E-002", "name": "Elena Rodriguez", "phone": "+1 (555) 0102", "email": "e.rodriguez@shopnest.com", "role": "Company Manager", "salary": 140000.00, "store_id": "STR-001", "store_name": "Downtown Flagship Hub", "joined_date": "2021-06-15", "status": "Active"},
            {"id": "E-003", "name": "Jameson Chen", "phone": "+1 (555) 0103", "email": "j.chen@shopnest.com", "role": "Store Manager", "salary": 85000.00, "store_id": "STR-001", "store_name": "Downtown Flagship Hub", "joined_date": "2022-01-10", "status": "Active"},
            {"id": "E-004", "name": "Sarah Miller", "phone": "+1 (555) 0104", "email": "s.miller@shopnest.com", "role": "Cashier", "salary": 42000.00, "store_id": "STR-002", "store_name": "Westside Urban Store", "joined_date": "2023-04-01", "status": "Active"},
        ]
        for emp in employees_data:
            Employee.objects.create(**emp)

        self.stdout.write("Seeding sales checkout transactions...")
        trx1 = SalesTransaction.objects.create(
            id="#TRX-9482",
            customer_name="Benjamin Cardozo",
            customer_initials="BC",
            date_time="Today, 11:24 AM",
            amount=512.48,
            payment_method="Card",
            status="Completed",
        )
        TransactionItem.objects.create(transaction=trx1, product_id="PRD-005", product_name="Studio Pro Wireless ANC", sku="AUD-HP-BLK-01", price=349.99, quantity=1)
        TransactionItem.objects.create(transaction=trx1, product_id="PRD-001", product_name="Artisan Roast: Ethiopia Yirgacheffe", sku="COF-YIR-2024-01", price=42.00, quantity=3)

        self.stdout.write("Seeding active alarm notifications...")
        SystemNotification.objects.create(
            id="NTF-001",
            type="low_stock",
            title="Critical Stock Warning",
            message="Item [AeroFlow Runner X1] falls below reorder threshold (10 units). Auto replenishment advised.",
            timestamp="1 hr ago",
            urgency="critical",
            unread=True,
            action_required=True,
            action_text="Authorize PO Support",
        )
        SystemNotification.objects.create(
            id="NTF-002",
            type="expiry",
            title="Sovereign Expiration Threat",
            message="Organic Oat Clusters batch [B-GRAIN-OAT-12] decays on 2026-06-16. Prepare 40% clearance markdowns immediately.",
            timestamp="4 hrs ago",
            urgency="warning",
            unread=True,
            action_required=True,
            action_text="Apply Markdown",
        )

        self.stdout.write(self.style.SUCCESS("Database seeded successfully with ShopNest records!"))
