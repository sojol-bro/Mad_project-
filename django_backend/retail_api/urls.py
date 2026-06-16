from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet,
    StoreViewSet,
    CategoryViewSet,
    SupplierViewSet,
    ProductViewSet,
    PurchaseOrderViewSet,
    SalesTransactionViewSet,
    CustomerViewSet,
    EmployeeViewSet,
    SystemNotificationViewSet,
)

router = DefaultRouter()
router.register(r"companies", CompanyViewSet, basename="companies")
router.register(r"stores", StoreViewSet, basename="stores")
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"suppliers", SupplierViewSet, basename="suppliers")
router.register(r"products", ProductViewSet, basename="products")
router.register(r"purchase-orders", PurchaseOrderViewSet, basename="purchaseorders")
router.register(r"transactions", SalesTransactionViewSet, basename="transactions")
router.register(r"customers", CustomerViewSet, basename="customers")
router.register(r"employees", EmployeeViewSet, basename="employees")
router.register(r"notifications", SystemNotificationViewSet, basename="notifications")

urlpatterns = [
    path("", include(router.urls)),
]
