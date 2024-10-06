import cloudinary
from django.contrib import admin
from django import forms
from score.models import *
from django.utils.html import mark_safe
from ckeditor_uploader.widgets import CKEditorUploadingWidget


# Register your models here.


class ScoreAppAdminSite(admin.AdminSite):
    site_header = 'Hệ thống quản lý điểm trực tuyến'


admin_site = ScoreAppAdminSite(name='myadmin')


class SubjectForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Subject
        fields = '__all__'


class MySubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_date', 'updated_date', 'active']
    search_fields = ['name', 'description']
    list_filter = ['id', 'created_date', 'name']
    readonly_fields = ['my_image']
    form = SubjectForm

    def my_image(self, instance):
        if instance:
            if instance.image is cloudinary.CloudinaryResource:
                return mark_safe(f"<img width='120' src='{instance.image.url}' />")

            return mark_safe(f"<img width='120' src='/static/{instance.image.name}' />")


admin.site.register(Role)
admin.site.register(User)
admin.site.register(Teacher)
admin.site.register(Student, name="Student")
admin.site.register(StudentClassRoom)

admin.site.register(StudyClassRoom)
admin.site.register(Schedule)
admin.site.register(Event)
admin.site.register(Attend)
admin.site.register(Department)
admin.site.register(Group)
admin.site.register(Semester)
admin.site.register(Topic)
admin.site.register(Comment)
admin.site.register(CommentFile)
admin.site.register(Subject, MySubjectAdmin)


admin.site.register(ScoreColumn)
admin.site.register(Study)
admin.site.register(ScoreDetails)
admin.site.register(PointConversion)