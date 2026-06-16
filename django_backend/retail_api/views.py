from rest_framework import viewsets
from .models import (
    Company,
    Store,
    Category,
    Supplier,
    Product,
    PurchaseOrder,
    SalesTransaction,
    Customer,
    Employee,
    SystemNotification,
)
from .serializers import (
    CompanySerializer,
    StoreSerializer,
    CategorySerializer,
    SupplierSerializer,
    ProductSerializer,
    PurchaseOrderSerializer,
    SalesTransactionSerializer,
    CustomerSerializer,
    EmployeeSerializer,
    SystemNotificationSerializer,
)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer


class SalesTransactionViewSet(viewsets.ModelViewSet):
    queryset = SalesTransaction.objects.all()
    serializer_class = SalesTransactionSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class SystemNotificationViewSet(viewsets.ModelViewSet):
    queryset = SystemNotification.objects.all()
    serializer_class = SystemNotificationSerializer
