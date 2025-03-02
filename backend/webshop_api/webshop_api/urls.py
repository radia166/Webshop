from django.contrib import admin
from django.urls import path , include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from shop.serializers import CustomTokenObtainPairSerializer
from shop.views import CustomTokenObtainPairView,UserProfileView,ChangePasswordView,MyItemsView,order_history,admin_order_history


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('shop/', include('shop.urls')),
    path('shop/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('shop/myitems/', MyItemsView.as_view(), name='my-items'),
    path('orders/history/', order_history, name='order_history'),
    path('shop/admin-order-history/', admin_order_history, name='admin-order-history'),

]

