import csv
import os

from django.http import HttpResponse
from rest_framework import viewsets, permissions, generics, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from score.models import *
from score import serializers, pagination, perms
from scoreapp.settings import STATIC_URL


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
            if not student:
                return Response("Không tìm thấy sinh viên", status=status.HTTP_404_NOT_FOUND)

        elif last_name and first_name:
            students = Student.objects.filter(last_name__icontains=last_name, first_name__icontains=first_name)

            if not students:
                return Response("Không tìm thấy sinh viên", status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                "Hãy cung cấp mssv 'code' hoặc tên 'first_name' và họ 'last_name' của sinh viên cần xem thông tin học tập",
                status=status.HTTP_400_BAD_REQUEST)

        scoredetails = ScoreDetails.objects.filter(study__student__in=students).order_by('id')

        paginator = pagination.ScoreDetailsPaginator()
        page = paginator.paginate_queryset(scoredetails, request)

        serializer = serializers.ScoreDetailsSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class StudyClassRoomViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = StudyClassRoom.objects.all()
    serializer_class = serializers.StudyClassRoomSerializer
    pagination_class = pagination.StudyClassRoomPaginator

    def get_queryset(self):
        teacher = self.request.user
        queryset = self.queryset
        if self.action == 'list':
            queryset = queryset.filter(teacher=teacher)
        return queryset

    @action(methods=['get'], url_path='students', detail=True)
    def get_students_studyclassroom(self, request, pk):
        teacher = Teacher.objects.get(id=request.user.id)
        studyclassroom = self.get_object()
        if studyclassroom.teacher == teacher:
            studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
            paginator = pagination.StudyPaginator()
            page = paginator.paginate_queryset(studies, request)

            if page is not None:
                serializer = serializers.StudySerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            return Response(serializers.StudySerializer(), status=status.HTTP_200_OK)
        else:
            return Response({"message": "Bạn không có quyền xem danh sách học sinh của lớp này."},
                            status=status.HTTP_401_UNAUTHORIZED)

    def get_score_students_studyclassroom(self, request, pk):
        teacher = Teacher.objects.get(id=request.user.id)
        studyclassroom = self.get_object()
        if studyclassroom.teacher == teacher:
            studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
            scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')
            paginator = pagination.ScoreDetailsPaginator()
            page = paginator.paginate_queryset(scoredetails, request)
            if page is not None:
                serializer = serializers.ScoreDetailsSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
            return Response(serializers.ScoreDetailsSerializer(), status=status.HTTP_200_OK)
        else:
            return Response({"message": "Bạn không có quyền xem bảng điểm của lớp học này."},
                            status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['get', 'post'], url_path='students/add-scores', detail=True)
    def add_score_students_studyclassroom(self, request, pk):
        try:
            student_id = int(request.query_params.get('student_id'))
            scorecolumn_id = int(request.query_params.get('scorecolumn_id'))
            score = float(request.query_params.get('score'))

            teacher = Teacher.objects.get(id=request.user.id)
            studyclassroom = self.get_object()

            if studyclassroom.teacher == teacher:
                student = Student.objects.get(id=student_id)
                study = Study.objects.get(student=student, studyclassroom=studyclassroom)

                scorecolumn = ScoreColumn.objects.get(id=scorecolumn_id, studyclassroom=studyclassroom)

                scoredetails = ScoreDetails.objects.create(study=study, scorecolumn=scorecolumn, score=score)

                return Response(serializers.ScoreDetailsSerializer(scoredetails).data, status=status.HTTP_201_CREATED)

            else:
                return Response({"message": "Bạn không có quyền nhập bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)
        except (ValueError, Student.DoesNotExist, Study.DoesNotExist, ScoreColumn.DoesNotExist) as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get', 'patch'], url_path='students/update-scores', detail=True)
    def update_score_students_studyclassroom(self, request, pk):
        try:
            student_id = int(request.query_params.get('student_id'))
            scorecolumn_id = int(request.query_params.get('scorecolumn_id'))
            updated_score = float(request.query_params.get('updated_score'))

            teacher = Teacher.objects.get(id=request.user.id)
            studyclassroom = self.get_object()

            if studyclassroom.teacher == teacher:
                student = Student.objects.get(id=student_id)
                study = Study.objects.get(student=student, studyclassroom=studyclassroom)

                scorecolumn = ScoreColumn.objects.get(id=scorecolumn_id, studyclassroom=studyclassroom)

                scoredetails = ScoreDetails.objects.get(study=study, scorecolumn=scorecolumn)

                scoredetails.score = updated_score
                scoredetails.save()

                return Response(serializers.ScoreDetailsSerializer(scoredetails).data, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Bạn không có quyền nhập bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)
        except (ValueError, Student.DoesNotExist, Study.DoesNotExist, ScoreColumn.DoesNotExist,
                ScoreDetails.DoesNotExist) as ex:
            return Response({"message_error": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True)
    def locked_score_of_studyclassroom(self, request, pk=None):
        try:
            studyclassroom = StudyClassRoom.objects.get(pk=pk)
            teacher = Teacher.objects.get(id=request.user.id)

            if studyclassroom.teacher == teacher:
                studyclassroom.islock = True
                studyclassroom.save()

                return Response(serializers.StudyClassRoomSerializer(studyclassroom).data,
                                status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Bạn không có quyền khóa bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)
        except (StudyClassRoom.DoesNotExist, Teacher.DoesNotExist):
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='students/export-csv-scores', detail=True)
    def export_csv_scores_students_studyclassroom(self, request, pk):
        teacher = Teacher.objects.get(id=request.user.id)
        studyclassroom = self.get_object()
        if studyclassroom.teacher.__eq__(teacher):
            studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
            scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')

            # Retrieve the serialized data
            serializer = serializers.ScoreDetailsSerializer(scoredetails, many=True)
            serialized_data = serializer.data

            # Prepare the data for CSV export
            csv_data = []
            for result in serialized_data:
                csv_row = [
                    result['id'],
                    result['study']['student_code'],
                    result['study']['student_name'],
                    result['scorecolumn_type'],
                    result['scorecolumn_percent'],
                    result['score']
                ]
                csv_data.append(csv_row)

            # Construct the file name based on studyclassroom name
            filename = os.path.join('F:\PythonProject\studentScoreManagement\scoreapp\score\static\Score_csv',
                                    f"{studyclassroom.name} - {studyclassroom.subject.name}_Bảng Điểm Tổng Hợp.csv")

            # Write the data to a CSV file with UTF-8 encoding
            with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                csv_writer = csv.writer(csvfile)
                csv_writer.writerow(['ID', 'MSSV', 'Họ Và Tên', 'Loại Cột Điểm', 'Trọng Số', 'Điểm'])
                csv_writer.writerows(csv_data)

            # Return a response indicating successful CSV export
            return Response({'message': 'CSV file exported successfully.', 'file_name': filename},
                            status=status.HTTP_200_OK)

        else:
            return Response({"message": "Bạn không có quyền xuất bảng điểm của lớp học này."},
                            status=status.HTTP_401_UNAUTHORIZED)


class StudentViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = serializers.StudentSerializer
    pagination_class = pagination.StudentPaginator

    def get_queryset(self):
        if self.action == 'list':
            return self.queryset.filter(id=self.request.user.id)
        return self.queryset

    @action(methods=['get'], url_path='studies', detail=True)
    def get_details_study(self, request, pk=None):
        student = Student.objects.get(pk=pk)
        sub_name = request.query_params.get('sub_name')

        studies = student.study_set.select_related('student')
        if sub_name:
            subjects = Subject.objects.filter(name__icontains=sub_name)
            studyclassrooms = StudyClassRoom.objects.filter(subject__in=subjects)
            studies = studies.filter(studyclassroom__in=studyclassrooms)

        scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')

        paginator = pagination.ScoreDetailsPaginator()
        page = paginator.paginate_queryset(scoredetails, request)

        serializer = serializers.ScoreDetailsSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data) if page else Response("Không tìm thấy kết quả học tập",
                                                                                       status=status.HTTP_404_NOT_FOUND)
