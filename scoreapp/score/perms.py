from rest_framework import permissions


class CanCommentOnPost(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if obj.studyclassroom.teacher.id == request.user.id:
                return True
            if obj.comment_set.filter(user=request.user).exists():
                return True
        return False


class isTeacherOfStudyClassRoom(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated:
            if obj.teacher.id == request.user.id:
                return True
        return False
