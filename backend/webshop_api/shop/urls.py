from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (UserViewSet, ItemViewSet, CartViewSet,signup, CartItemViewSet,AddItemView,
                    UserProfileView,BuyerProfileView,CartView,ChangePasswordView,CheckoutView,create_order,
                    validate_cart,process_payment,CustomTokenObtainPairView)


router = DefaultRouter()
router.register('users', UserViewSet, basename='user')  # User endpoints
router.register('items', ItemViewSet)  # Item endpoints
router.register('cart', CartViewSet)  # Cart endpoints
router.register('cart-items', CartItemViewSet)


urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('cart/validate/', validate_cart, name='validate_cart'),
    path('cart/pay/', process_payment, name='process_payment'),
    path('', include(router.urls)),
    path('populate-db/', views.populate_db, name='populate_db'),
    path('shop/items/', AddItemView.as_view(), name='add_item'),
    path('buyer-profile/', BuyerProfileView.as_view(), name='buyer-profile'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/<int:item_id>/', CartView.as_view(), name='cart-item'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/create/', create_order, name='create_order'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('signup/', signup, name='signup'),

]




