import enum

from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
from rest_framework.exceptions import ValidationError


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class RoleEnum(models.TextChoices):
    ADMIN = 'admin'
    STUDENT = 'student'
    TEACHER = 'teacher'


class Role (models.Model):
    name = models.CharField(max_length=50, choices=RoleEnum.choices, primary_key=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    def validate_ou_mail(value):
        if str(value).endswith("@ou.edu.vn"):
            return value
        else:
            raise ValidationError("Phải dùng tài khoản mail trường @ou.edu.svn!!!")

    code = models.CharField(max_length=10, unique=True, default=None, null=True)
    dob = models.DateField(max_length=8, auto_now_add=True)
    address = models.CharField(max_length=254, null=True)
    avatar = CloudinaryField(null=True, default="https://res.cloudinary.com/dh5jcbzly/image/upload/v1718648320/r77u5n3w3ddyy4yqqamp.jpg")
    email = models.EmailField(max_length=254, validators=[validate_ou_mail], null=False)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f'{self.id} - {self.last_name}  {self.first_name} - {self.username} - {self.role}'


class Department(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.id} - {self.name}'


class Group(BaseModel):
    name = models.CharField(max_length=10)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.id} - {self.name}'


class StudentClassRoom(BaseModel):
    name = models.CharField(max_length=10)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.id} - {self.name} - {self.department.name}'


class Student(User):

    studentclassroom = models.ForeignKey(StudentClassRoom, on_delete=models.CASCADE, null=True, default=None)

    def __str__(self):
        return f'{self.id} - {self.code} - {self.last_name} {self.first_name} - {self.username}'

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Student'


class Teacher(User):
    def __str__(self):
        return f'{self.id} - {self.code} - {self.last_name} {self.first_name} - {self.username}'

    class Meta:
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teacher'


class Semester(models.Model):
    name = models.CharField(max_length=10)
    year = models.CharField(max_length=11, default="2023 - 2024")

    def __str__(self):
        return f'{self.name} - {self.year}'


class Subject(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    image = CloudinaryField(null=True)
    description = RichTextField()

    def __str__(self):
        return f'{self.id} - {self.name}'


class StudyClassRoom(BaseModel):
    name = models.CharField(max_length=10)
    islock = models.BooleanField(default=False)
    subject = models.ForeignKey(Subject, on_delete=models.RESTRICT)
    teacher = models.ForeignKey(Teacher, on_delete=models.RESTRICT)
    group = models.ForeignKey(Group, on_delete=models.RESTRICT)
    semester = models.ForeignKey(Semester, on_delete=models.RESTRICT)
    started_date = models.DateField(null=True)
    ended_date = models.DateField(null=True)

    def __str__(self):
        return f'{self.id} - {self.name} - {self.subject} - {self.teacher} {self.teacher} ' \
               f'- {self.group} - {self.semester} - {self.islock}'


class Schedule(BaseModel):
    started_time = models.DateTimeField(null=True)
    ended_time = models.DateTimeField(null=True)
    descriptions = models.CharField(max_length=100, null=True)
    google_calendar_event_id = models.CharField(max_length=255, null=True, blank=True)
    studyclassroom = models.ForeignKey(StudyClassRoom, on_delete=models.RESTRICT)

    def __str__(self):
        return f'{self.started_time} - {self.ended_time} - {self.studyclassroom}'

    class Meta:
        unique_together = ('started_time', 'ended_time', 'studyclassroom')


class Topic(BaseModel):
    title = models.CharField(max_length=100)
    studyclassroom = models.ForeignKey(StudyClassRoom, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.id} - {self.title} - {self.studyclassroom.subject.name} - {self.studyclassroom.teacher.last_name}' \
               f' - {self.studyclassroom.teacher.first_name}'


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user} - {self.topic}'

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)

    def __str__(self):
        return f'{super().__str__()} - {self.content}'


class CommentFile(models.Model):
    file_url = models.URLField(max_length=200, null=True)
    file_name = models.CharField(max_length=50, null=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='files')


class ScoreColumn(models.Model):
    type = models.CharField(max_length=50)
    percent = models.IntegerField(default=0)
    studyclassroom = models.ForeignKey(StudyClassRoom, on_delete=models.RESTRICT)

    def __str__(self):
        return f'{self.id} - {self.type} - {self.percent} - {self.studyclassroom.name} -  ' \
               f'{self.studyclassroom.teacher.last_name} - {self.studyclassroom.teacher.first_name} ' \
               f'- {self.studyclassroom.subject.name}'


class Study(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    studyclassroom = models.ForeignKey(StudyClassRoom, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.student} - {self.studyclassroom}'


class ScoreDetails(BaseModel):
    score = models.FloatField(null=True, validators=[MinValueValidator(0.0), MaxValueValidator(10.0)])
    study = models.ForeignKey(Study, on_delete=models.RESTRICT)
    scorecolumn = models.ForeignKey(ScoreColumn, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('study', 'scorecolumn')

    def __str__(self):
        return f'{self.study} - {self.scorecolumn} - {self.score}'
