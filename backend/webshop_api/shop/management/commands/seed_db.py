from django.core.management.base import BaseCommand
from shop.models import Item,User

class Command(BaseCommand):
    help = "Seeds the database with test data"

    def handle(self, *args, **kwargs):
        # Clear existing data
        User.objects.all().delete()
        Item.objects.all().delete()

        # Create test users and items
        for i in range(3):
            user = User.objects.create_user(username=f'testuser{i+1}', password=f'pass{i+1}', email=f'testuser{i+1}@shop.aa')
            for j in range(10):
                Item.objects.create(
                    title=f'Item {j+1}',
                    description=f'Description for item {j+1}',
                    price=10.0 * (j+1),
                    seller=user
                )
        self.stdout.write(self.style.SUCCESS("Database seeded with test data!"))