import cloudinary.uploader
from rest_framework import serializers
from score.models import *


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'code', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data, request=None):
        data = validated_data.copy()
        avatar_file = request.data.get('avatar', None) if request else None
        if avatar_file:
            new_avatar = cloudinary.uploader.upload(avatar_file)
            data['avatar'] = new_avatar['secure_url']
        user = User(**data)
        user.set_password(data["password"])
        user.save()
        return user

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class MembersOfChatRoomSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()
    username = serializers.CharField()
    avatar = serializers.CharField()
    role = serializers.CharField()


class TeacherSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name')

    class Meta:
        model = Teacher
        fields = ['id', 'code', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role',
                  'department_name']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data, request=None):
        data = validated_data.copy()
        avatar_file = request.data.get('avatar', None) if request else None
        if avatar_file:
            new_avatar = cloudinary.uploader.upload(avatar_file)
            data['avatar'] = new_avatar['secure_url']
        user = User(**data)
        user.set_password(data["password"])
        user.save()
        return user

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class StudentSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='studentclassroom.department.name')
    studentclassroom_name = serializers.CharField(source='studentclassroom.name')

    class Meta:
        model = Student
        fields = ['id', 'code', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar', 'role',
                  'department_name', 'studentclassroom_name']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data, request=None):
        data = validated_data.copy()
        avatar_file = request.data.get('avatar', None) if request else None
        if avatar_file:
            new_avatar = cloudinary.uploader.upload(avatar_file)
            data['avatar'] = new_avatar['secure_url']
        user = User(**data)
        user.set_password(data["password"])
        user.save()
        return user

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
        fields = ['id', 'code', 'name', 'image', 'created_date', 'active']


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


class ScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='studyclassroom.subject.name')
    subject_code = serializers.CharField(source='studyclassroom.subject.code')
    studyclassroom_name = serializers.CharField(source='studyclassroom.name')
    studyclassroom_group = serializers.CharField(source='studyclassroom.group.name')
    teacher_name = serializers.SerializerMethodField()

    def get_teacher_name(self, obj):
        return obj.studyclassroom.teacher.last_name + ' ' + obj.studyclassroom.teacher.first_name

    class Meta:
        model = Schedule
        fields = ['id', 'started_time', 'ended_time', 'descriptions', 'subject_code', 'subject_name',
                  'studyclassroom_name', 'studyclassroom_group', 'teacher_name']


class ListEventSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    department_name = serializers.CharField()
    semester_name = serializers.CharField()
    semester_year = serializers.CharField()
    content = serializers.CharField()
    created_date = serializers.DateTimeField()
    seen = serializers.BooleanField()


class StudyClassRoomForRegisterSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    subject_code = serializers.CharField()
    subject_name = serializers.CharField()
    teacher_name = serializers.CharField()
    group_name = serializers.CharField()
    semester_name = serializers.CharField()
    semester_year = serializers.CharField()
    started_date = serializers.DateField()
    ended_date = serializers.DateField()
    isregister = serializers.BooleanField()
    total_student = serializers.IntegerField()


class StudyClassRoomSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name')
    subject_code = serializers.CharField(source='subject.code')
    teacher_name = serializers.SerializerMethodField()
    semester_name = serializers.CharField(source='semester.name')
    semester_year = serializers.CharField(source='semester.year')
    group_name = serializers.CharField(source='group.name')

    def get_teacher_name(self, obj):
        return obj.teacher.last_name + ' ' + obj.teacher.first_name

    class Meta:
        model = StudyClassRoom
        fields = ['id', 'name', 'subject_code', 'subject_name', 'teacher_name', 'group_name', 'semester_name',
                  'semester_year', 'started_date', 'ended_date', 'islock', 'isregister']


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
        fields = ['id', 'content', 'created_date', 'updated_date', 'user', 'topic_id', 'topic_title']


class CommentFileSerializer(serializers.ModelSerializer):
    comment_id = serializers.IntegerField(source='comment.id')

    class Meta:
        model = CommentFile
        fields = ['id', 'file_url', 'file_name', 'comment_id']


class StudentsOfStudyClassRoom(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_code = serializers.CharField(source='student.code')
    student_email = serializers.CharField(source='student.email')
    student_avatar = serializers.CharField(source='student.avatar')

    def get_student_name(self, obj):
        return obj.student.last_name + ' ' + obj.student.first_name

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
        return obj.student.last_name + ' ' + obj.student.first_name

    class Meta:
        model = Study
        fields = ['id', 'student_id', 'student_code', 'student_name', 'student_email', 'student_avatar']


class ScoreColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreColumn
        fields = ['id', 'type', 'percent']


class ScoreDetailSerializer(serializers.ModelSerializer):
    study = StudySerializer()
    scorecolumn_id = serializers.IntegerField(source='scorecolumn.id')
    scorecolumn_type = serializers.CharField(source='scorecolumn.type')
    scorecolumn_percent = serializers.IntegerField(source='scorecolumn.percent')

    class Meta:
        model = ScoreDetails
        fields = ['id', 'study', 'scorecolumn_id', 'scorecolumn_type', 'scorecolumn_percent', 'score']


class SDSerializer(serializers.Serializer):
    col_id = serializers.IntegerField()
    col_type = serializers.CharField()
    score = serializers.FloatField()


class StudyResultSerializer(serializers.Serializer):
    subject_name = serializers.CharField()
    subject_code = serializers.CharField()
    semester_name = serializers.CharField()
    semester_year = serializers.CharField()
    ten_point_scale = serializers.DecimalField(max_digits=3, decimal_places=1)
    four_point_scale = serializers.DecimalField(max_digits=3, decimal_places=1)
    grade = serializers.CharField()
    result = serializers.BooleanField()
    scoredetails = SDSerializer(many=True)


class ScoreSerializer(serializers.Serializer):
    col_id = serializers.IntegerField()
    score = serializers.FloatField()


class ScoreDetailsSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_code = serializers.CharField()
    student_name = serializers.CharField()
    scores = ScoreSerializer(many=True)


class ScoresSerializer(serializers.Serializer):
    score_cols = ScoreColumnSerializer(many=True)
    score_details = ScoreDetailsSerializer(many=True)


class SchedulesSerializer(serializers.Serializer):
    schedule_id = serializers.IntegerField()
    started_time = serializers.DateTimeField()
    ended_time = serializers.DateTimeField()
    status = serializers.CharField()


class AttendModelSerializer(serializers.Serializer):

    class Meta:
        model = Attend
        fields = ['__all__']


class AttendOfStudyclassroomSerializer(serializers.Serializer):
    study_id = serializers.IntegerField()
    student_id = serializers.IntegerField()
    student_code = serializers.CharField()
    student_name = serializers.CharField()
    student_email = serializers.CharField()
    statuses = SchedulesSerializer(many=True)


class McSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'started_time', 'ended_time']


class AttendsSerializer(serializers.Serializer):
    schedule_cols = McSerializer(many=True)
    attend_details = AttendOfStudyclassroomSerializer(many=True)


class ListRegisterStudySerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source='studyclassroom.subject.code')
    subject_name = serializers.CharField(source='studyclassroom.subject.name')
    group_name = serializers.CharField(source='studyclassroom.group.name')
    started_date = serializers.DateField(source='studyclassroom.started_date')
    ended_date = serializers.DateField(source='studyclassroom.ended_date')

    class Meta:
        model = Study
        fields = ['id', 'subject_code', 'subject_name', 'group_name', 'created_date', 'active', 'started_date',
                  'ended_date']
