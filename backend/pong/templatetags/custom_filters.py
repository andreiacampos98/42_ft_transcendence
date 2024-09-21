from django import template
import urllib.parse

register = template.Library()

@register.filter
def urlunquote(value):
    return urllib.parse.unquote(value)
