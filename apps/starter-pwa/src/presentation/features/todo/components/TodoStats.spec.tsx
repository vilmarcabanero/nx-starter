import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoStats } from './TodoStats';

// Mock the view model
const mockViewModel = {
  stats: {
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0,
  },
  currentFilter: 'all' as 'all' | 'active' | 'completed',
  handleFilterChange: vi.fn(),
};

vi.mock('../view-models/useTodoStatsViewModel', () => ({
  useTodoStatsViewModel: () => mockViewModel,
}));

describe('TodoStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockViewModel.stats = {
      total: 0,
      active: 0,
      completed: 0,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'all';
  });

  it('should render stats with correct counts', () => {
    mockViewModel.stats = {
      total: 10,
      active: 6,
      completed: 4,
      overdue: 0,
      highPriority: 0,
    };

    render(<TodoStats />);

    expect(screen.getByText('Total: 10')).toBeInTheDocument();
    expect(screen.getByText('Active: 6')).toBeInTheDocument();
    expect(screen.getByText('Completed: 4')).toBeInTheDocument();
  });

  it('should highlight the All filter when filter is "all"', () => {
    mockViewModel.stats = {
      total: 5,
      active: 3,
      completed: 2,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'all';

    render(<TodoStats />);

    const allButton = screen.getByRole('tab', { name: 'All' });
    const activeButton = screen.getByRole('tab', { name: 'Active' });
    const completedButton = screen.getByRole('tab', { name: 'Completed' });

    // The All button should have the default variant (highlighted)
    expect(allButton).toBeInTheDocument();
    expect(activeButton).toBeInTheDocument();
    expect(completedButton).toBeInTheDocument();
  });

  it('should highlight the Active filter when filter is "active"', () => {
    mockViewModel.stats = {
      total: 5,
      active: 3,
      completed: 2,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'active';

    render(<TodoStats />);

    const allButton = screen.getByRole('tab', { name: 'All' });
    const activeButton = screen.getByRole('tab', { name: 'Active' });
    const completedButton = screen.getByRole('tab', { name: 'Completed' });

    expect(allButton).toBeInTheDocument();
    expect(activeButton).toBeInTheDocument();
    expect(completedButton).toBeInTheDocument();
  });

  it('should highlight the Completed filter when filter is "completed"', () => {
    mockViewModel.stats = {
      total: 5,
      active: 3,
      completed: 2,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'completed';

    render(<TodoStats />);

    const allButton = screen.getByRole('tab', { name: 'All' });
    const activeButton = screen.getByRole('tab', { name: 'Active' });
    const completedButton = screen.getByRole('tab', { name: 'Completed' });

    expect(allButton).toBeInTheDocument();
    expect(activeButton).toBeInTheDocument();
    expect(completedButton).toBeInTheDocument();
  });

  it('should call handleFilterChange with "all" when All button is clicked', async () => {
    const user = userEvent.setup();
    mockViewModel.stats = {
      total: 5,
      active: 3,
      completed: 2,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'active';

    render(<TodoStats />);

    const allButton = screen.getByRole('tab', { name: 'All' });
    await user.click(allButton);

    expect(mockViewModel.handleFilterChange).toHaveBeenCalledWith('all');
  });

  it('should call handleFilterChange with "active" when Active button is clicked', async () => {
    const user = userEvent.setup();
    mockViewModel.stats = {
      total: 5,
      active: 3,
      completed: 2,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'all';

    render(<TodoStats />);

    const activeButton = screen.getByRole('tab', { name: 'Active' });
    await user.click(activeButton);

    expect(mockViewModel.handleFilterChange).toHaveBeenCalledWith('active');
  });

  it('should call handleFilterChange with "completed" when Completed button is clicked', async () => {
    const user = userEvent.setup();
    mockViewModel.stats = {
      total: 5,
      active: 3,
      completed: 2,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'all';

    render(<TodoStats />);

    const completedButton = screen.getByRole('tab', { name: 'Completed' });
    await user.click(completedButton);

    expect(mockViewModel.handleFilterChange).toHaveBeenCalledWith('completed');
  });

  it('should render with zero counts', () => {
    mockViewModel.stats = {
      total: 0,
      active: 0,
      completed: 0,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'all';

    render(<TodoStats />);

    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('Active: 0')).toBeInTheDocument();
    expect(screen.getByText('Completed: 0')).toBeInTheDocument();
  });

  it('should render all filter buttons', () => {
    mockViewModel.stats = {
      total: 5,
      active: 3,
      completed: 2,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'all';

    render(<TodoStats />);

    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Completed' })).toBeInTheDocument();
  });

  it('should handle large numbers correctly', () => {
    mockViewModel.stats = {
      total: 1000,
      active: 999,
      completed: 1,
      overdue: 0,
      highPriority: 0,
    };
    mockViewModel.currentFilter = 'all';

    render(<TodoStats />);

    expect(screen.getByText('Total: 1000')).toBeInTheDocument();
    expect(screen.getByText('Active: 999')).toBeInTheDocument();
    expect(screen.getByText('Completed: 1')).toBeInTheDocument();
  });
});
