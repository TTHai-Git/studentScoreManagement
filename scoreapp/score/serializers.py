from rest_framework import serializers
from score.models import *


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
    class Meta:
        model = Group
        fields = ['id', 'department']


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ['id', 'name', 'year']


class StudentClassRoom(serializers.ModelSerializer):
    class Meta:
        model = StudyClassRoom
        fields = ['id', 'name', 'department']


class TeacherSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        data = validated_data.copy()
        user = Teacher(**data)
        user.set_code(data["code"])
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
        model = Teacher
        fields = ['id', 'code', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar']
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
        user.set_code(data["code"])
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
        fields = ['id', 'code', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
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
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'email', 'avatar']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class StudyClassRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyClassRoom
        fields = ['id', 'name', 'subject', 'teacher', 'group', 'semester', 'islock']


class TopicSerializer(ItemSerializer):
    studyclassrom = StudyClassRoomSerializer()

    class Meta:
        model = Topic
        fields = ['id', 'subject', 'created_date', 'image', 'updated_date', 'studyclassrom', 'content']


class UserCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'avatar']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['avatar'] = instance.avatar.url
        return rep


class CommentSerializer(serializers.ModelSerializer):
    user = UserCommentSerializer()
    topic = TopicSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_date', 'updated_date', 'user', 'topic']


class StudySerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    studyclassroom = StudyClassRoomSerializer()

    class Meta:
        model = Study
        fields = ['id', 'student', 'studyclassroom']


class ScoreColumnSerializer(serializers.ModelSerializer):
    studyclassroom = StudyClassRoomSerializer()

    class Meta:
        model = ScoreColumn
        fields = ['id', 'type', 'percent', 'studyclassroom']


class ScoreDetailsSerializer(serializers.ModelSerializer):
    study = StudySerializer()
    scorecolumn = ScoreColumnSerializer(many=False)

    class Meta:
        model = ScoreDetails
        fields = ['id', 'study', 'scorecolumn', 'score']
