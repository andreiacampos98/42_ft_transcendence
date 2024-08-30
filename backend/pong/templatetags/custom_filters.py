from django import template

register = template.Library()

@register.filter
def add(value, arg):
    """Retorna o valor incrementado de arg."""
    return value + arg
