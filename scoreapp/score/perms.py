from rest_framework import permissions


class CanCommentOnPost(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if obj.studyclassroom.teacher.id == request.user.id:
                return True
            if obj.studyclassroom.study_set.filter(student__id=request.user.id).exists():
                return True
        return False


class isTeacherOfStudyClassRoom(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if obj.teacher.id == request.user.id:
                return True
        return False


class CanLockTopic(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if obj.studyclassroom.teacher.id == request.user.id:
                return True
