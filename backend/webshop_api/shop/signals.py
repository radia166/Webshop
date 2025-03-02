from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, BuyerProfile

@receiver(post_save, sender=User)
def create_buyer_profile(sender, instance, created, **kwargs):
    if created:
        try:
            BuyerProfile.objects.create(user=instance)
            print(f"BuyerProfile Created for User: {instance}")
        except Exception as e:
            print(f"Error in Signal: {e}")
#For now not needed