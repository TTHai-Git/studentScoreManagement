import csv
import mimetypes
import os
from datetime import timedelta, datetime
import jwt
from django.utils import timezone
import cloudinary
from django.core.mail import send_mail, EmailMessage
from django.db.models.functions import Concat
from jwt import ExpiredSignatureError, InvalidTokenError
from rest_framework import viewsets, permissions, status, parsers, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from score.models import *
from score import serializers, pagination, perms
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from django.http import HttpResponse
from scoreapp import settings
from django.db.models import Q, Value


def index(request):
    return HttpResponse("ScoreApp")


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action == 'current_user':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], detail=False, url_path='current-user', url_name='current-user')
    def current_user(self, request):
        user = request.user
        if request.method == 'PATCH':
            for k, v in request.data.items():
                if k == 'password':
                    user.set_password(v)
                elif k == 'avatar':
                    new_avatar = cloudinary.uploader.upload(request.data['avatar'])
                    user.avatar = new_avatar['secure_url']
                else:
                    setattr(user, k, v)
            user.save()
            return Response({'message': 'UPLOAD THÔNG TIN CÁ NHÂN THÀNH CÔNG!!!'}, status=status.HTTP_200_OK)
        else:
            return Response(serializers.UserSerializer(user).data)

    @action(methods=['patch'], detail=False, url_path='change-password', url_name='change-password')
    def change_password(self, request):
        new_password = request.data.get('new_password')
        token = request.data.get('token')

        try:
            # Giải mã token từ token mã hóa gửi qua email thông qua payload của token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            # Lấy username từ payload của token kẹp vào
            username = payload.get('username')
            user = User.objects.filter(username=username).first()

            if not user:
                return Response({'message': 'Email không tồn tại.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({'message': 'Đổi mật khẩu thành công.'}, status=status.HTTP_200_OK)
        except ExpiredSignatureError:
            return Response({'message': 'Token đã hết hạn.'}, status=status.HTTP_400_BAD_REQUEST)
        except InvalidTokenError:
            return Response({'message': 'Token không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False, url_path='send-otp', url_name='send-otp')
    def send_otp(self, request):
        username = request.data.get('username')
        user = User.objects.filter(username=username).first()
        try:
            if user:
                # Thời gian token hết hạn là sau 10 phút
                valid_until = timezone.now() + timedelta(minutes=10)
                # kẹp username và expire time của token vào payload của token
                token_payload = {
                    "username": user.username,
                    "exp": valid_until.timestamp()
                }
                token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')# Mã hóa token

                subject = 'Mail Reset Password Ứng Dụng ScoreApp'
                message = f'Mã Otp reset password của bạn dùng trong 1 lần hết hạn trong vòng 10 phút kể từ lúc gửi mail: {token}'
                email_from = settings.EMAIL_HOST_USER
                recipient_list = [user.email]
                send_mail(subject, message, email_from, recipient_list, fail_silently=False)
                return Response({'message': f'ĐÃ GỬI TOKEN RESET PASSWORD TỚI EMAIL: {user.email} CỦA BẠN.'}, status=status.HTTP_200_OK)
        except Exception as ex:
            return Response({"message": str(ex)}
                            , status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': f'GỬI TOKEN RESET PASSWORD THẤT BẠI!!! NGƯỜI DÙNG KHÔNG TỒN TẠI.'}, status=status.HTTP_400_BAD_REQUEST)


class TeacherViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Teacher.objects.all()
    serializer_class = serializers.TeacherSerializer
    pagination_class = pagination.TeacherPaginator
    parser_classes = [parsers.MultiPartParser]


class TopicViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Topic.objects.all()
    serializer_class = serializers.TopicSerializer
    pagination_class = pagination.TopicPaginator
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action == 'add_comment':
            return [permissions.IsAuthenticated(), perms.CanCommentOnPost()]
        if self.action == 'lock_or_unlock_topic':
            return [permissions.IsAuthenticated(), perms.CanOrUnLockTopic()]
        else:
            return [permissions.AllowAny()]

    @action(methods=['patch'], detail=True)
    def lock_or_unlock_topic(self, request, pk=None):
        try:
            topic = self.get_object()
        except Topic.DoesNotExist:
            return Response({"message": "Chưa có topic nào được tạo!!!"}, status=status.HTTP_404_NOT_FOUND)

        topic.active = not topic.active
        topic.save()
        if topic.active:
            return Response({"message": f'Mở Khóa topic {topic.title} thành công'}, status=status.HTTP_200_OK)
        else:
            return Response({"message": f'Khóa topic {topic.title} thành công'}, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='add-comment', detail=True)
    def add_comment(self, request, pk):
        try:
            topic = self.get_object()
            user = request.user
            content = request.data.get('content')
            files = request.FILES.getlist('files')  # Get multiple files from the request

            allowed_mime_types = [
                'application/pdf',
                'application/msword',  # .docx
                'application/vnd.ms-excel',  # .xla|xls|xlsx|xlt|xlw|xlam|xlsb|xlsm|xltm
                'application/vnd.ms-powerpoint',
                'application/zip',  # .zip
                'application/rar',  # .rar
                'text/plain',  # .txt
                'image/jpeg',  # .jpg, .jpeg
                'image/png',  # .png
                'image/gif',  # .gif
                'image/bmp',  # .bmp
                'image/webp',  # .webp
                'image/tiff',  # .tiff
            ]

            if topic.active:
                if not content:
                    return Response({"message": "Nội dung comment không được bỏ trống!!!"},
                                    status=status.HTTP_400_BAD_REQUEST)

                file_urls_names = []

                for file in files:
                    # Check the MIME type of the uploaded file
                    # file_mime_type, _ = mimetypes.guess_type(file.name)
                    if file.content_type not in allowed_mime_types:
                        return Response({"message": f"Loại tệp {file.name} không được phép!!!"},
                                        status=status.HTTP_400_BAD_REQUEST)

                    # Upload the file to Cloudinary
                    upload_response = cloudinary.uploader.upload(file, resource_type='auto')
                    file_urls_names.append({
                        "url": upload_response['secure_url'],
                        "name": file.name
                    })

                # Create the comment
                comment = Comment.objects.create(content=content, user=user, topic=topic)

                # Store the file URLs and names if present
                for url_name in file_urls_names:
                    CommentFile.objects.create(comment=comment, file_url=url_name["url"], file_name=url_name["name"])

                return Response({"message": f'Thêm bình luận vào {topic.title} thành công!'},
                                status=status.HTTP_201_CREATED)

            else:
                return Response(
                    {"message": f'Topic {topic.title} đã bị khóa!!! Bạn không thể comment vào topic này được nữa!!!'},
                    status=status.HTTP_400_BAD_REQUEST)

        except Exception as ex:
            return Response({"message": str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


class CommentViewSet(viewsets.ViewSet, viewsets.generics.RetrieveAPIView):
    queryset = Comment.objects.filter(active=True)
    serializers_class = serializers.CommentSerializer

    @action(methods=['get'], url_path='files', detail=True)
    def get_files_of_comment(self, request, pk):
        comment = self.get_object()
        comment_files = comment.files.prefetch_related('comment')
        return Response(serializers.CommentFileSerializer(comment_files, many=True).data, status=status.HTTP_200_OK)


class CommentFileViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = CommentFile.objects.all()
    serializer_class = serializers.CommentFileSerializer
    pagination_class = pagination.CommentFilePaginator


class ScheduleViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView):
    queryset = Schedule.objects.filter(active=True)
    serializer_class = serializers. ScheduleSerializer


class StudyClassRoomViewSet(viewsets.ViewSet, viewsets.generics.ListAPIView, viewsets.generics.RetrieveAPIView):
    queryset = StudyClassRoom.objects.filter(active=True)
    serializer_class = serializers.StudyClassRoomSerializer
    pagination_class = pagination.StudyClassRoomPaginator
    parser_classes = [parsers.MultiPartParser]

    def get_queryset(self):
        teacher = self.request.user
        queryset = self.queryset
        if self.action == 'list':
            queryset = queryset.filter(teacher=teacher)
        return queryset

    def get_permissions(self):
        if self.action in ['get_students_studyclassroom', 'get_score_collumns', 'get_students_scores_studyclassroom',
                           'save_scores',
                           'locked_score_of_studyclassroom', 'export_csv_scores_students_studyclassroom', 'add_topic',
                           'new_schedule']:
            return [permissions.IsAuthenticated(), perms.isTeacherOfStudyClassRoom()]
        elif self.action in ['register_study']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='get-schedule', detail=False)
    def get_schedule_of_studyclassrooms(self, request):
        user = request.user
        if user.role.name == 'student':
            student = Student.objects.get(id=user.id)
            studies = Study.objects.filter(student=student)
            studyclassroom_ids = studies.values_list('studyclassroom', flat=True)
            studyclassrooms = StudyClassRoom.objects.filter(id__in=studyclassroom_ids)
        elif user.role.name == 'teacher':
            teacher = Teacher.objects.get(id=user.id)
            studyclassrooms = StudyClassRoom.objects.filter(teacher=teacher)
        else:
            return Response({"message": "Người dùng không hợp lệ!!!"}, status=status.HTTP_401_UNAUTHORIZED)
        kw = request.query_params.get('kw')  # Use query_params for GET requests

        if kw:
            studyclassrooms = studyclassrooms.annotate(
                search_semester=Concat('semester__name', Value(' '), 'semester_year')
            ).filter(search_semester__icontains=kw)  # Corrected typo: search_semster to search_semester

        schedule_studyclassrooms = Schedule.objects.filter(studyclassroom__in=studyclassrooms)
        if schedule_studyclassrooms:
            return Response(
                {"data": serializers.ScheduleSerializer(schedule_studyclassrooms, many=True).data},
                status=status.HTTP_200_OK
            )
        else:
            return Response({"data": []}, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='new-schedule', detail=True)
    def new_schedule(self, request, pk):
        studyclassroom = self.get_object()
        started_time = request.data.get('started_time')
        ended_time = request.data.get('ended_time')
        descriptions = request.data.get('descriptions')

        # Convert times to datetime objects if needed
        try:
            started_time = datetime.fromisoformat(started_time)
            ended_time = datetime.fromisoformat(ended_time)
        except ValueError:
            return Response({'message': 'Invalid datetime format.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for overlapping schedules
        schedule_conflict = Schedule.objects.filter(
            studyclassroom=studyclassroom,
            started_time__lt=ended_time,
            ended_time__gt=started_time
        ).exists()

        if schedule_conflict:
            return Response({
                'message': 'Lập lịch thất bại!!! Trùng lịch với một lịch học khác.'
            }, status=status.HTTP_409_CONFLICT)

        # Create new schedule
        schedule = Schedule.objects.create(
            started_time=started_time,
            ended_time=ended_time,
            studyclassroom=studyclassroom,
            descriptions=descriptions
        )

        return Response({"message": "Tạo lịch thành công"}, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='register', detail=True)
    def register_study(self, request, pk):
        studyclassroom_register = self.get_object()
        id_student = request.data.get('student_id')
        student = Student.objects.get(id=id_student)

        studies = Study.objects.filter(student=student)
        studyclassroom_ids = studies.values_list('studyclassroom', flat=True)
        studyclassrooms = StudyClassRoom.objects.filter(id__in=studyclassroom_ids)

        for studyclassroom in studyclassrooms:
            if studyclassroom.group != studyclassroom_register.group and \
                    studyclassroom.subject.name == studyclassroom_register.subject.name and \
                    studyclassroom.semester == studyclassroom_register.semester:
                return Response({"message": f"Đăng ký lớp học thất bại!!! Trùng môn học trong một học kỳ"}, status=status.HTTP_400_BAD_REQUEST)
            elif studyclassroom.started_date == studyclassroom_register.started_date:
                schedule_studyclassroom = Schedule.objects.filter(studyclassroom=studyclassroom)
                schedule_studyclassroom_register = Schedule.objects.filter(studyclassroom=studyclassroom_register)
                for schedule in schedule_studyclassroom:
                    for schedule_register in schedule_studyclassroom_register:
                        if schedule.started_time == schedule_register.started_time \
                                and schedule.ended_time == schedule_register.ended_time:
                            return Response({"message": f'Đăng ký lớp học thất bại!! Trùng lịch học môn '
                                                        f'{studyclassroom.subject.name} trong một học kỳ'})
                return Response({"message": f'Đăng ký lớp học thất bại!! Trùng lịch học môn '
                                            f'{studyclassroom.subject.name} - {studyclassroom.started_date} trong một học kỳ'}, status=status.HTTP_400_BAD_REQUEST)

        study_register = Study.objects.create(student=student, studyclassroom=studyclassroom_register)
        return Response({"message": "Đăng ký lớp học thành công!!!"}, status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='chat-room', url_name='chat-room', detail=True)
    def get_users_of_chat_room(self, request, pk):
        studyclassroom = self.get_object()
        teacher = Teacher.objects.get(id=studyclassroom.teacher.id)
        studies = Study.objects.filter(studyclassroom=studyclassroom)
        student_ids = studies.values_list('student_id', flat=True)
        students = Student.objects.filter(id__in=student_ids)
        listuser = [{
            "code": teacher.code,
            "name": teacher.last_name + ' ' + teacher.first_name,
            "username": teacher.username,
            "avatar": teacher.avatar.url,
            "role": teacher.role.name,
        }]

        for student in students:
            listuser.append({
                "code": student.code,
                "name": student.last_name + ' ' + student.first_name,
                "username": student.username,
                "avatar": student.avatar.url,
                "role": student.role.name,
            })
        listuserserializers = serializers.MembersOfChatRoomSerializer(listuser, many=True).data
        return Response({"members": listuserserializers}, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='students', detail=True)
    def get_students_studyclassroom(self, request, pk):
        teacher = Teacher.objects.get(id=request.user.id)
        kw = request.query_params.get('kw')
        studyclassroom = self.get_object()
        try:
            if studyclassroom.teacher == teacher:
                studies = Study.objects.filter(studyclassroom=studyclassroom)
                if kw:
                    student = Student.objects.annotate(search_name=Concat('last_name', Value(' '), 'first_name')) \
                        .filter(
                        Q(code__contains=kw) |
                        Q(search_name__icontains=kw))
                    studies = studies.filter(studyclassroom=studyclassroom, student__in=student)
                paginator = pagination.StudyPaginator()
                page = paginator.paginate_queryset(studies, request)

                if page is not None:
                    serializer = serializers.StudentsOfStudyClassRoom(page, many=True)
                    return paginator.get_paginated_response(serializer.data)

                return Response(serializers.StudentsOfStudyClassRoom(), status=status.HTTP_200_OK)
            else:
                return Response({"message": "Bạn không có quyền xem danh sách học sinh của lớp này."},
                                status=status.HTTP_401_UNAUTHORIZED)
        except Exception as ex:
            if str(ex).__eq__("Student matching query does not exist."):
                return Response({"message": "Không tìm thấy sinh viên!!!"}, status=status.HTTP_404_NOT_FOUND)
            return Response({"message": str(ex)})

    @action(methods=['post'], url_path='save-scores', url_name='save-scores', detail=True)
    def save_scores(self, request, pk):
        studyclassroom = self.get_object()
        if studyclassroom.islock:
            return Response({"message": "Thao tác điểm lên bảng điểm thất bại!!! Bảng điểm của lớp học đã bị khóa"})
        else:
            try:
                scores = request.data.get('scores')
                for studentScore in scores:
                    for score in studentScore["scores"]:
                        if score["score"]:
                            study = Study.objects.get(student__id=studentScore["student_id"], studyclassroom__id=pk)
                            scoredetail, created = ScoreDetails.objects.get_or_create(
                                study__student__id=studentScore["student_id"],
                                scorecolumn__id=score["col_id"],
                                defaults={"study": study,
                                          "scorecolumn_id": score["col_id"]})
                            if float(score["score"]) < 0.0 or float(score["score"]) > 10.0:
                                return Response({"message": "Lưu điểm thất bại!!! Sai định dạng điểm"})
                            else:
                                scoredetail.score = float(score["score"])
                                scoredetail.save()
                return Response({"message": "Lưu điểm thành công"}, status=status.HTTP_200_OK)
            except Exception as ex:
                return Response({"message": str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['get'], url_path='students/scores', detail=True)
    def get_students_scores_studyclassroom(self, request, pk):
        try:
            teacher = Teacher.objects.get(id=request.user.id)
            studyclassroom = self.get_object()

            if studyclassroom.teacher != teacher:
                return Response({"message": "Bạn không có quyền xem bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)

            kw = request.query_params.get('kw')
            studies = Study.objects.filter(studyclassroom=studyclassroom)
            student_ids = studies.values_list('student_id', flat=True)
            students = Student.objects.filter(id__in=student_ids)

            if kw:
                students = students.annotate(search_name=Concat('last_name', Value(' '), 'first_name')) \
                    .filter(
                    Q(code__contains=kw) |
                    Q(search_name__icontains=kw))

            # Filter studies based on the filtered students
            studies = Study.objects.filter(studyclassroom=studyclassroom, student__in=students).order_by(
                'studyclassroom_id')

            # scoreData = []

            columns = ScoreColumn.objects.filter(studyclassroom=studyclassroom)
            colsSerializer = serializers.ScoreColumnSerializer(columns, many=True).data

            listscores = []
            for study in studies:
                scoredetails = []
                for col in columns:
                    try:
                        find = ScoreDetails.objects.get(study=study, scorecolumn=col)
                        scoredetail = {"col_id": find.scorecolumn.id, "score": float(find.score)}
                    except Exception:
                        scoredetail = {"col_id": col.id, "score": None}
                    scoredetails.append(scoredetail)

                listscores.append({
                    "student_id": study.student.id,
                    "student_code": study.student.code,
                    'student_name': study.student.last_name + ' ' + study.student.first_name,
                    "scores": serializers.ScoreSerializer(scoredetails, many=True).data
                })
            listscoressSerializer = serializers.ScoreDetailsSerializer(listscores, many=True).data

            dataJson = serializers.ScoresSerializer(
                {"score_cols": colsSerializer, "score_details": listscoressSerializer})

            # for col in columns:
            #     scoredetails = []
            #     for study in studies:
            #         try:
            #             sd = ScoreDetails.objects.get(study=study, scorecolumn=col)
            #         except Exception:
            #             sd = ScoreDetails(None, study=study, scorecolumn=col)
            #         muData = {
            #             'student_id': study.student.id,
            #             'student_name': study.student.last_name + ' ' + study.student.first_name,
            #             'score': sd.score
            #         }
            #         mu = serializers.ScoreDetailsSerializerMU(muData).data
            #         scoredetails.append(mu)
            #
            #     scoreData.append({
            #         'scorecolumn_id': col.id,
            #         'scorecolumn_type': col.type,
            #         'scorecolumn_percent': col.percent,
            #         'scoredetails': scoredetails
            #     })
            # dataJson = serializers.ScoresSerializer(scoreData, many=True)

            return Response({
                'scoredetails_with_scores': dataJson.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # @action(methods=['post'], url_path='students/add-scores', detail=True)
    # def add_score_students_studyclassroom(self, request, pk):
    #     try:
    #         student_id = int(request.data.get('student_id'))
    #         scorecolumn_id = int(request.data.get('scorecolumn_id'))
    #         score = float(request.data.get('score'))
    #
    #         teacher = Teacher.objects.get(id=request.user.id)
    #         studyclassroom = self.get_object()
    #
    #         if studyclassroom.teacher == teacher:
    #             student = Student.objects.get(id=student_id)
    #             # kiểm tra học sinh có đăng ký lớp học đó không á
    #             study = Study.objects.get(student=student, studyclassroom=studyclassroom)
    #
    #             # Lấy cột điểm của lớp học đó (GK hoặc CK)
    #             scorecolumn = ScoreColumn.objects.get(id=scorecolumn_id, studyclassroom=studyclassroom)
    #
    #             # Thêm điểm xuống db
    #             scoredetails = ScoreDetails.objects.create(study=study, scorecolumn=scorecolumn, score=score)
    #
    #             # return Response(serializers.ScoreDetailsSerializer(scoredetails).data, status=status.HTTP_201_CREATED)
    #             return Response(
    #                 {"message": f'Nhập điểm cho sinh viên {student.last_name} 'f' {student.first_name} thành công'},
    #                 status=status.HTTP_201_CREATED)
    #
    #         else:
    #             return Response({"message": "Bạn không có quyền nhập bảng điểm của lớp học này."},
    #                             status=status.HTTP_401_UNAUTHORIZED)
    #     except (ValueError, Student.DoesNotExist, Study.DoesNotExist, ScoreColumn.DoesNotExist) as e:
    #         return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # @action(methods=['patch'], url_path='students/update-scores', detail=True)
    # def update_score_students_studyclassroom(self, request, pk):
    #     try:
    #         student_id = int(request.data.get('student_id'))
    #         scorecolumn_id = int(request.data.get('scorecolumn_id'))
    #         updated_score = float(request.data.get('updated_score'))
    #
    #         teacher = Teacher.objects.get(id=request.user.id)
    #         studyclassroom = self.get_object()
    #
    #         if studyclassroom.teacher == teacher:
    #             student = Student.objects.get(id=student_id)
    #             study = Study.objects.get(student=student, studyclassroom=studyclassroom)
    #
    #             scorecolumn = ScoreColumn.objects.get(id=scorecolumn_id, studyclassroom=studyclassroom)
    #
    #             scoredetails = ScoreDetails.objects.get(study=study, scorecolumn=scorecolumn)
    #
    #             scoredetails.score = updated_score
    #             scoredetails.save()
    #
    #             # return Response(serializers.ScoreDetailsSerializer(scoredetails).data, status=status.HTTP_200_OK)
    #             return Response(
    #                 {"message": f'Cập nhật điểm cho sinh viên {student.last_name} {student.first_name} thành công!'},
    #                 status=status.HTTP_200_OK)
    #         else:
    #             return Response({"message": "Bạn không có quyền nhập bảng điểm của lớp học này."},
    #                             status=status.HTTP_401_UNAUTHORIZED)
    #     except (ValueError, Student.DoesNotExist, Study.DoesNotExist, ScoreColumn.DoesNotExist,
    #             ScoreDetails.DoesNotExist) as ex:
    #         return Response({"message": str(ex)}, status=status.HTTP_400_BAD_REQUEST)

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
                if studyclassroom.islock == True:
                    for result in serialized_data:
                        subject = f'THÔNG BÁO ĐIỂM - ' \
                                  f'Lớp học: {studyclassroom.name} - Môn học: {studyclassroom.subject.name} - ' \
                                  f'Thầy: {teacher.last_name} {teacher.first_name}'
                        message = ' Đã khóa điểm, sinh viên vui lòng vào trang web để kiểm tra điểm của mình'
                        email_from = settings.EMAIL_HOST_USER
                        recipient_list = [result['student_email']]

                        send_mail(subject, message, email_from, recipient_list, fail_silently=False)
                else:
                    return Response({"message": f'Mở khóa bảng điểm lớp {studyclassroom.name} thành công!'},
                                    status=status.HTTP_201_CREATED)

            else:
                return Response({"message": "Bạn không có quyền khóa bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)

        except (StudyClassRoom.DoesNotExist, Teacher.DoesNotExist):
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response({"message": f'Khóa bảng điểm lớp {studyclassroom.name} thành công!'},
                        status=status.HTTP_201_CREATED)

    @action(methods=['get'], url_path='students/export-csv-scores', detail=True)
    def export_csv_scores_students_studyclassroom(self, request, pk):
        studyclassroom = self.get_object()
        if not studyclassroom.islock:
            return Response(
                {'message': f'Xuất bảng điểm lớp {studyclassroom.name} thành file.csv và gửi email thất bại!!! '
                            f'Bảng điểm của lớp học chưa khóa'},
                status=status.HTTP_400_BAD_REQUEST)
        else:
            teacher = Teacher.objects.get(id=request.user.id)
            scorecolumns = ScoreColumn.objects.filter(studyclassroom=studyclassroom)
            if studyclassroom.teacher.__eq__(teacher):
                studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
                scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')

                # Get distinct score types
                score_types = scorecolumns.values_list('type', flat=True).distinct()

                # Prepare the header dynamically based on score types
                header = ['MSSV', 'Họ Và Tên'] + list(score_types)
                csv_data = [header]

                # Dictionary to store scores for each student
                student_scores = {}

                for result in scoredetails:
                    student_code = result.study.student.code
                    if student_code not in student_scores:
                        student_name = f"{result.study.student.last_name} {result.study.student.first_name}"
                        # Initialize scores with empty strings
                        student_scores[student_code] = {score_type: '' for score_type in score_types}
                        student_scores[student_code].update({'Name': student_name, 'Code': student_code})

                    # Assign scores to the appropriate columns
                    student_scores[student_code][result.scorecolumn.type] = result.score

                # Populate data with student scores
                for code, scores in student_scores.items():
                    row = [scores['Code'], scores['Name']] + [scores[score_type] for score_type in score_types]
                    csv_data.append(row)

                # Construct the file name based on studyclassroom name
                filename = f"{studyclassroom.name} - {studyclassroom.subject.name}_Bảng Điểm Tổng Hợp.csv"
                file_path = os.path.join(
                    'F:\\PythonProject\\studentScoreManagement\\scoreapp\\score\\static\\Score_csv',
                    filename)

                # Write the data to a CSV file with UTF-8 encoding
                with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                    csv_writer = csv.writer(csvfile)
                    csv_writer.writerows(csv_data)

                # Retrieve email addresses of students
                student_emails = studies.values_list('student__email', flat=True).distinct()

                # Send the CSV file to each student via email
                subject = f"Bảng Điểm Tổng Hợp của lớp {studyclassroom.name} - {studyclassroom.subject.name} " \
                          f"- {studyclassroom.group.name} "
                message = f"Kính gửi các sinh viên" \
                          f"\nĐây là bảng điểm tổng hợp của lớp học. Mọi thắc mắc vui lòng liên hệ về email của thầy:" \
                          f"\nGiáo viên: {teacher.last_name} {teacher.first_name} \nEmail: {teacher.email}" \
                          f"\n\nTrân trọng!"
                from_email = settings.EMAIL_HOST_USER

                for email in student_emails:
                    email_message = EmailMessage(
                        subject,
                        message,
                        from_email,
                        [email]
                    )
                    email_message.attach_file(file_path)
                    email_message.send()

                # Return a response indicating successful CSV export
                return Response(
                    {'message': f'Xuất bảng điểm lớp {studyclassroom.name} thành file.csv và gửi email thành công',
                     'file_name': filename},
                    status=status.HTTP_200_OK)
            else:
                return Response({"message": "Bạn không có quyền xuất bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['get'], url_path='students/export-pdf-scores', detail=True)
    def export_pdf_scores_students_studyclassroom(self, request, pk):
        studyclassroom = self.get_object()
        if not studyclassroom.islock:
            return Response(
                {'message': f'Xuất bảng điểm lớp {studyclassroom.name} thành file.pdf và gửi email thất bại!!! '
                            f'Bảng điểm của lớp học đã chưa khóa'},
                status=status.HTTP_400_BAD_REQUEST)
        else:
            teacher = Teacher.objects.get(id=request.user.id)
            scorecolumns = ScoreColumn.objects.filter(studyclassroom=studyclassroom)
            if studyclassroom.teacher.__eq__(teacher):
                studies = Study.objects.filter(studyclassroom=studyclassroom).order_by('studyclassroom_id')
                scoredetails = ScoreDetails.objects.filter(study__in=studies).order_by('id')

                # Get distinct score types
                score_types = scorecolumns.values_list('type', flat=True).distinct()

                # Prepare the header dynamically based on score types
                header = ['MSSV', 'Họ Và Tên'] + list(score_types)
                data = [header]

                # Dictionary to store scores for each student
                student_scores = {}

                for result in scoredetails:
                    student_code = result.study.student.code
                    if student_code not in student_scores:
                        student_name = f"{result.study.student.last_name} {result.study.student.first_name}"
                        # Initialize scores with empty strings
                        student_scores[student_code] = {score_type: '' for score_type in score_types}
                        student_scores[student_code].update({'Họ Và Tên': student_name, 'MSSV': student_code})

                    # Assign scores to the appropriate columns
                    student_scores[student_code][result.scorecolumn.type] = result.score

                # Populate data with student scores
                for code, scores in student_scores.items():
                    row = [scores['MSSV'], scores['Họ Và Tên']] + [scores[score_type] for score_type in score_types]
                    data.append(row)

                # Construct the file name based on studyclassroom name
                filename = f"{studyclassroom.name} - {studyclassroom.subject.name}_Bảng Điểm Tổng Hợp.pdf"
                file_path = os.path.join(
                    'F:\\PythonProject\\studentScoreManagement\\scoreapp\\score\\static\\Score_pdf',
                    filename)

                # Generate PDF
                response = HttpResponse(content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{filename}"'

                # Create the PDF document
                doc = SimpleDocTemplate(response, pagesize=letter)
                table = Table(data)

                # Add style to table
                style = TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.gray),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ])

                table.setStyle(style)

                # Add table to document
                doc.build([table])

                # Save the PDF locally
                with open(file_path, 'wb') as f:
                    f.write(response.content)

                # Retrieve email addresses of students
                student_emails = studies.values_list('student__email', flat=True).distinct()

                # Send the PDF file to each student via email
                subject = f"Bảng Điểm Tổng Hợp của lớp {studyclassroom.name} - {studyclassroom.subject.name} " \
                          f"- {studyclassroom.group.name} "
                message = f"Kính gửi các sinh viên" \
                          f"\nĐây là bảng điểm tổng hợp của lớp học. Mọi thắc mắc vui lòng liên hệ về email của thầy:" \
                          f"\nGiáo viên: {teacher.last_name} {teacher.first_name} \nEmail: {teacher.email}" \
                          f"\n\nTrân trọng!"
                from_email = settings.EMAIL_HOST_USER

                for email in student_emails:
                    email_message = EmailMessage(
                        subject,
                        message,
                        from_email,
                        [email]
                    )
                    email_message.attach_file(file_path)
                    email_message.send()

                # Return a response indicating successful PDF export and email sending
                return Response(
                    {'message': f'Xuất bảng điểm lớp {studyclassroom.name} thành file.pdf và gửi email thành công',
                     'file_name': filename},
                    status=status.HTTP_200_OK)
            else:
                return Response({"message": "Bạn không có quyền xuất bảng điểm của lớp học này."},
                                status=status.HTTP_401_UNAUTHORIZED)

    @action(methods=['post'], url_path='add-topic', detail=True)
    def add_topic(self, request, pk):
        try:
            teacher = Teacher.objects.get(id=request.user.id)
            studyclassroom = self.get_object()
            if studyclassroom.teacher == teacher:
                title = request.data.get('title')
                topic, created = Topic.objects.get_or_create(title=title, studyclassroom=studyclassroom)
                if not created:
                    topic.active = not topic.active
                    topic.save()

                # return Response(serializers.TopicSerializer(topic).data, status=status.HTTP_201_CREATED)
                return Response({"message": f'Tạo diễn đàn {topic.title} thành công!'}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Bạn không có quyền để tạo topic cho lớp học này!!!"},
                                status=status.HTTP_401_UNAUTHORIZED)
        except Teacher.DoesNotExist:
            return Response({"message": "Không tìm thấy giáo viên tương ứng với tài khoản này.", },
                            status=status.HTTP_404_NOT_FOUND)

    @action(methods=['get'], url_path='topics', detail=True)
    def get_topics(self, request, pk):
        try:
            studyclassroom = self.get_object()
            topics = studyclassroom.topic_set.select_related('studyclassroom')
            paginator = pagination.TopicPaginator()
            page = paginator.paginate_queryset(topics, request)
            serializer = serializers.TopicSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as ex:
            return Response({"message": str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = serializers.StudentSerializer
    pagination_class = pagination.StudentPaginator
    parser_classes = [parsers.MultiPartParser]

    def get_permissions(self):
        if self.action in ['get_study_class_rooms', 'get_details_study', 'list_studyclassrooms_for_register']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='studies', detail=True)
    def get_details_study(self, request, pk):
        try:
            student = self.get_object()
            kw = request.query_params.get('kw')

            if kw:
                subjects = Subject.objects.filter(name__icontains=kw)
                studyclassrooms = StudyClassRoom.objects.filter(subject__in=subjects, islock=True)
            else:
                studyclassrooms = StudyClassRoom.objects.filter(islock=True)

            studies = student.study_set.select_related('student').filter(studyclassroom__in=studyclassrooms)
            scoredetails = ScoreDetails.objects.filter(study__in=studies).select_related('scorecolumn',
                                                                                         'study__studyclassroom__subject',
                                                                                         'study__studyclassroom__semester')

            studyresult = []

            studyclassroom_map = {sc.id: [] for sc in studyclassrooms}
            for scoredetail in scoredetails:
                studyclassroom_id = scoredetail.study.studyclassroom.id
                if studyclassroom_id in studyclassroom_map:
                    studyclassroom_map[studyclassroom_id].append({
                        "col_id": scoredetail.scorecolumn.id,
                        "col_type": scoredetail.scorecolumn.type,
                        "score": scoredetail.score
                    })

            for studyclassroom in studyclassrooms:
                scoredetails_list = studyclassroom_map.get(studyclassroom.id, [])
                studyresult.append({
                    "subject_name": studyclassroom.subject.name,
                    "semester_name": studyclassroom.semester.name,
                    "semester_year": studyclassroom.semester.year,
                    "scoredetails": scoredetails_list
                })

            return Response({"studyresult": serializers.StudyResultSerializer(studyresult, many=True).data},
                            status=status.HTTP_200_OK)
        except Subject.DoesNotExist:
            return Response({"message": "Subject not found"}, status=status.HTTP_404_NOT_FOUND)
        except StudyClassRoom.DoesNotExist:
            return Response({"message": "StudyClassRoom not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as ex:
            return Response({"message": str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['get'], url_path='studyclassrooms', detail=True)
    def get_study_class_rooms(self, request, pk):
        student = self.get_object()
        studies = Study.objects.filter(student=student)
        studyclassroom_ids = studies.values_list('studyclassroom', flat=True)
        studyclassrooms = StudyClassRoom.objects.filter(id__in=studyclassroom_ids)
        paginator = pagination.StudyClassRoomPaginator()
        page = paginator.paginate_queryset(studyclassrooms, request)
        serializer = serializers.StudyClassRoomSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @action(methods=['get'], url_path='list-studyclassrooms-for-register', detail=True)
    def list_studyclassrooms_for_register(self, request, pk):
        student = self.get_object()
        studies = Study.objects.filter(student=student)
        kw = request.query_params.get('kw')
        studyclassroom_ids = studies.values_list('studyclassroom', flat=True)
        studyclassrooms_for_register = StudyClassRoom.objects.filter(~Q(id__in=studyclassroom_ids))
        if kw:
            studyclassrooms_for_register = studyclassrooms_for_register\
                .annotate(search_name=Concat('teacher__last_name', Value(' '), 'teacher__first_name'))\
                .filter(Q(subject__name__icontains=kw) | Q(search_name__icontains=kw))
        paginator = pagination.StudyClassRoomPaginator()
        page = paginator.paginate_queryset(studyclassrooms_for_register, request)
        serializer = serializers.StudyClassRoomSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)