from rest_framework import pagination


class StudyClassRoom(pagination.PageNumberPagination):
    page_size = 5


class Subject(pagination.PageNumberPagination):
    page_size = 5


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 5


class TopicPaginator(pagination.PageNumberPagination):
    page_size = 5


class StudyPaginator(pagination.PageNumberPagination):
    page_size = 5


class ScoreDetailsPaginator(pagination.PageNumberPagination):
    page_size = 5