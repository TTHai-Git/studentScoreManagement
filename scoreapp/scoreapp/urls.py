"""
URL configuration for scoreapp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from score import views
from rest_framework import permissions, routers
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = routers.DefaultRouter()
router.register('studyclassrooms', views.StudyClassRoomViewSet, basename='studyclassrooms')
router.register('teachers', views.TeacherViewSet, basename='teachers')
router.register('students', views.StudentViewSet, basename='students')
router.register('users', views.UserViewSet, basename='users')
router.register('roles', views.RoleViewSet, basename='roles')
router.register('topics', views.TopicViewSet, basename='topics')
router.register('schedules', views.ScheduleViewSet, basename='schedules')
router.register('comments', views.CommentViewSet, basename='comments')
router.register('commentfiles', views.CommentFileViewSet, basename='commentfiles')
router.register('semesters', views.SemesterViewSet, basename='semesters')
router.register('events', views.EventViewSet, basename='events')
router.register('attends', views.AttendViewSet, basename='attends')
router.register('studies', views.StudyViewSet, basename='studies')

schema_view = get_schema_view(
    openapi.Info(
        title="Score API",
        default_version='v1',
        description="APIs for ScoreApp",
        contact=openapi.Contact(email="2151050112hai@ou.edu.vn, 2151053020hoang@ou.edu.vn"),
        license=openapi.License(name="Trịnh Thanh Hải & Lê Trương Minh Hoàng@2024"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # path('', views.index, name="index"),
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0),
            name='schema-json'),
    re_path(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
            name='schema-swagger-ui'),
    re_path(r'^redoc/$',
            schema_view.with_ui('redoc', cache_timeout=0),
            name='schema-redoc'),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
]
