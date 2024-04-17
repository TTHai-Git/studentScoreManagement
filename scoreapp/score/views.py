from django.http import HttpResponse
from rest_framework import viewsets, permissions, generics, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from score.models import *
from score import serializers, pagination, perms


def index(request):
    return HttpResponse("CourseApp")


class TeacherViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Teacher.objects.all()
    serializer_class = serializers.TeacherSerializer
    pagination_class = pagination.TeacherPaginator


class StudyClassRoomViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = StudyClassRoom.objects.all()
    serializer_class = serializers.StudyClassRoomSerializer
    pagination_class = pagination.StudyClassRoomPaginator

    @action(methods=['get'], url_path='students', detail=False)
    def get_students(self, request):
        # khi nào làm chức năng authentication, authorization thi đổi thành
        # Teacher.objects.filter(user_ptr_id=request.user.id)
        teacher = Teacher.objects.filter(user_ptr_id=3)# id của user là Teacher
        studyclassrooms = StudyClassRoom.objects.filter(teacher__in=teacher).order_by('-id')

        scr_id = request.query_params.get('scr_id')

        if scr_id is not None:
            studyclassrooms = StudyClassRoom.objects.filter(teacher__in=teacher, id=scr_id).order_by('-id')

        studies = Study.objects.filter(studyclassroom__in=studyclassrooms).order_by('studyclassroom_id')
        paginator = pagination.StudyPaginator()
        page = paginator.paginate_queryset(studies, request)

        if page is not None:
            serializer = serializers.StudySerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.StudySerializer(), status.HTTP_200_OK)


class StudentViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = serializers.StudentSerializer
    pagination_class = pagination.StudentPaginator

    @action(methods=['get'], url_path='studies', detail=True)
    def get_details_study(self, request, pk):
        studies = self.get_object().study_set.select_related('student')
        scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')
        paginator = pagination.ScoreDetailsPaginator()
        page = paginator.paginate_queryset(scoredetails, request)
        if page is not None:
            serializer = serializers.ScoreDetailsSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        return Response(serializers.ScoreDetailsSerializer(), status.HTTP_200_OK)

