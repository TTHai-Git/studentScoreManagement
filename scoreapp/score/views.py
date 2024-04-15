from django.http import HttpResponse
from rest_framework import viewsets, permissions, generics, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
import score.pagination
from score.models import *
from score import serializers, pagination, perms

# Create your views here.


def index(request):
    return HttpResponse("CourseApp")
