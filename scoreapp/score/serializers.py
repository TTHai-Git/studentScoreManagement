from rest_framework import serializers
from score.models import *


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        data = validated_data.copy()
        user = Student(**data)
        user.set_password(data["password"])
        user.save()

        return user

    def update(self, instance, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(data["password"])
        user.set_avatar(data["avatar"])
        user.save()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class TeacherSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        data = validated_data.copy()
        user = Teacher(**data)
        user.set_password(data["password"])
        user.save()

        return user

    def update(self, instance, validated_data):
        data = validated_data.copy()
        user = Teacher(**data)
        user.set_password(data["password"])
        user.set_avatar(data["avatar"])
        user.save()

    class Meta:
        model = Teacher
        fields = ['id', 'code', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class StudentSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        data = validated_data.copy()
        user = Student(**data)
        user.set_password(data["password"])
        user.save()

        return user

    def update(self, instance, validated_data):
        data = validated_data.copy()
        user = Student(**data)
        user.set_password(data["password"])
        user.set_avatar(data["avatar"])
        user.save()

    class Meta:
        model = Student
        fields = ['id', 'code', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['image'] = instance.image.url if instance.image else None
        return rep


class SubjectSerializer(ItemSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'image', 'created_date', 'active']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


class GroupSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name')

    class Meta:
        model = Group
        fields = ['id', 'name', 'department_name']


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ['id', 'name', 'year']


class StudentClassRoom(serializers.ModelSerializer):
    class Meta:
        model = StudyClassRoom
        fields = ['id', 'name', 'department']


class StudyClassRoomSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name')
    teacher_name = serializers.SerializerMethodField()
    semester = SemesterSerializer()
    group = GroupSerializer()

    def get_teacher_name(self, obj):
        return obj.teacher.last_name + ' ' + obj.teacher.first_name

    class Meta:
        model = StudyClassRoom
        fields = ['id', 'name', 'subject_name', 'teacher_name', 'group', 'semester', 'islock']


class TopicSerializer(serializers.ModelSerializer):
    studyclassroom = StudyClassRoomSerializer()

    class Meta:
        model = Topic
        fields = ['id', 'title', 'created_date', 'active', 'studyclassroom']


class UserCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'avatar', 'role']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class CommentSerializer(serializers.ModelSerializer):
    user = UserCommentSerializer()
    topic_id = serializers.CharField(source='topic.id')
    topic_title = serializers.CharField(source='topic.title')

    class Meta:
        model = Comment
        fields = ['topic_id', 'topic_title', 'id', 'content', 'created_date', 'updated_date', 'user']


class StudentsOfStudyClassRoom(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_code = serializers.CharField(source='student.code')
    student_email = serializers.CharField(source='student.email')
    student_avatar = serializers.CharField(source='student.avatar')

    def get_student_name(self, obj):
        return obj.student.last_name + ' ' + obj.student.first_name;

    class Meta:
        model = Study
        fields = ['id', 'student_code', 'student_name', 'student_email', 'student_avatar']


class StudyOfStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Study
        fields = '__all__'


class StudySerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source='student.id')
    student_name = serializers.SerializerMethodField()
    student_code = serializers.CharField(source='student.code')
    student_email = serializers.CharField(source='student.email')
    student_avatar = serializers.CharField(source='student.avatar')

    def get_student_name(self, obj):
        return obj.student.last_name + ' ' + obj.student.first_name;

    class Meta:
        model = Study
        fields = ['id', 'student_id', 'student_code', 'student_name', 'student_email', 'student_avatar']


class ScoreColumnSerializer(serializers.ModelSerializer):
    studyclassroom = StudyClassRoomSerializer()

    class Meta:
        model = ScoreColumn
        fields = ['id', 'type', 'percent', 'studyclassroom']


class ScoreDetailsSerializer(serializers.ModelSerializer):
    study = StudySerializer()
    scorecolumn_id = serializers.IntegerField(source='scorecolumn.id')
    scorecolumn_type = serializers.CharField(source='scorecolumn.type')
    scorecolumn_percent = serializers.IntegerField(source='scorecolumn.percent')

    class Meta:
        model = ScoreDetails
        fields = ['id', 'study', 'scorecolumn_id','scorecolumn_type', 'scorecolumn_percent', 'score']


class StudyResultOfStudent(serializers.ModelSerializer):
    group_name = serializers.CharField(source='study.studyclassroom.group.name')
    teacher_name = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='study.studyclassroom.subject.name')
    semester_name = serializers.CharField(source='study.studyclassroom.semester.name')
    semester_year = serializers.CharField(source='study.studyclassroom.semester.year')
    scorecolumn_type = serializers.CharField(source='scorecolumn.type')
    scorecolumn_percent = serializers.IntegerField(source='scorecolumn.percent')

    def get_teacher_name(self, obj):
        return obj.study.studyclassroom.teacher.last_name + ' ' + obj.study.studyclassroom.teacher.first_name;

    class Meta:
        model = ScoreDetails
        fields = ['id', 'group_name', 'subject_name', 'teacher_name', 'semester_name', 'semester_year',
                  'scorecolumn_type', 'scorecolumn_percent',
                  'score']
