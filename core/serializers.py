# core/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Project, Board, Column, Task, SubTask, Tag, TaskTag, Comment, Attachment
from accounts.serializers import UserLightSerializer

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color']
        read_only_fields = ['id']

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ['id', 'title', 'is_completed', 'task']
        read_only_fields = ['id']

class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserLightSerializer(read_only=True)
    
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'name', 'uploaded_by', 'uploaded_at', 'task']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']
    
    def validate_file(self, value):
        """Validate the file size."""
        if value.size > 100 * 1024 * 1024: 
            raise serializers.ValidationError("File size cannot exceed 100MB.")
        return value

class CommentSerializer(serializers.ModelSerializer):
    user = UserLightSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'created_at', 'task']
        read_only_fields = ['id', 'user', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserLightSerializer(read_only=True)
    assigned_to = UserLightSerializer(read_only=True)
    subtasks = SubTaskSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    column_detail = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'due_date', 
            'created_at', 'updated_at', 'created_by', 'assigned_to', 
            'position', 'column', 'column_detail', 'subtasks', 'tags', 
            'comments', 'attachments'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'column_detail']

    def get_tags(self, obj):
        """Get all tags associated with this task."""
        task_tags = TaskTag.objects.filter(task=obj)
        return TagSerializer(
            [task_tag.tag for task_tag in task_tags], 
            many=True
        ).data
    
    def get_column_detail(self, obj):
        """Get detailed column information including the board."""
        if obj.column:
            column_data = {
                'id': obj.column.id,
                'name': obj.column.name,
                'board': {
                    'id': obj.column.board.id,
                    'name': obj.column.board.name,
                    'project': obj.column.board.project.id
                } if obj.column.board else None
            }
            return column_data
        return None

class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = Column
        fields = ['id', 'name', 'position', 'color', 'wip_limit', 'board', 'tasks']
        read_only_fields = ['id']
    
    def validate_wip_limit(self, value):
        """Validate WIP limit is a positive integer."""
        if value is not None and value < 1:
            raise serializers.ValidationError("WIP limit must be a positive integer.")
        return value

class BoardSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)
    
    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'project', 'columns']
        read_only_fields = ['id']

class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserLightSerializer(read_only=True)
    members = UserLightSerializer(many=True, read_only=True)
    boards = BoardSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'created_by', 
            'members', 'created_at', 'updated_at', 
            'is_archived', 'boards'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def validate_name(self, value):
        """Validate project name is not empty."""
        if not value.strip():
            raise serializers.ValidationError("Project name cannot be empty.")
        return value

class ProjectLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'is_archived']
        read_only_fields = fields

class BoardLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['id', 'name', 'project']
        read_only_fields = fields

class ColumnLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ['id', 'name', 'position', 'color', 'board']
        read_only_fields = fields

class TaskLightSerializer(serializers.ModelSerializer):
    assigned_to = UserLightSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'priority', 'due_date', 'assigned_to', 'position']
        read_only_fields = fields