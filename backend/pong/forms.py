from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Users

class UserRegisterForm(UserCreationForm):

    class Meta:
        model = Users
        fields = ['username', 'password1', 'password2']

class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField()

    class Meta:
        model = Users
        fields = ['username', 'email', 'description', 'picture']

