import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoStats } from '../presentation/components/Todo/TodoStats';

describe('TodoStats', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('should render stats with correct counts', () => {
    render(
      <TodoStats
        total={10}
        active={6}
        completed={4}
        filter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Total: 10')).toBeInTheDocument();
    expect(screen.getByText('Active: 6')).toBeInTheDocument();
    expect(screen.getByText('Completed: 4')).toBeInTheDocument();
  });

  it('should highlight the All filter when filter is "all"', () => {
    render(
      <TodoStats
        total={5}
        active={3}
        completed={2}
        filter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const allButton = screen.getByRole('button', { name: 'All' });
    const activeButton = screen.getByRole('button', { name: 'Active' });
    const completedButton = screen.getByRole('button', { name: 'Completed' });

    // The All button should have the default variant (highlighted)
    expect(allButton).toBeInTheDocument();
    expect(activeButton).toBeInTheDocument();
    expect(completedButton).toBeInTheDocument();
  });

  it('should highlight the Active filter when filter is "active"', () => {
    render(
      <TodoStats
        total={5}
        active={3}
        completed={2}
        filter="active"
        onFilterChange={mockOnFilterChange}
      />
    );

    const allButton = screen.getByRole('button', { name: 'All' });
    const activeButton = screen.getByRole('button', { name: 'Active' });
    const completedButton = screen.getByRole('button', { name: 'Completed' });

    expect(allButton).toBeInTheDocument();
    expect(activeButton).toBeInTheDocument();
    expect(completedButton).toBeInTheDocument();
  });

  it('should highlight the Completed filter when filter is "completed"', () => {
    render(
      <TodoStats
        total={5}
        active={3}
        completed={2}
        filter="completed"
        onFilterChange={mockOnFilterChange}
      />
    );

    const allButton = screen.getByRole('button', { name: 'All' });
    const activeButton = screen.getByRole('button', { name: 'Active' });
    const completedButton = screen.getByRole('button', { name: 'Completed' });

    expect(allButton).toBeInTheDocument();
    expect(activeButton).toBeInTheDocument();
    expect(completedButton).toBeInTheDocument();
  });

  it('should call onFilterChange with "all" when All button is clicked', () => {
    render(
      <TodoStats
        total={5}
        active={3}
        completed={2}
        filter="active"
        onFilterChange={mockOnFilterChange}
      />
    );

    const allButton = screen.getByRole('button', { name: 'All' });
    fireEvent.click(allButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });

  it('should call onFilterChange with "active" when Active button is clicked', () => {
    render(
      <TodoStats
        total={5}
        active={3}
        completed={2}
        filter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const activeButton = screen.getByRole('button', { name: 'Active' });
    fireEvent.click(activeButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('active');
  });

  it('should call onFilterChange with "completed" when Completed button is clicked', () => {
    render(
      <TodoStats
        total={5}
        active={3}
        completed={2}
        filter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    const completedButton = screen.getByRole('button', { name: 'Completed' });
    fireEvent.click(completedButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('completed');
  });

  it('should render with zero counts', () => {
    render(
      <TodoStats
        total={0}
        active={0}
        completed={0}
        filter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('Active: 0')).toBeInTheDocument();
    expect(screen.getByText('Completed: 0')).toBeInTheDocument();
  });

  it('should render all filter buttons', () => {
    render(
      <TodoStats
        total={5}
        active={3}
        completed={2}
        filter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
  });

  it('should handle large numbers correctly', () => {
    render(
      <TodoStats
        total={1000}
        active={999}
        completed={1}
        filter="all"
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('Total: 1000')).toBeInTheDocument();
    expect(screen.getByText('Active: 999')).toBeInTheDocument();
    expect(screen.getByText('Completed: 1')).toBeInTheDocument();
  });
});
