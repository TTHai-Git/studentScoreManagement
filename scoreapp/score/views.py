from django.http import HttpResponse
from rest_framework import viewsets, permissions, generics, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from score.models import *
from score import serializers, pagination, perms


def index(request):
    return HttpResponse("CourseApp")


class UserViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action.__eq__('current-user'):
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_name='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()
        return Response(serializers.UserSerializer(user).data)


class TeacherViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Teacher.objects.all()
    serializer_class = serializers.TeacherSerializer
    pagination_class = pagination.TeacherPaginator

    def get_queryset(self):
        teacher = self.request.user
        queryset = self.queryset
        if self.action.__eq__('list'):
            queryset = queryset.filter(id=teacher.id)
        return queryset

    @action(methods=['get'], url_path='student-scoredetails', detail=False)
    def get_student_scoredetails(self, request):
        code = request.query_params.get('code')
        first_name = request.query_params.get('first_name')
        last_name = request.query_params.get('last_name')

        if code:
            student = Student.objects.filter(code=code).first()
        else:
            if last_name and first_name:
                student = Student.objects.filter(last_name=last_name, first_name=first_name).first()
        studies = student.study_set.select_related('student')
        scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')
        paginator = pagination.ScoreDetailsPaginator()
        page = paginator.paginate_queryset(scoredetails, request)
        if page is not None:
            serializer = serializers.ScoreDetailsSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response(serializers.ScoreDetailsSerializer(), status.HTTP_200_OK)


class StudyClassRoomViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = StudyClassRoom.objects.all()
    serializer_class = serializers.StudyClassRoomSerializer
    pagination_class = pagination.StudyClassRoomPaginator

    def get_queryset(self):
        teacher = self.request.user
        queryset = self.queryset
        if self.action.__eq__('list'):
            queryset = queryset.filter(teacher=teacher)
        return queryset

    @action(methods=['get'], url_path='students', detail=True)
    def get_students_studyclassroom(self, request, pk):
        studyclassroom = self.get_object()
        teacher = request.user
        if studyclassroom.teacher.id == teacher.id:
            studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
            paginator = pagination.StudyPaginator()
            page = paginator.paginate_queryset(studies, request)

            if page is not None:
                serializer = serializers.StudySerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            return Response(serializers.StudySerializer(), status.HTTP_200_OK)
        else:
            return Response({"message": "Bạn không có quyền xem danh sách học sinh của lớp này."},
                            status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['get'], url_path='students/scores', detail=True)
    def get_score_students_studyclassroom(self, request, pk):
        teacher = self.request.user
        studyclassroom = self.get_object()
        if studyclassroom.teacher.id == teacher.id:
            studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
            scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')
            paginator = pagination.ScoreDetailsPaginator()
            page = paginator.paginate_queryset(scoredetails, request)
            if page is not None:
                serializer = serializers.ScoreDetailsSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            return Response(serializers.ScoreDetailsSerializer(), status.HTTP_200_OK)

        else:
            return Response({"message": "Bạn không có quyền xem bảng điểm của lớp học này."},
                            status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['get', 'post'], url_path='students/add-scores', detail=True)
    def add_score_students_studyclassroom(self, request, pk):
        try:
            student_id = request.query_params.get('student_id')
            scorecolumn_id = request.query_params.get('scorecolumn_id')
            score = request.query_params.get('score')

            teacher = request.user
            stuyclassroom = self.get_object()

            student_id = int(student_id)
            scorecolumn_id = int(scorecolumn_id)
            score = float(score)

            if stuyclassroom.teacher.id == teacher.id:

                student = Student.objects.get(id=student_id)
                study = Study.objects.get(student=student, studyclassroom=stuyclassroom)

                scorecolumn = ScoreColumn.objects.get(id=scorecolumn_id, studyclassroom=stuyclassroom)

                scoredetails = ScoreDetails.objects.create(study=study, scorecolumn=scorecolumn, score=score)

                return Response(serializers.ScoreDetailsSerializer(scoredetails).data, status=status.HTTP_201_CREATED)

            else:
                return Response({"message": "Bạn không có quyền nhập bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)

        except Exception as ex:
            return Response({"message_error": str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = serializers.StudentSerializer
    pagination_class = pagination.StudentPaginator

    def get_queryset(self):
        student = self.request.user
        queryset = self.queryset
        if self.action.__eq__('list'):
            queryset = queryset.filter(id=student.id)
        return queryset

    @action(methods=['get'], url_path='studies', detail=True)
    def get_details_study(self, request, pk):
        student = self.get_object()
        if request.user.id == student.id:
            sub_name = request.query_params.get('sub_name')
            studies = student.study_set.select_related('student')
            if sub_name:
                subject = Subject.objects.filter(name__icontains=sub_name)
                studyclassroom = StudyClassRoom.objects.filter(subject__in=subject)
                studies = studies.filter(studyclassroom__in=studyclassroom)
            scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')
            paginator = pagination.ScoreDetailsPaginator()
            page = paginator.paginate_queryset(scoredetails, request)
            if page is not None:
                serializer = serializers.ScoreDetailsSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            return Response(serializers.ScoreDetailsSerializer(), status.HTTP_200_OK)
        else:
            return Response({"message": "Bạn không có quyền xem thông tin học tập của học sinh khác."},
                            status=status.HTTP_401_UNAUTHORIZED)
