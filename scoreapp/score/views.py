import csv
import os
from django.core.mail import send_mail
from rest_framework import viewsets, permissions, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from score.models import *
from score import serializers, pagination, perms
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from django.http import HttpResponse

from scoreapp import settings


def index(request):
    return HttpResponse("CourseApp")


class UserViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    pagination_class = pagination.UserPaginator
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action.__eq__('get_current_user'):
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='current-user', detail=False)
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

    # def get_queryset(self):
    #     teacher = self.request.user
    #     queryset = self.queryset
    #     if self.action.__eq__('list'):
    #         queryset = queryset.filter(id=teacher.id)
    #     return queryset

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


class TopicViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Topic.objects.all()
    serializer_class = serializers.TopicSerializer
    pagination_class = pagination.TopicPaginator

    def get_permissions(self):
        if self.action == 'add_comment':
            return [permissions.IsAuthenticated(), perms.CanCommentOnPost()]
        else:
            return [permissions.AllowAny()]

    @action(methods=['post'], url_path='add-comment', detail=True)
    def add_comment(self, request, pk):
        try:
            topic = self.get_object()
            user = request.user
            content = request.data.get('content')
            if topic.active:
                if content:
                    comment = Comment.objects.create(content=content, user=user, topic=topic)
                else:
                    return Response({"message": "Thiếu thông tin content trong request"},
                                    status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message": "Topic này đã bị khóa!!! Bạn không thể comment vào topic này được nữa"},
                                status=status.HTTP_400_BAD_REQUEST)
        except Exception as ex:
            return Response({"message": str(ex)}
                            , status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializers.CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='comments', detail=True)
    def get_comments(self, request, pk):
        topic = self.get_object()
        try:
            comments = topic.comment_set.select_related('user').order_by('-id')
            paginator = pagination.CommentPaginator()
            page = paginator.paginate_queryset(comments, request)
            if page is not None:
                serializer = serializers.CommentSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)
        except topic.DoesNotExist | KeyError:
            return Response({"message": "Không tìm thấy topic!!!"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response({"message": str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializers.CommentSerializer(comments, many=True).data, status=status.HTTP_200_OK)


class StudyClassRoomViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = StudyClassRoom.objects.all()
    serializer_class = serializers.StudyClassRoomSerializer
    pagination_class = pagination.StudyClassRoomPaginator

    # def get_queryset(self):
    #     teacher = self.request.user
    #     queryset = self.queryset
    #     if self.action == 'list':
    #         queryset = queryset.filter(teacher=teacher)
    #     return queryset

    def get_permissions(self):
        if self.action in ['get_students_studyclassroom', 'get_students_scores_studyclassroom',
                           'add_score_students_studyclassroom', 'update_score_students_studyclassroom',
                           'locked_score_of_studyclassroom', 'export_csv_scores_students_studyclassroom', 'add_topic']:
            return [permissions.IsAuthenticated(), perms.isTeacherOfStudyClassRoom()]
        return [permissions.AllowAny()]

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

    @action(methods=['get'], url_path='students/scores', detail=True)
    def get_students_scores_studyclassroom(self, request, pk):
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

    @action(methods=['post'], url_path='students/add-scores', detail=True)
    def add_score_students_studyclassroom(self, request, pk):
        try:
            student_id = int(request.data.get('student_id'))
            scorecolumn_id = int(request.data.get('scorecolumn_id'))
            score = float(request.data.get('score'))

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

    @action(methods=['patch'], url_path='students/update-scores', detail=True)
    def update_score_students_studyclassroom(self, request, pk):
        try:
            student_id = int(request.data.get('student_id'))
            scorecolumn_id = int(request.data.get('scorecolumn_id'))
            updated_score = float(request.data.get('updated_score'))

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

    @action(methods=['PATCH'], url_path='locked-score-of-studyclassroom', detail=True)
    def locked_score_of_studyclassroom(self, request, pk):
        try:
            studyclassroom = self.get_object()
            teacher = Teacher.objects.get(id=request.user.id)
            study = studyclassroom.study_set.select_related('studyclassroom')

            serializer = serializers.StudySerializer(study, many=True)
            serialized_data = serializer.data

            if studyclassroom.teacher == teacher:
                studyclassroom.islock = not studyclassroom.islock
                studyclassroom.save()

                for result in serialized_data:
                    subject = f'THÔNG BÁO ĐIỂM - ' \
                              f'Lớp học: {studyclassroom.name} - Môn học: {studyclassroom.subject.name} - ' \
                              f'Thầy: {teacher.last_name} {teacher.first_name}'
                    message = ' Đã khóa điểm, sinh vien vui lòng vào trang web để kiểm tra điểm của mình'
                    email_from = settings.EMAIL_HOST_USER
                    recipient_list = [result['student_email']]

                    send_mail(subject, message, email_from, recipient_list, fail_silently=False)

            else:
                return Response({"message": "Bạn không có quyền khóa bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)

        except (StudyClassRoom.DoesNotExist, Teacher.DoesNotExist):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return Response(serializers.StudyClassRoomSerializer(studyclassroom).data,
                        status=status.HTTP_201_CREATED)

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

    @action(methods=['get'], url_path='students/export-pdf-scores', detail=True)
    def export_pdf_scores_students_studyclassroom(self, request, pk):
        teacher = Teacher.objects.get(id=request.user.id)
        studyclassroom = self.get_object()
        if studyclassroom.teacher.__eq__(teacher):
            studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
            scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')

            # Prepare the data for PDF export
            data = [['Code', 'Name', 'Giữa Kỳ', 'Cuối Kỳ']]

            # Dictionary to store scores for each student
            student_scores = {}

            for result in scoredetails:
                student_code = result.study.student.code
                if student_code not in student_scores:
                    student_name = f"{result.study.student.last_name} {result.study.student.first_name}"
                    student_scores[student_code] = {
                        'Name': student_name,
                        'Giữa Kỳ': '',
                        'Cuối Kỳ': ''
                    }

                # Assign scores to the appropriate columns
                if result.scorecolumn.type == 'Giữa Kỳ':
                    student_scores[student_code]['Giữa Kỳ'] = result.score
                elif result.scorecolumn.type == 'Cuối Kỳ':
                    student_scores[student_code]['Cuối Kỳ'] = result.score

            # Populate data with student scores
            for code, scores in student_scores.items():
                data.append([
                    code,
                    scores['Name'],
                    scores['Giữa Kỳ'],
                    scores['Cuối Kỳ']
                ])

            # Construct the file name based on studyclassroom name
            filename = f"{studyclassroom.name} - {studyclassroom.subject.name}_Bảng Điểm Tổng Hợp.pdf"

            # Generate PDF
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'

            doc = SimpleDocTemplate(response, pagesize=letter)
            table = Table(data)

            # Add style to table
            style = TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.gray),
                                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                                ('GRID', (0, 0), (-1, -1), 1, colors.black)])

            table.setStyle(style)

            # Add table to document
            doc.build([table])

            return response

        else:
            return Response({"message": "Bạn không có quyền xuất bảng điểm của lớp học này."},
                            status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['post'], url_path='add-topic', detail=True)
    def add_topic(self, request, pk=None):
        try:
            teacher = Teacher.objects.get(id=request.user.id)
            studyclassroom = self.get_object()
            if studyclassroom.teacher == teacher:
                title = request.data.get('title')
                topic, created = Topic.objects.get_or_create(title=title, studyclassroom=studyclassroom)
                if not created:
                    topic.active = not topic.active
                    topic.save()

                return Response(serializers.TopicSerializer(topic).data, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Bạn không có quyền để tạo topic cho lớp học này!!!"},
                                status=status.HTTP_401_UNAUTHORIZED)
        except Teacher.DoesNotExist:
            return Response({"message": "Không tìm thấy giáo viên tương ứng với tài khoản này."},
                            status=status.HTTP_404_NOT_FOUND)


class StudentViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = serializers.StudentSerializer
    pagination_class = pagination.StudentPaginator
    permission_classes = [permissions.IsAuthenticated]
    # def get_queryset(self):
    #     if self.action == 'list':
    #         return self.queryset.filter(id=self.request.user.id)
    #     return self.queryset

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
