import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoItem } from './TodoItem';
import { Todo } from '@nx-starter/domain';
import { TEST_UUIDS } from '../../../../test/test-helpers';

// Mock the view model
const mockViewModel = {
  isEditing: false,
  editTitle: '',
  isUpdating: false,
  toggleComplete: vi.fn(),
  startEditing: vi.fn(),
  cancelEditing: vi.fn(),
  saveEdit: vi.fn(),
  deleteTodo: vi.fn(),
  handleEditTitleChange: vi.fn(),
  handleKeyDown: vi.fn(),
};

vi.mock('../view-models/useTodoItemViewModel', () => ({
  useTodoItemViewModel: () => mockViewModel,
}));

describe('TodoItem', () => {
  const mockTodo: Todo = new Todo(
    'Test Todo',
    false,
    new Date('2024-01-01T10:00:00Z'),
    TEST_UUIDS.TODO_1
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(mockTodo, 'isOverdue').mockReturnValue(false);
    mockViewModel.isEditing = false;
    mockViewModel.editTitle = mockTodo.titleValue;
    mockViewModel.isUpdating = false;
  });

  it('should render todo item with checkbox, title, and buttons', () => {
    render(<TodoItem todo={mockTodo} />);

    expect(screen.getByText(mockTodo.titleValue)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should show checked checkbox when todo is completed', () => {
    const completedTodo = new Todo(
      'Test Todo',
      true,
      new Date('2024-01-01T10:00:00Z'),
      TEST_UUIDS.TODO_2
    );
    render(<TodoItem todo={completedTodo} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call toggleComplete when checkbox is clicked', async () => {
    render(<TodoItem todo={mockTodo} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockViewModel.toggleComplete).toHaveBeenCalled();
  });

  it('should call deleteTodo when delete button is clicked', async () => {
    render(<TodoItem todo={mockTodo} />);

    const deleteButton = screen.getByTestId('delete-todo');
    fireEvent.click(deleteButton);

    expect(mockViewModel.deleteTodo).toHaveBeenCalled();
  });

  it('should call startEditing when edit button is clicked', () => {
    render(<TodoItem todo={mockTodo} />);

    const editButton = screen.getByTestId('edit-todo');
    fireEvent.click(editButton);

    expect(mockViewModel.startEditing).toHaveBeenCalled();
  });

  it('should call startEditing when title is clicked', () => {
    render(<TodoItem todo={mockTodo} />);

    const titleSpan = screen.getByTestId('todo-title');
    fireEvent.click(titleSpan);

    expect(mockViewModel.startEditing).toHaveBeenCalled();
  });

  it('should render edit mode when isEditing is true', () => {
    mockViewModel.isEditing = true;
    render(<TodoItem todo={mockTodo} />);

    expect(screen.getByTestId('todo-edit-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-todo')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-edit')).toBeInTheDocument();
  });

  it('should call cancelEditing when cancel button is clicked', () => {
    mockViewModel.isEditing = true;
    render(<TodoItem todo={mockTodo} />);

    const cancelButton = screen.getByTestId('cancel-edit');
    fireEvent.click(cancelButton);

    expect(mockViewModel.cancelEditing).toHaveBeenCalled();
  });

  it('should call handleKeyDown when key is pressed in edit input', () => {
    mockViewModel.isEditing = true;
    render(<TodoItem todo={mockTodo} />);

    const input = screen.getByTestId('todo-edit-input');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockViewModel.handleKeyDown).toHaveBeenCalled();
  });

  it('should call saveEdit when save button is clicked', () => {
    mockViewModel.isEditing = true;
    render(<TodoItem todo={mockTodo} />);

    const saveButton = screen.getByTestId('save-todo');
    fireEvent.click(saveButton);

    expect(mockViewModel.saveEdit).toHaveBeenCalled();
  });

  it('should show overdue indicator when todo is overdue', () => {
    const overdueTodo = new Todo(
      'Test Todo',
      false,
      new Date('2024-01-01T10:00:00Z'),
      TEST_UUIDS.TODO_3
    );
    vi.spyOn(overdueTodo, 'isOverdue').mockReturnValue(true);
    render(<TodoItem todo={overdueTodo} />);

    expect(screen.getByText('• Overdue')).toBeInTheDocument();
  });

  it('should show strikethrough text when todo is completed', () => {
    const completedTodo = new Todo(
      'Test Todo',
      true,
      new Date('2024-01-01T10:00:00Z'),
      TEST_UUIDS.TODO_4
    );
    render(<TodoItem todo={completedTodo} />);

    const titleSpan = screen.getByText(completedTodo.titleValue);
    expect(titleSpan).toHaveClass('line-through');
  });

  it('should disable save button when editTitle is empty', () => {
    mockViewModel.isEditing = true;
    mockViewModel.editTitle = '';
    render(<TodoItem todo={mockTodo} />);

    const saveButton = screen.getByTestId('save-todo');
    expect(saveButton).toBeDisabled();
  });

  it('should call handleEditTitleChange when input changes', () => {
    mockViewModel.isEditing = true;
    render(<TodoItem todo={mockTodo} />);

    const input = screen.getByTestId('todo-edit-input');
    fireEvent.change(input, { target: { value: 'New title' } });

    expect(mockViewModel.handleEditTitleChange).toHaveBeenCalledWith('New title');
  });

  it('should show opacity when isUpdating is true', () => {
    mockViewModel.isUpdating = true;
    render(<TodoItem todo={mockTodo} />);

    const todoItem = screen.getByTestId('todo-item');
    expect(todoItem).toHaveClass('opacity-50');
  });

  it('should render edit input with current editTitle value', () => {
    mockViewModel.isEditing = true;
    mockViewModel.editTitle = 'Current edit title';
    render(<TodoItem todo={mockTodo} />);

    const input = screen.getByTestId('todo-edit-input');
    expect(input).toHaveValue('Current edit title');
  });

});
