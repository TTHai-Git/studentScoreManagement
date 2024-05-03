from rest_framework import pagination


class UserPaginator(pagination.PageNumberPagination):
    page_size = 5


class TeacherPaginator(pagination.PageNumberPagination):
    page_size = 5


class StudentPaginator(pagination.PageNumberPagination):
    page_size = 5


class StudyClassRoomPaginator(pagination.PageNumberPagination):
    page_size = 5


class SubjectPaginator(pagination.PageNumberPagination):
    page_size = 5


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 5


class TopicPaginator(pagination.PageNumberPagination):
    page_size = 5


class StudyPaginator(pagination.PageNumberPagination):
    page_size = 5


class ScoreDetailsPaginator(pagination.PageNumberPagination):
    page_size = 5