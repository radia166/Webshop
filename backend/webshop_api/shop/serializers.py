from .models import User, Item, Cart,CartItem,BuyerProfile
from rest_framework import serializers
from django.db import transaction
from .models import Checkout,Order, OrderItem
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom fields
        token['is_seller'] = user.is_seller
        token['is_staff'] = user.is_staff
        token['user_id'] = user.id
        token['username'] = user.username

        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_seller']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            print(f"User Created: {user} (Type: {type(user)})")
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'email','is_seller', 'is_superuser']

class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = ['address', 'city', 'postal_code', 'country']

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'title', 'description', 'price', 'seller','status','date_added']

class ItemCreateSerializer(serializers.ModelSerializer):  #for adding new item
    class Meta:
        model = Item
        exclude = ['seller']

class CartItemSerializer(serializers.ModelSerializer):
    item_title = serializers.ReadOnlyField(source="item.title")
    item_price = serializers.ReadOnlyField(source="item.price")

    class Meta:
        model = CartItem
        fields = ['id', 'item', 'item_title', 'item_price', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at']

class CheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkout
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_name', 'price', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.CharField(source='user.username', default='Guest')

    class Meta:
        model = Order
        fields = ['id', 'user', 'created_at', 'status', 'total_price', 'items']