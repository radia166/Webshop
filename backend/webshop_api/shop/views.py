from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, permissions,filters,status
from .pagination import CustomPagination
from .models import User, Item, Cart, CartItem, BuyerProfile
from .models import Order, OrderItem
from .serializers import (UserSerializer,UserProfileSerializer ,ItemSerializer,ItemCreateSerializer,
                          CartSerializer,CartItemSerializer,BuyerProfileSerializer,OrderSerializer)
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAdminUser
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from .serializers import CheckoutSerializer,CustomTokenObtainPairSerializer
from django.contrib.auth.hashers import check_password


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

def populate_db(request):
    User.objects.exclude(is_superuser=True).delete()
    Item.objects.all().delete()

    for i in range(1, 7):
        user = User.objects.create_user(
            username=f"testuser{i}",
            password=f"pass{i}",
            email=f"testuser{i}@shop.aa"
        )
        user.is_seller = i <= 3  # First 3 users are sellers
        user.save()

        if user.is_seller:
            for j in range(1, 11):
                Item.objects.create(
                    title=f"Item {j}",
                    description=f"Description for item {j} by {user.username}",
                    price=10.0 * j,
                    seller=user,
                )

    return JsonResponse({"message": "Database populated with test users and items!"})

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['id', 'username', 'email']

    def get_queryset(self):
        queryset = super().get_queryset()
        print(f"Debugging Queryset: {queryset}")
        user_id = self.request.query_params.get('id', None)
        if user_id:
            queryset = queryset.filter(id=user_id)
        return queryset

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_active = True
        user.save()

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }, status=status.HTTP_201_CREATED)


class IsSellerOrAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.user.is_seller or request.user.is_staff)

def is_seller_or_admin(user):
    return user.is_authenticated and (user.is_superuser or user.is_seller)

class BuyerProfileView(APIView): # Not needed now. can implement latter
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = BuyerProfile.objects.get_or_create(user=request.user)
        serializer = BuyerProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, created = BuyerProfile.objects.get_or_create(user=request.user)
        serializer = BuyerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.query_params.get("simple") == "true":
            user = request.user
            return Response({
                "username": user.username,
                "email": user.email,
            })
        serializer = UserProfileSerializer(request.user) # Default
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not check_password(old_password, user.password):
            return Response({"error": "Old password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password or len(new_password) < 6:
            return Response({"error": "New password must be at least 6 characters long"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    pagination_class = CustomPagination
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ItemSerializer
        return ItemCreateSerializer


class AddItemView(APIView):
    permission_classes = [IsSellerOrAdmin]

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        data['seller'] = request.user.id  # auto assign logged-in seller ID

        serializer = ItemSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

class CartItemViewSet(ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
#@permission_classes([AllowAny])  - removed as per requirement
def validate_cart(request):
    #Validate the cart items for price changes and availability.
    cart_items = request.data.get('items', [])
    errors = []
    updated_cart = []
    valid = True  # Start with valid cart

    for item_data in cart_items:
        try:
            db_item = Item.objects.get(id=item_data['id'])

            # check if item is sold
            if db_item.status == 'sold':
                errors.append({'id': db_item.id, 'message': 'Item is no longer available.'})
                valid = False

            # check for price changes
            elif float(db_item.price) != float(item_data['price']):
                errors.append({
                    'id': db_item.id,
                    'message': f'Price changed from {item_data["price"]} to {db_item.price}.'
                })

                (updated_cart.append # update the item price in the response
                    ({
                    **item_data,
                    'price': db_item.price,
                    }))
                valid = False

            else:
                updated_cart.append(item_data) # add valid items to the updated cart

        except Item.DoesNotExist:
            errors.append({'id': item_data['id'], 'message': 'Item no longer exists.'})
            valid = False

    return Response({
        'valid': valid,
        'errors': errors,
        'updatedCart': updated_cart,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def process_payment(request):
    cart_items = request.data.get('items', [])
    user = request.user if request.user.is_authenticated else None
    try:
        for item_data in cart_items:
            db_item = Item.objects.get(id=item_data['id'])
            if db_item.status == 'sold':
                return Response({'error': f'Item {db_item.title} is no longer available.'}, status=400)
            db_item.status = 'sold'
            db_item.buyer = user
            db_item.save()

        return Response({'message': 'Payment successful!'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

class CheckoutView(APIView):
    @permission_classes([AllowAny])
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Checkout data saved successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_order(request):
    user = request.user if request.user.is_authenticated else None
    data = request.data

    try:
        cart_items = data.get('cartItems', [])
        total_price = sum(item['price'] * item['quantity'] for item in cart_items)

        order = Order.objects.create(user=user, total_price=total_price)

        for item_data in cart_items:
            item = Item.objects.get(id=item_data['id'])

            if item.status == "sold":
                return Response({'error': f'Item {item.title} is already sold.'}, status=400)

            OrderItem.objects.create(
                order=order,
                product_name=item.title,
                price=item.price,
                quantity=item_data['quantity']
            )
            item.status = "sold" #Mark the item as sold
            item.save()

        return Response({'message': 'Order created successfully!', 'orderId': order.id}, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=400)

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity', 1)

        try:
            item = Item.objects.get(id=item_id)

            # Prevent user from adding their own items to the cart
            if item.seller == request.user:
                return Response({"error": "You cannot add your own items to the cart."}, status=400)

        except Item.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, item=item)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        return Response({"message": "Item added to cart"}, status=200)

    def delete(self, request, item_id):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return Response({"error": "Cart not found"}, status=404)

        cart_item = CartItem.objects.filter(cart=cart, item_id=item_id).first()
        if cart_item:
            cart_item.delete()
            return Response({"message": "Item removed from cart"}, status=200)

        return Response({"error": "Item not found in cart"}, status=404)

    def patch(self, request, item_id):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return Response({"error": "Cart not found"}, status=404)

        cart_item = CartItem.objects.filter(cart=cart, item_id=item_id).first()
        if not cart_item:
            return Response({"error": "Item not found in cart"}, status=404)

        quantity = request.data.get('quantity')
        if quantity:
            cart_item.quantity = quantity
            cart_item.save()
            return Response({"message": "Quantity updated"}, status=200)

        return Response({"error": "Invalid quantity"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request):
    user = request.user
    orders = user.orders.all()

    # Serialize the orders
    order_list = []
    for order in orders:
        order_items = order.items.all()
        items = [
            {'product_name': item.product_name, 'price': item.price, 'quantity': item.quantity }
            for item in order_items
        ]
        order_list.append({
            'id': order.id,
            'created_at': order.created_at,
            'status': order.status,
            'total_price': order.total_price,
            'items': items
        })

    return Response(order_list, status=status.HTTP_200_OK)

#backend only for admin
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_order_history(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

#mainly for the sellers
class MyItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        seller_items = Item.objects.filter(seller=request.user)
        serializer = ItemSerializer(seller_items, many=True)
        return Response(serializer.data)