# core/admin.py
from django.contrib import admin
from .models import (
    Project, Board, Column, Task, SubTask, 
    Tag, TaskTag, Comment, Attachment
)

class ColumnInline(admin.TabularInline):
    model = Column
    extra = 0

class BoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'project')
    search_fields = ('name', 'project__name')
    list_filter = ('project',)
    inlines = [ColumnInline]

class TaskInline(admin.TabularInline):
    model = Task
    extra = 0

class ColumnAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'board')
    search_fields = ('name', 'board__name')
    list_filter = ('board',)
    inlines = [TaskInline]

class SubTaskInline(admin.TabularInline):
    model = SubTask
    extra = 0

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0

class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 0

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'due_date', 'column', 'created_by', 'assigned_to')
    search_fields = ('title', 'description')
    list_filter = ('priority', 'column', 'created_by', 'assigned_to')
    inlines = [SubTaskInline, CommentInline, AttachmentInline]

class SubTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_completed', 'task')
    search_fields = ('title', 'task__title')
    list_filter = ('is_completed', 'task')

class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'user')
    search_fields = ('name',)
    list_filter = ('user',)

class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'user', 'created_at')
    search_fields = ('content', 'task__title', 'user__username')
    list_filter = ('user', 'created_at')

class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'task', 'uploaded_by', 'uploaded_at')
    search_fields = ('name', 'task__title', 'uploaded_by__username')
    list_filter = ('uploaded_by', 'uploaded_at')

admin.site.register(Project)
admin.site.register(Board, BoardAdmin)
admin.site.register(Column, ColumnAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(SubTask, SubTaskAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(TaskTag)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Attachment, AttachmentAdmin)