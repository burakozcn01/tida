# core/models.py
from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import User

class Project(models.Model):
    """Model for representing a project."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    members = models.ManyToManyField(User, related_name='member_projects', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_by']),
            models.Index(fields=['is_archived']),
        ]
    
    def __str__(self):
        return self.name

class Board(models.Model):
    """Model for representing a kanban board within a project."""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='boards')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['project']),
        ]
    
    def __str__(self):
        return f"{self.project.name} - {self.name}"

class Column(models.Model):
    """Model for representing a column on a kanban board."""
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
    name = models.CharField(max_length=100)
    position = models.PositiveIntegerField()
    color = models.CharField(max_length=20, default='#e2e8f0')
    wip_limit = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['position']
        indexes = [
            models.Index(fields=['board']),
            models.Index(fields=['position']),
        ]
    
    def __str__(self):
        return f"{self.board.name} - {self.name}"

class Task(models.Model):
    """Model for representing a task within a column."""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    ]
    
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    position = models.PositiveIntegerField()
    
    class Meta:
        ordering = ['position']
        indexes = [
            models.Index(fields=['column']),
            models.Index(fields=['created_by']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['due_date']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return self.title

class SubTask(models.Model):
    """Model for representing a subtask within a task."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    
    class Meta:
        indexes = [
            models.Index(fields=['task']),
            models.Index(fields=['is_completed']),
        ]
    
    def __str__(self):
        return self.title

class Tag(models.Model):
    """Model for representing a tag that can be applied to tasks."""
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20, default='#3490dc')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['name', 'user']
        indexes = [
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return self.name

class TaskTag(models.Model):
    """Model for associating tasks with tags (many-to-many relationship)."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='task_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['task', 'tag']
        indexes = [
            models.Index(fields=['task']),
            models.Index(fields=['tag']),
        ]
    
    def __str__(self):
        return f"{self.task.title} - {self.tag.name}"

class Comment(models.Model):
    """Model for representing comments on tasks."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.title}"

class Attachment(models.Model):
    """Model for representing file attachments on tasks."""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    name = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['task']),
            models.Index(fields=['uploaded_by']),
            models.Index(fields=['uploaded_at']),
        ]
    
    def clean(self):
        """Validate file size before saving."""
        if self.file and self.file.size > 100 * 1024 * 1024:  # 100MB
            raise ValidationError("File size cannot exceed 100MB.")
    
    def __str__(self):
        return self.name