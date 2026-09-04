// Central design tokens so the whole app looks consistent.
export const colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  accent: '#F59E0B',

  bg: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',

  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',

  white: '#FFFFFF',
};

// Color used for each task status.
export const statusColors = {
  'To Do': '#6B7280',
  'In Progress': '#2563EB',
  Completed: '#10B981',
};

// Color used for each priority level.
export const priorityColors = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export const STATUSES = ['To Do', 'In Progress', 'Completed'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

// 4-point spacing scale.
export const sp = (n) => n * 4;

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
