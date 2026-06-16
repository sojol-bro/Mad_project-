from django.db import models


class Company(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=128)
    owner_name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=64)
    tax_number = models.CharField(max_length=128)

    class Meta:
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.name


class Store(models.Model):
    STATUS_CHOICES = [
        ("Online", "Online"),
        ("Offline", "Offline"),
        ("Maintenance", "Maintenance"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=128, unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=64)
    manager_id = models.CharField(max_length=64)
    manager_name = models.CharField(max_length=255)
    daily_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    sales_growth = models.FloatField(default=0.0)  # Percentage growth
    inventory_count = models.IntegerField(default=0)
    inventory_capacity_pct = models.FloatField(default=0.0)
    status = models.CharField(max_length=64, choices=STATUS_CHOICES, default="Online")
    image_url = models.URLField(max_length=1024, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Category(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    parent_category = models.CharField(max_length=128, blank=True, null=True)
    total_products = models.IntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Supplier(models.Model):
    STATUS_CHOICES = [
        ("Preferred", "Preferred"),
        ("Standard", "Standard"),
        ("Overdue", "Overdue"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=64)
    email = models.EmailField()
    address = models.TextField()
    license_number = models.CharField(max_length=128)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    fulfillment_rate_pct = models.FloatField(default=0.0)
    status = models.CharField(max_length=64, choices=STATUS_CHOICES, default="Standard")

    def __str__(self):
        return self.name


class Product(models.Model):
    STATUS_CHOICES = [
        ("Critical", "Critical"),
        ("Healthy", "Healthy"),
        ("Expiring", "Expiring"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=128, unique=True)
    barcode = models.CharField(max_length=128, db_index=True)
    category = models.CharField(max_length=128)  # Direct tag or mapping
    brand = models.CharField(max_length=128)
    description = models.TextField(blank=True, default="")
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)
    expiry_date = models.DateField(blank=True, null=True)  # Format: YYYY-MM-DD
    batch_number = models.CharField(max_length=128, blank=True, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="Healthy")
    image_url = models.URLField(max_length=1024, blank=True, null=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")

    def __str__(self):
        return f"{self.name} ({self.sku})"


class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "PENDING"),
        ("APPROVED", "APPROVED"),
        ("RECEIVED", "RECEIVED"),
    ]
    DELIVERY_CHOICES = [
        ("Arrived", "Arrived"),
        ("In-Transit", "In-Transit"),
        ("Scheduled", "Scheduled"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="purchase_orders")
    supplier_name = models.CharField(max_length=255)
    item_count = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_by_name = models.CharField(max_length=255)
    created_at = models.CharField(max_length=128)  # Store human readable like "12 hours ago" or timestamp
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="PENDING")
    delivery_status = models.CharField(max_length=64, choices=DELIVERY_CHOICES, default="Scheduled", null=True, blank=True)

    def __str__(self):
        return f"{self.id} -> {self.supplier_name}"


class SalesTransaction(models.Model):
    PAYMENT_CHOICES = [
        ("Cash", "Cash"),
        ("Card", "Card"),
        ("Mobile", "Mobile"),
        ("Bank", "Bank"),
    ]
    STATUS_CHOICES = [
        ("Completed", "Completed"),
        ("Refunded", "Refunded"),
        ("Pending", "Pending"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    customer_name = models.CharField(max_length=255, default="Quick Walk-In")
    customer_initials = models.CharField(max_length=16, default="WI")
    date_time = models.CharField(max_length=128)  # text format or datestring
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=64, choices=PAYMENT_CHOICES, default="Cash")
    status = models.CharField(max_length=64, choices=STATUS_CHOICES, default="Completed")

    def __str__(self):
        return f"TRX: {self.id} | ${self.amount}"


class TransactionItem(models.Model):
    transaction = models.ForeignKey(SalesTransaction, on_delete=models.CASCADE, related_name="items")
    product_id = models.CharField(max_length=64)
    product_name = models.CharField(max_length=255)
    sku = models.CharField(max_length=128)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


class Customer(models.Model):
    SEGMENT_CHOICES = [
        ("VIP Member", "VIP Member"),
        ("Standard", "Standard"),
        ("New Client", "New Client"),
        ("At Risk", "At Risk"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=64)
    email = models.EmailField()
    address = models.TextField(blank=True, null=True)
    segment = models.CharField(max_length=64, choices=SEGMENT_CHOICES, default="Standard")
    total_spend = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    loyalty_points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.segment})"


class Employee(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("On Leave", "On Leave"),
        ("Training", "Training"),
        ("Off Duty", "Off Duty"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=64)
    email = models.EmailField()
    role = models.CharField(max_length=128)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    store_id = models.CharField(max_length=64)
    store_name = models.CharField(max_length=255)
    joined_date = models.CharField(max_length=128)
    status = models.CharField(max_length=64, choices=STATUS_CHOICES, default="Active")
    avatar_url = models.URLField(max_length=1024, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.role}"


class SystemNotification(models.Model):
    URGENCY_CHOICES = [
        ("critical", "critical"),
        ("warning", "warning"),
        ("info", "info"),
    ]
    TYPE_CHOICES = [
        ("low_stock", "low_stock"),
        ("expiry", "expiry"),
        ("purchase_order", "purchase_order"),
        ("inventory_transfer", "inventory_transfer"),
        ("daily_sales", "daily_sales"),
    ]

    id = models.CharField(max_length=64, primary_key=True)
    type = models.CharField(max_length=128, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    timestamp = models.CharField(max_length=128)
    urgency = models.CharField(max_length=32, choices=URGENCY_CHOICES, default="info")
    unread = models.BooleanField(default=True)
    action_required = models.BooleanField(default=False)
    action_text = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.urgency.upper()}: {self.title}"
