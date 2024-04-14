from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField

# Create your models here.
from rest_framework.exceptions import ValidationError


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class User(AbstractUser):

    def validate_ou_mail(value):
        if "@ou.edu.vn" in value:
            return value
        else:
            raise ValidationError("This field accepts mail id of OU only")

    dob = models.DateField(max_length=8)
    address = models.CharField(max_length=254, null=True)
    avatar = CloudinaryField(null=True)
    email = models.CharField(max_length=254, validators=[validate_ou_mail])

    def __str__(self):
        return f'{self.id} - {self.last_name}  {self.first_name} - {self.username}'


class Department(BaseModel):
    name = models.CharField(max_length=100)


class Group(BaseModel):
    name = models.CharField(max_length=10)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)


class StudentClassRoom(BaseModel):
    name = models.CharField(max_length=10)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)


class Student(User):
    code = models.CharField(max_length=10)
    studentclassroom = models.ForeignKey(StudentClassRoom, on_delete=models.CASCADE)


class Teacher(User):
    code = models.CharField(max_length=10)


class Semester(models.Model):
    name = models.CharField(max_length=10)
    year = models.CharField(max_length=5, unique=True, default="2024")


class Subject(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    image = CloudinaryField(null=True)
    desciption = RichTextField()


class StudyClassRoom(BaseModel):
    name = models.CharField(max_length=10)
    islock = models.BooleanField(default=False)
    subject = models.ForeignKey(Subject, on_delete=models.RESTRICT)
    teacher = models.ForeignKey(Teacher, on_delete=models.RESTRICT)
    group = models.ForeignKey(Group, on_delete=models.RESTRICT)
    semester = models.ForeignKey(Semester, on_delete=models.RESTRICT)


class Topic(BaseModel):
    title = models.CharField(max_length=100, unique=True)
    studyclassroom = models.ForeignKey(StudyClassRoom, on_delete=models.CASCADE)


class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user} - {self.topic}'

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)


class ScoreColumn(models.Model):
    type = models.CharField(max_length=50)
    percent = models.IntegerField
    studyclassroom = models.ForeignKey(StudyClassRoom, on_delete=models.RESTRICT)


class Study(BaseModel):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    studyclassroom = models.ForeignKey(StudyClassRoom, on_delete=models.CASCADE)


class ScoreDetails(BaseModel):
    score = models.FloatField(default=0.0)
    study = models.ForeignKey(Study, on_delete=models.RESTRICT)
    scorecolumn = models.ForeignKey(ScoreColumn, on_delete=models.RESTRICT)
