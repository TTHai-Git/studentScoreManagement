import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from score.models import *
from oauth2_provider.models import Application
from django.utils import timezone
import os
from dotenv import load_dotenv
load_dotenv('.env/.env')
fake = Faker()


class Command(BaseCommand):
    help = 'Generate fake data for models'

    def handle(self, *args, **kwargs):
        faker = Faker()
        self.clean_database()
        self.create_roles()  # Ensure roles exist before creating users
        self.create_superuser()
        self.create_oauth_application()
        self.generate_departments()
        self.generate_groups()
        self.generate_student_classrooms()
        self.generate_teachers()
        self.generate_semesters()
        self.generate_subjects()
        self.generate_study_classrooms()
        self.generate_students()
        self.generate_topics()
        self.generate_comments()
        self.generate_score_columns()
        self.generate_studies()
        self.generate_score_details()
        self.generate_point_conversions()
        self.generate_events()
        self.generate_attendance()

        self.stdout.write(self.style.SUCCESS('Successfully generated fake data for all models!'))

    def clean_database(self):
        # Deleting all objects from all models (caution!)
        for model in [Department, Group, StudentClassRoom, Teacher, Semester, Subject,
                      StudyClassRoom, Topic, Comment, ScoreColumn, Study, ScoreDetails, PointConversion, Event, Attend]:
            model.objects.all().delete()

    def create_roles(self):
        # Ensure roles exist in the system
        for role_name in RoleEnum.choices:
            Role.objects.get_or_create(name=role_name[0])

    def create_superuser(self):
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            superuser = User.objects.create_superuser(
                username='admin',
                email='admin@ou.edu.vn',
                password='admin'  # No need to hash the password here, Django handles that in `create_superuser`
            )
            superuser.save()

    def create_oauth_application(self):
        if not Application.objects.filter(user__username='admin').exists():
            superuser = get_user_model().objects.get(username='admin')
            Application.objects.create(
                user=superuser,
                client_id=os.getenv('client_id_db_oauth_toolkit'),
                client_secret=os.getenv('client_secret_db_oauth_toolkit'),
                client_type='confidential',
                authorization_grant_type='password'
            )

    def generate_departments(self):
        for _ in range(5):
            Department.objects.create(name=fake.company())

    def generate_groups(self):
        departments = Department.objects.all()
        for _ in range(5):
            Group.objects.create(
                name=fake.bothify(text='GRP####'),
                department=random.choice(departments)
            )

    def generate_semesters(self):
        for _ in range(3):
            Semester.objects.create(
                name=f'Semester {_ + 1}',
                year=f'{fake.year()} - {fake.year()}',
                started_date=fake.date_between(start_date='-2y', end_date='today'),
                ended_date=fake.date_between(start_date='today', end_date='+1y')
            )

    def generate_student_classrooms(self):
        departments = Department.objects.all()
        for _ in range(5):
            StudentClassRoom.objects.create(
                name=fake.bothify(text='CLS####'),
                department=random.choice(departments)
            )

    def generate_teachers(self):
        departments = Department.objects.all()
        role_teacher = Role.objects.get(name=RoleEnum.TEACHER)
        for _ in range(10):
            teacher = Teacher.objects.create(
                username=fake.user_name(),
                code=fake.bothify(text='T####'),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                dob=fake.date_of_birth(),
                address=fake.address(),
                email=fake.email(),
                role=role_teacher,
                department=random.choice(departments)
            )
            teacher.set_password('password')  # Set a default password
            teacher.save()

    def generate_subjects(self):
        for _ in range(5):
            Subject.objects.create(
                name=fake.catch_phrase(),
                code=fake.bothify(text='SUB####'),
                description=fake.text(),
                image=fake.image_url()
            )

    def generate_study_classrooms(self):
        subjects = Subject.objects.all()
        teachers = Teacher.objects.all()
        groups = Group.objects.all()
        semesters = Semester.objects.all()

        for _ in range(5):
            StudyClassRoom.objects.create(
                name=fake.bothify(text='C####'),
                subject=random.choice(subjects),
                teacher=random.choice(teachers),
                group=random.choice(groups),
                semester=random.choice(semesters),
                started_date=timezone.now(),
                ended_date=timezone.now() + timezone.timedelta(days=random.randint(30, 90))
            )

    def generate_students(self):
        student_classrooms = StudentClassRoom.objects.all()
        role_student = Role.objects.get(name=RoleEnum.STUDENT)
        for _ in range(10):
            student = Student.objects.create(
                username=fake.user_name(),
                code=fake.bothify(text='S####'),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                dob=fake.date_of_birth(),
                address=fake.address(),
                email=fake.email(),
                role=role_student,
                studentclassroom=random.choice(student_classrooms)
            )
            student.set_password('password')  # Set a default password
            student.save()

    def generate_topics(self):
        study_classrooms = StudyClassRoom.objects.all()
        for _ in range(10):
            Topic.objects.create(
                title=fake.sentence(),
                studyclassroom=random.choice(study_classrooms)
            )

    def generate_comments(self):
        topics = Topic.objects.all()
        students = Student.objects.all()

        for _ in range(20):
            comment = Comment.objects.create(
                user=random.choice(students),
                topic=random.choice(topics),
                content=fake.sentence()
            )
            # Create Comment Files
            for _ in range(random.randint(1, 3)):
                CommentFile.objects.create(
                    comment=comment,
                    file_url=fake.url(),
                    file_name=fake.file_name(),
                    file_public_id=fake.uuid4(),
                    file_asset_id=fake.uuid4(),
                    file_resource_type=random.choice(['image', 'video', 'document']),
                    file_type=fake.file_extension()
                )

    def generate_score_columns(self):
        study_classrooms = StudyClassRoom.objects.all()
        for _ in range(10):
            ScoreColumn.objects.create(
                type=fake.word(),
                percent=random.randint(10, 50),
                studyclassroom=random.choice(study_classrooms)
            )

    def generate_studies(self):
        students = Student.objects.all()
        study_classrooms = StudyClassRoom.objects.all()

        for _ in range(10):
            Study.objects.create(
                student=random.choice(students),
                studyclassroom=random.choice(study_classrooms)
            )

    def generate_score_details(self):
        studies = Study.objects.all()
        score_columns = ScoreColumn.objects.all()

        for _ in range(20):
            ScoreDetails.objects.create(
                score=round(random.uniform(0, 10), 2),
                study=random.choice(studies),
                scorecolumn=random.choice(score_columns)
            )

    def generate_point_conversions(self):
        for _ in range(5):
            PointConversion.objects.create(
                ten_point_scale_max=round(random.uniform(5.0, 10.0), 1),
                ten_point_scale_min=round(random.uniform(0.0, 5.0), 1),
                four_point_scale=round(random.uniform(0.0, 4.0), 2),
                grade=random.choice(['A', 'B', 'C', 'D', 'F'])
            )

    def generate_events(self):
        semesters = Semester.objects.all()
        departments = Department.objects.all()

        for _ in range(5):
            Event.objects.create(
                started_time=fake.date_time_between(start_date='-1y', end_date='now'),
                ended_time=fake.date_time_between(start_date='now', end_date='+1y'),
                description=fake.sentence(),
                semester=random.choice(semesters),
                department=random.choice(departments),
                content=fake.text()
            )

    def generate_attendance(self):
        schedules = Schedule.objects.all()
        studies = Study.objects.all()

        for _ in range(10):
            Attend.objects.create(
                status=random.choice(['P', 'A']),
                study=random.choice(studies),
                schedule=random.choice(schedules)
            )
