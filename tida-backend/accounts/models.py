# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom user model that extends the Django AbstractUser model."""
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    theme_preference = models.CharField(max_length=10, default='light')
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return self.username