from rest_framework import pagination


class UserPaginator(pagination.PageNumberPagination):
    page_size = 10


class RolePaginator(pagination.PageNumberPagination):
    page_size = 4


class SemesterPaginator(pagination.PageNumberPagination):
    page_size = 4


class TeacherPaginator(pagination.PageNumberPagination):
    page_size = 10


class StudentPaginator(pagination.PageNumberPagination):
    page_size = 10


class StudyClassRoomPaginator(pagination.PageNumberPagination):
    page_size = 10


class SubjectPaginator(pagination.PageNumberPagination):
    page_size = 10


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 10


class CommentFilePaginator(pagination.PageNumberPagination):
    page_size = 5


class TopicPaginator(pagination.PageNumberPagination):
    page_size = 5


class StudyPaginator(pagination.PageNumberPagination):
    page_size = 10


class ScoreDetailsPaginator(pagination.PageNumberPagination):
    page_size = 10


class EventsPaginator(pagination.PageNumberPagination):
    page_size = 10
