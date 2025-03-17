# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, BoardViewSet, ColumnViewSet, TaskViewSet, 
    SubTaskViewSet, TagViewSet, CommentViewSet, AttachmentViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'columns', ColumnViewSet, basename='column')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'subtasks', SubTaskViewSet, basename='subtask')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'attachments', AttachmentViewSet, basename='attachment')

urlpatterns = [
    path('', include(router.urls)),
]