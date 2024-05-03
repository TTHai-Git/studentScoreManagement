import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from score.models import *
from oauth2_provider.models import Application

fake = Faker()


class Command(BaseCommand):
    help = 'Generate fake data for models'

    def handle(self, *args, **kwargs):
        self.clean_database()
        self.create_superuser()
        self.create_oauth_application()
        self.generate_departments()
        self.generate_groups()
        self.generate_student_classrooms()
        self.generate_teachers()
        self.generate_semesters()
        self.generate_subjects()
        self.generate_study_classrooms()
        self.generate_topics()
        self.generate_comments()
        self.generate_score_columns()
        self.generate_students()
        self.generate_studies()
        self.generate_score_details()

    def clean_database(self):
        # Be cautious with this approach, as it deletes all objects from all models
        # Consider using a different approach for handling database cleanup
        for model in [Department, Group, StudentClassRoom, Teacher, Semester, Subject,
                      StudyClassRoom, Topic, Comment, ScoreColumn, Study, ScoreDetails]:
            model.objects.all().delete()

    def create_superuser(self):
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            superuser = User.objects.create_superuser('admin', 'admin@ou.edu.vn', make_password('admin'))

    def create_oauth_application(self):
        if not Application.objects.filter(user__username='admin').exists():
            superuser = get_user_model().objects.get(username='admin')
            Application.objects.create(
                user=superuser,
                client_id='3jFUdqJsKwnhj1X5wf5WihTyp2g7mfdWp6V3mhl5',
                client_secret='3FJlILnIxptAwsnoQxSUcltQzwLhV87sEXbVRkrsMlJbM3aZjNy90o6VqNtGwNzK9y09NQBqIlVGn8fi3Cnq7ZnRDXNo8f7NsyQQTyVTfJpzbMEePYsSV97NMXBDZZnt',
                client_type='confidential',
                authorization_grant_type='password'
            )

    def generate_departments(self):
        for _ in range(10):
            Department.objects.create(
                name=fake.word()
            )

    def generate_groups(self):
        for _ in range(10):
            Group.objects.create(
                name=fake.word(),
                department=random.choice(Department.objects.all())
            )

    def generate_student_classrooms(self):
        for _ in range(10):
            StudentClassRoom.objects.create(
                name=fake.word(),
                department=random.choice(Department.objects.all())
            )

    def generate_teachers(self):
        for _ in range(10):
            user = get_user_model().objects.create(
                username=fake.user_name(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.email(),
                password=make_password('password')
            )
            Teacher.objects.create(
                user=user,
                code=fake.department_code()
            )

    def generate_semesters(self):
        for _ in range(10):
            Semester.objects.create(
                name=fake.word(),
                year=fake.year()
            )

    def generate_subjects(self):
        for _ in range(10):
            Subject.objects.create(
                name=fake.word(),
                description=fake.text()
            )

    def generate_study_classrooms(self):
        for _ in range(10):
            StudyClassRoom.objects.create(
                name=fake.word(),
                islock=fake.boolean(),
                subject=random.choice(Subject.objects.all()),
                teacher=random.choice(Teacher.objects.all()),
                group=random.choice(Group.objects.all()),
                semester=random.choice(Semester.objects.all())
            )

    def generate_topics(self):
        for _ in range(10):
            Topic.objects.create(
                title=fake.sentence(),
                studyclassroom=random.choice(StudyClassRoom.objects.all())
            )

    def generate_comments(self):
        for _ in range(20):
            Comment.objects.create(
                user=random.choice(get_user_model().objects.all()),
                topic=random.choice(Topic.objects.all()),
                content=fake.paragraph()
            )

    def generate_score_columns(self):
        for _ in range(5):
            ScoreColumn.objects.create(
                type=fake.word(),
                percent=fake.random_int(min=0, max=10),
                studyclassroom=random.choice(StudyClassRoom.objects.all())
            )

    def generate_students(self):
        for _ in range(10):
            user = get_user_model().objects.create(
                username=fake.user_name(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.email(),
                password=make_password('password')
            )
            Student.objects.create(
                user=user,
                code=fake.department_code()
            )

    def generate_studies(self):
        for _ in range(20):
            Study.objects.create(
                student=random.choice(Student.objects.all()),
                studyclassroom=random.choice(StudyClassRoom.objects.all())
            )

    def generate_score_details(self):
        for _ in range(50):
            ScoreDetails.objects.create(
                score=fake.random_int(min=0, max=10),
                study=random.choice(Study.objects.all()),
                scorecolumn=random.choice(ScoreColumn.objects.all())
            )

# Run in Terminal: python manage.py generate_fake_data