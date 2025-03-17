# core/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from accounts.models import User
from .models import (
    Project, Board, Column, Task, SubTask, 
    Tag, TaskTag, Comment, Attachment
)
from .serializers import (
    ProjectSerializer, ProjectLightSerializer, BoardSerializer, 
    BoardLightSerializer, ColumnSerializer, ColumnLightSerializer,
    TaskSerializer, TaskLightSerializer, SubTaskSerializer,
    TagSerializer, CommentSerializer, AttachmentSerializer
)

class IsProjectMemberOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow members of a project to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user == obj.created_by or request.user in obj.members.all()

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            models.Q(created_by=user) | models.Q(members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        
        board = Board.objects.create(
            project=project,
            name="Main Board"
        )
        
        default_columns = [
            {"name": "To Do", "position": 0, "color": "#e2e8f0"},
            {"name": "In Progress", "position": 1, "color": "#90cdf4"},
            {"name": "Done", "position": 2, "color": "#9ae6b4"}
        ]
        
        for column_data in default_columns:
            Column.objects.create(
                board=board,
                name=column_data["name"],
                position=column_data["position"],
                color=column_data["color"]
            )
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        
        if not (request.user == project.created_by or request.user in project.members.all()):
            return Response(
                {"detail": "You do not have permission to add members to this project."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "User ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(id=user_id)
            project.members.add(user)
            return Response(
                {"detail": f"User {user.username} added to project."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        project = self.get_object()
        
        if request.user != project.created_by:
            return Response(
                {"detail": "Only the project creator can remove members."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"detail": "User ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(id=user_id)
            
            if user == project.created_by:
                return Response(
                    {"detail": "Cannot remove the project creator."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            project.members.remove(user)
            return Response(
                {"detail": f"User {user.username} removed from project."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        project = self.get_object()
        
        if request.user != project.created_by:
            return Response(
                {"detail": "Only the project creator can archive the project."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        project.is_archived = True
        project.save()
        return Response(
            {"detail": "Project archived successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        project = self.get_object()
        
        if request.user != project.created_by:
            return Response(
                {"detail": "Only the project creator can unarchive the project."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        project.is_archived = False
        project.save()
        return Response(
            {"detail": "Project unarchived successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def light(self, request):
        queryset = self.get_queryset()
        serializer = ProjectLightSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_from_template(self, request):
        template_type = request.data.get('template_type')
        name = request.data.get('name')
        description = request.data.get('description', '')
        
        if not template_type or not name:
            return Response(
                {"detail": "Template type and name are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        project = Project.objects.create(
            name=name,
            description=description,
            created_by=request.user
        )
        
        board = Board.objects.create(
            project=project,
            name="Main Board"
        )
        
        if template_type == 'simple':
            columns = [
                {"name": "To Do", "position": 0, "color": "#e2e8f0"},
                {"name": "In Progress", "position": 1, "color": "#90cdf4"},
                {"name": "Done", "position": 2, "color": "#9ae6b4"}
            ]
        elif template_type == 'project_management':
            columns = [
                {"name": "Backlog", "position": 0, "color": "#e2e8f0"},
                {"name": "To Do", "position": 1, "color": "#feb2b2"},
                {"name": "In Progress", "position": 2, "color": "#90cdf4"},
                {"name": "Review", "position": 3, "color": "#d6bcfa"},
                {"name": "Done", "position": 4, "color": "#9ae6b4"}
            ]
        elif template_type == 'software_development':
            columns = [
                {"name": "Backlog", "position": 0, "color": "#e2e8f0"},
                {"name": "To Do", "position": 1, "color": "#feb2b2"},
                {"name": "Development", "position": 2, "color": "#90cdf4"},
                {"name": "Testing", "position": 3, "color": "#fbd38d"},
                {"name": "Code Review", "position": 4, "color": "#d6bcfa"},
                {"name": "Ready for Deploy", "position": 5, "color": "#9ae6b4"},
                {"name": "Done", "position": 6, "color": "#68d391"}
            ]
        elif template_type == 'marketing':
            columns = [
                {"name": "Ideas", "position": 0, "color": "#e2e8f0"},
                {"name": "Planning", "position": 1, "color": "#feb2b2"},
                {"name": "Content Creation", "position": 2, "color": "#90cdf4"},
                {"name": "Review", "position": 3, "color": "#fbd38d"},
                {"name": "Pending Approval", "position": 4, "color": "#d6bcfa"},
                {"name": "Published", "position": 5, "color": "#9ae6b4"},
                {"name": "Analysis", "position": 6, "color": "#68d391"}
            ]
        elif template_type == 'design':
            columns = [
                {"name": "Requests", "position": 0, "color": "#e2e8f0"},
                {"name": "Research", "position": 1, "color": "#feb2b2"},
                {"name": "Draft", "position": 2, "color": "#90cdf4"},
                {"name": "Design", "position": 3, "color": "#fbd38d"},
                {"name": "Feedback", "position": 4, "color": "#d6bcfa"},
                {"name": "Revision", "position": 5, "color": "#bee3f8"},
                {"name": "Approved", "position": 6, "color": "#9ae6b4"}
            ]
        elif template_type == 'product_development':
            columns = [
                {"name": "Idea Pool", "position": 0, "color": "#e2e8f0"},
                {"name": "Research", "position": 1, "color": "#feb2b2"},
                {"name": "MVP", "position": 2, "color": "#90cdf4"},
                {"name": "Testing", "position": 3, "color": "#fbd38d"},
                {"name": "Development", "position": 4, "color": "#d6bcfa"},
                {"name": "Market Launch", "position": 5, "color": "#9ae6b4"},
                {"name": "Feedback", "position": 6, "color": "#68d391"}
            ]
        elif template_type == 'customer_service':
            columns = [
                {"name": "New Requests", "position": 0, "color": "#e2e8f0"},
                {"name": "Evaluation", "position": 1, "color": "#feb2b2"},
                {"name": "Processing", "position": 2, "color": "#90cdf4"},
                {"name": "On Hold", "position": 3, "color": "#fbd38d"},
                {"name": "Resolved", "position": 4, "color": "#9ae6b4"},
                {"name": "Closed", "position": 5, "color": "#68d391"}
            ]
        elif template_type == 'event_planning':
            columns = [
                {"name": "Ideas", "position": 0, "color": "#e2e8f0"},
                {"name": "Planning", "position": 1, "color": "#feb2b2"},
                {"name": "Budget Approval", "position": 2, "color": "#90cdf4"},
                {"name": "Vendor Communication", "position": 3, "color": "#fbd38d"},
                {"name": "Logistics", "position": 4, "color": "#d6bcfa"},
                {"name": "Marketing", "position": 5, "color": "#bee3f8"},
                {"name": "Event Day", "position": 6, "color": "#9ae6b4"},
                {"name": "Post Evaluation", "position": 7, "color": "#68d391"}
            ]
        else:
            columns = [
                {"name": "To Do", "position": 0, "color": "#e2e8f0"},
                {"name": "In Progress", "position": 1, "color": "#90cdf4"},
                {"name": "Done", "position": 2, "color": "#9ae6b4"}
            ]
            
        for column_data in columns:
            Column.objects.create(
                board=board,
                name=column_data["name"],
                position=column_data["position"],
                color=column_data["color"]
            )
            
        serializer = self.get_serializer(project)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def create_board_from_template(self, request, pk=None):
        project = self.get_object()
        template_type = request.data.get('template_type')
        board_name = request.data.get('name', 'New Board')
        
        if not template_type:
            return Response(
                {"detail": "Template type is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not (request.user == project.created_by or request.user in project.members.all()):
            return Response(
                {"detail": "You do not have permission to create boards in this project."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        board = Board.objects.create(
            project=project,
            name=board_name
        )
        
        if template_type == 'simple':
            columns = [
                {"name": "To Do", "position": 0, "color": "#e2e8f0"},
                {"name": "In Progress", "position": 1, "color": "#90cdf4"},
                {"name": "Done", "position": 2, "color": "#9ae6b4"}
            ]
        elif template_type == 'project_management':
            columns = [
                {"name": "Backlog", "position": 0, "color": "#e2e8f0"},
                {"name": "To Do", "position": 1, "color": "#feb2b2"},
                {"name": "In Progress", "position": 2, "color": "#90cdf4"},
                {"name": "Review", "position": 3, "color": "#d6bcfa"},
                {"name": "Done", "position": 4, "color": "#9ae6b4"}
            ]
        elif template_type == 'software_development':
            columns = [
                {"name": "Backlog", "position": 0, "color": "#e2e8f0"},
                {"name": "To Do", "position": 1, "color": "#feb2b2"},
                {"name": "Development", "position": 2, "color": "#90cdf4"},
                {"name": "Testing", "position": 3, "color": "#fbd38d"},
                {"name": "Code Review", "position": 4, "color": "#d6bcfa"},
                {"name": "Ready for Deploy", "position": 5, "color": "#9ae6b4"},
                {"name": "Done", "position": 6, "color": "#68d391"}
            ]
        elif template_type == 'marketing':
            columns = [
                {"name": "Ideas", "position": 0, "color": "#e2e8f0"},
                {"name": "Planning", "position": 1, "color": "#feb2b2"},
                {"name": "Content Creation", "position": 2, "color": "#90cdf4"},
                {"name": "Review", "position": 3, "color": "#fbd38d"},
                {"name": "Pending Approval", "position": 4, "color": "#d6bcfa"},
                {"name": "Published", "position": 5, "color": "#9ae6b4"},
                {"name": "Analysis", "position": 6, "color": "#68d391"}
            ]
        elif template_type == 'design':
            columns = [
                {"name": "Requests", "position": 0, "color": "#e2e8f0"},
                {"name": "Research", "position": 1, "color": "#feb2b2"},
                {"name": "Draft", "position": 2, "color": "#90cdf4"},
                {"name": "Design", "position": 3, "color": "#fbd38d"},
                {"name": "Feedback", "position": 4, "color": "#d6bcfa"},
                {"name": "Revision", "position": 5, "color": "#bee3f8"},
                {"name": "Approved", "position": 6, "color": "#9ae6b4"}
            ]
        elif template_type == 'product_development':
            columns = [
                {"name": "Idea Pool", "position": 0, "color": "#e2e8f0"},
                {"name": "Research", "position": 1, "color": "#feb2b2"},
                {"name": "MVP", "position": 2, "color": "#90cdf4"},
                {"name": "Testing", "position": 3, "color": "#fbd38d"},
                {"name": "Development", "position": 4, "color": "#d6bcfa"},
                {"name": "Market Launch", "position": 5, "color": "#9ae6b4"},
                {"name": "Feedback", "position": 6, "color": "#68d391"}
            ]
        elif template_type == 'customer_service':
            columns = [
                {"name": "New Requests", "position": 0, "color": "#e2e8f0"},
                {"name": "Evaluation", "position": 1, "color": "#feb2b2"},
                {"name": "Processing", "position": 2, "color": "#90cdf4"},
                {"name": "On Hold", "position": 3, "color": "#fbd38d"},
                {"name": "Resolved", "position": 4, "color": "#9ae6b4"},
                {"name": "Closed", "position": 5, "color": "#68d391"}
            ]
        elif template_type == 'event_planning':
            columns = [
                {"name": "Ideas", "position": 0, "color": "#e2e8f0"},
                {"name": "Planning", "position": 1, "color": "#feb2b2"},
                {"name": "Budget Approval", "position": 2, "color": "#90cdf4"},
                {"name": "Vendor Communication", "position": 3, "color": "#fbd38d"},
                {"name": "Logistics", "position": 4, "color": "#d6bcfa"},
                {"name": "Marketing", "position": 5, "color": "#bee3f8"},
                {"name": "Event Day", "position": 6, "color": "#9ae6b4"},
                {"name": "Post Evaluation", "position": 7, "color": "#68d391"}
            ]
        else:
            columns = [
                {"name": "To Do", "position": 0, "color": "#e2e8f0"},
                {"name": "In Progress", "position": 1, "color": "#90cdf4"},
                {"name": "Done", "position": 2, "color": "#9ae6b4"}
            ]
            
        for column_data in columns:
            Column.objects.create(
                board=board,
                name=column_data["name"],
                position=column_data["position"],
                color=column_data["color"]
            )
            
        serializer = BoardSerializer(board)
        return Response(serializer.data)

class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Board.objects.filter(
            models.Q(project__created_by=user) | models.Q(project__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        project_id = serializer.validated_data.get('project').id
        project = get_object_or_404(Project, id=project_id)
        
        if not (self.request.user == project.created_by or self.request.user in project.members.all()):
            raise permissions.PermissionDenied("You do not have permission to create boards in this project.")
            
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def project_boards(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response(
                {"detail": "Project ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        project = get_object_or_404(Project, id=project_id)
        
        if not (request.user == project.created_by or request.user in project.members.all()):
            return Response(
                {"detail": "You do not have permission to view boards in this project."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        boards = Board.objects.filter(project=project)
        serializer = self.get_serializer(boards, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def light(self, request):
        queryset = self.get_queryset()
        serializer = BoardLightSerializer(queryset, many=True)
        return Response(serializer.data)

class ColumnViewSet(viewsets.ModelViewSet):
    """API endpoint for columns."""
    serializer_class = ColumnSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return columns from boards in projects the user is a member of."""
        user = self.request.user
        return Column.objects.filter(
            models.Q(board__project__created_by=user) | models.Q(board__project__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Create a new column and check permissions."""
        board_id = serializer.validated_data.get('board').id
        board = get_object_or_404(Board, id=board_id)
        
        if not (self.request.user == board.project.created_by or self.request.user in board.project.members.all()):
            raise permissions.PermissionDenied("You do not have permission to create columns in this board.")
        
        position = serializer.validated_data.get('position')
        if position is None:
            last_position = Column.objects.filter(board=board).order_by('-position').first()
            position = (last_position.position + 1) if last_position else 0
            serializer.validated_data['position'] = position
            
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def board_columns(self, request):
        """Get all columns for a specific board."""
        board_id = request.query_params.get('board_id')
        if not board_id:
            return Response(
                {"detail": "Board ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        board = get_object_or_404(Board, id=board_id)
        
        if not (request.user == board.project.created_by or request.user in board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to view columns in this board."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        columns = Column.objects.filter(board=board).order_by('position')
        serializer = self.get_serializer(columns, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder columns within a board."""
        board_id = request.data.get('board_id')
        column_order = request.data.get('column_order')
        
        if not board_id or not column_order:
            return Response(
                {"detail": "Board ID and column order are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        board = get_object_or_404(Board, id=board_id)
        
        if not (request.user == board.project.created_by or request.user in board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to reorder columns in this board."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        with transaction.atomic():
            for index, column_id in enumerate(column_order):
                column = get_object_or_404(Column, id=column_id, board=board)
                column.position = index
                column.save()
                
        return Response(
            {"detail": "Columns reordered successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def light(self, request):
        """Get a lightweight list of columns."""
        queryset = self.get_queryset()
        serializer = ColumnLightSerializer(queryset, many=True)
        return Response(serializer.data)

class TaskViewSet(viewsets.ModelViewSet):
    """API endpoint for tasks."""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['position', 'created_at', 'due_date', 'priority']
    
    def get_queryset(self):
        """Return tasks from columns in boards in projects the user is a member of."""
        user = self.request.user
        return Task.objects.filter(
            models.Q(column__board__project__created_by=user) | models.Q(column__board__project__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Create a new task and check permissions."""
        column_id = serializer.validated_data.get('column').id
        column = get_object_or_404(Column, id=column_id)
        
        if not (self.request.user == column.board.project.created_by or 
                self.request.user in column.board.project.members.all()):
            raise permissions.PermissionDenied("You do not have permission to create tasks in this column.")
        
        position = serializer.validated_data.get('position')
        if position is None:
            last_position = Task.objects.filter(column=column).order_by('-position').first()
            position = (last_position.position + 1) if last_position else 0
            serializer.validated_data['position'] = position
            
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def column_tasks(self, request):
        """Get all tasks for a specific column."""
        column_id = request.query_params.get('column_id')
        if not column_id:
            return Response(
                {"detail": "Column ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        column = get_object_or_404(Column, id=column_id)
        
        if not (request.user == column.board.project.created_by or 
                request.user in column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to view tasks in this column."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        tasks = Task.objects.filter(column=column).order_by('position')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder tasks within a column or move to another column."""
        source_column_id = request.data.get('source_column_id')
        destination_column_id = request.data.get('destination_column_id')
        task_order = request.data.get('task_order') 
        
        if not source_column_id or not destination_column_id or not task_order:
            return Response(
                {"detail": "Source column ID, destination column ID, and task order are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        source_column = get_object_or_404(Column, id=source_column_id)
        destination_column = get_object_or_404(Column, id=destination_column_id)
        
        if source_column.board.id != destination_column.board.id:
            return Response(
                {"detail": "Cannot move tasks between different boards."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if not (request.user == source_column.board.project.created_by or 
                request.user in source_column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to reorder tasks in this board."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        with transaction.atomic():
            for index, task_id in enumerate(task_order):
                task = get_object_or_404(Task, id=task_id)
                
                if task.column.id == int(source_column_id):
                    task.column = destination_column
                    task.position = index
                    task.save()
                    
        return Response(
            {"detail": "Tasks reordered successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign a task to a user."""
        task = self.get_object()
        
        if not (request.user == task.column.board.project.created_by or 
                request.user in task.column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to assign tasks in this project."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        user_id = request.data.get('user_id')
        
        if user_id is None:
            task.assigned_to = None
            task.save()
            return Response(
                {"detail": "Task unassigned successfully."},
                status=status.HTTP_200_OK
            )
            
        try:
            user = User.objects.get(id=user_id)
            
            if not (user == task.column.board.project.created_by or 
                    user in task.column.board.project.members.all()):
                return Response(
                    {"detail": "Cannot assign task to a user who is not a member of the project."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            task.assigned_to = user
            task.save()
            return Response(
                {"detail": f"Task assigned to {user.username} successfully."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to the current user."""
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def light(self, request):
        """Get a lightweight list of tasks."""
        queryset = self.get_queryset()
        serializer = TaskLightSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def date_filter(self, request):
        """Filter tasks by date range."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        
        if start_date:
            queryset = queryset.filter(due_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(due_date__lte=end_date)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def filter_by_tags(self, request):
        """Filter tasks by tags."""
        tag_ids = request.query_params.get('tag_ids')
        
        if not tag_ids:
            return Response(
                {"detail": "Tag IDs are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        tag_id_list = [int(id) for id in tag_ids.split(',')]
        
        queryset = self.get_queryset()
        for tag_id in tag_id_list:
            queryset = queryset.filter(task_tags__tag_id=tag_id)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class SubTaskViewSet(viewsets.ModelViewSet):
    """API endpoint for subtasks."""
    serializer_class = SubTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return subtasks of tasks the user has access to."""
        user = self.request.user
        return SubTask.objects.filter(
            models.Q(task__column__board__project__created_by=user) | 
            models.Q(task__column__board__project__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Create a new subtask and check permissions."""
        task_id = serializer.validated_data.get('task').id
        task = get_object_or_404(Task, id=task_id)
        
        if not (self.request.user == task.column.board.project.created_by or 
                self.request.user in task.column.board.project.members.all()):
            raise permissions.PermissionDenied("You do not have permission to create subtasks for this task.")
            
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def task_subtasks(self, request):
        """Get all subtasks for a specific task."""
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response(
                {"detail": "Task ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task = get_object_or_404(Task, id=task_id)
        
        if not (request.user == task.column.board.project.created_by or 
                request.user in task.column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to view subtasks for this task."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        subtasks = SubTask.objects.filter(task=task)
        serializer = self.get_serializer(subtasks, many=True)
        return Response(serializer.data)

class TagViewSet(viewsets.ModelViewSet):
    """API endpoint for tags."""
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return tags created by the current user."""
        return Tag.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the tag creator to the current user."""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_to_task(self, request, pk=None):
        """Add the tag to a task."""
        tag = self.get_object()
        
        task_id = request.data.get('task_id')
        if not task_id:
            return Response(
                {"detail": "Task ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task = get_object_or_404(Task, id=task_id)
        
        if not (request.user == task.column.board.project.created_by or 
                request.user in task.column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to add tags to this task."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if TaskTag.objects.filter(task=task, tag=tag).exists():
            return Response(
                {"detail": "Tag is already added to this task."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        TaskTag.objects.create(task=task, tag=tag)
        return Response(
            {"detail": "Tag added to task successfully."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def remove_from_task(self, request, pk=None):
        """Remove the tag from a task."""
        tag = self.get_object()
        
        task_id = request.data.get('task_id')
        if not task_id:
            return Response(
                {"detail": "Task ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task = get_object_or_404(Task, id=task_id)
        
        if not (request.user == task.column.board.project.created_by or 
                request.user in task.column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to remove tags from this task."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            task_tag = TaskTag.objects.get(task=task, tag=tag)
            task_tag.delete()
            return Response(
                {"detail": "Tag removed from task successfully."},
                status=status.HTTP_200_OK
            )
        except TaskTag.DoesNotExist:
            return Response(
                {"detail": "Tag is not added to this task."},
                status=status.HTTP_400_BAD_REQUEST
            )

class CommentViewSet(viewsets.ModelViewSet):
    """API endpoint for comments."""
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return comments on tasks the user has access to."""
        user = self.request.user
        return Comment.objects.filter(
            models.Q(task__column__board__project__created_by=user) | 
            models.Q(task__column__board__project__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Create a new comment and check permissions."""
        task_id = serializer.validated_data.get('task').id
        task = get_object_or_404(Task, id=task_id)
        
        if not (self.request.user == task.column.board.project.created_by or 
                self.request.user in task.column.board.project.members.all()):
            raise permissions.PermissionDenied("You do not have permission to comment on this task.")
            
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def task_comments(self, request):
        """Get all comments for a specific task."""
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response(
                {"detail": "Task ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task = get_object_or_404(Task, id=task_id)
        
        if not (request.user == task.column.board.project.created_by or 
                request.user in task.column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to view comments for this task."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        comments = Comment.objects.filter(task=task).order_by('-created_at')
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)

class AttachmentViewSet(viewsets.ModelViewSet):
    """API endpoint for attachments."""
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return attachments on tasks the user has access to."""
        user = self.request.user
        return Attachment.objects.filter(
            models.Q(task__column__board__project__created_by=user) | 
            models.Q(task__column__board__project__members=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Create a new attachment and check permissions."""
        task_id = serializer.validated_data.get('task').id
        task = get_object_or_404(Task, id=task_id)
        
        if not (self.request.user == task.column.board.project.created_by or 
                self.request.user in task.column.board.project.members.all()):
            raise permissions.PermissionDenied("You do not have permission to add attachments to this task.")
            
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def task_attachments(self, request):
        """Get all attachments for a specific task."""
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response(
                {"detail": "Task ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        task = get_object_or_404(Task, id=task_id)
        
        if not (request.user == task.column.board.project.created_by or 
                request.user in task.column.board.project.members.all()):
            return Response(
                {"detail": "You do not have permission to view attachments for this task."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        attachments = Attachment.objects.filter(task=task)
        serializer = self.get_serializer(attachments, many=True)
        return Response(serializer.data)