import { ReactNode } from 'react';

export type ProjectStatus = 'intake' | 'analyzing' | 'underwriting' | 'accepted' | 'closed';

export const PROJECT_STATUSES: ProjectStatus[] = ['intake', 'analyzing', 'underwriting', 'accepted', 'closed'];

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  intake: {
    label: 'Intake',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 border-gray-300',
    icon: '📋',
  },
  analyzing: {
    label: 'Analyzing',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 border-blue-300',
    icon: '🔍',
  },
  underwriting: {
    label: 'Underwriting',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 border-amber-300',
    icon: '📊',
  },
  accepted: {
    label: 'Accepted',
    color: 'text-green-700',
    bgColor: 'bg-green-100 border-green-300',
    icon: '✅',
  },
  closed: {
    label: 'Closed',
    color: 'text-slate-600',
    bgColor: 'bg-slate-200 border-slate-400',
    icon: '🏁',
  },
};

// Map old statuses to new ones for backward compatibility
export function normalizeStatus(status: string): ProjectStatus {
  const map: Record<string, ProjectStatus> = {
    new: 'intake',
    analyzing: 'analyzing',
    quoted: 'underwriting',
    accepted: 'accepted',
    'in-progress': 'accepted',
    completed: 'closed',
    // New statuses map to themselves
    intake: 'intake',
    underwriting: 'underwriting',
    closed: 'closed',
  };
  return map[status] || 'intake';
}

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function StatusBadge({ status, size = 'sm', showIcon = true, className = '' }: StatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const config = STATUS_CONFIG[normalized];

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${config.bgColor} ${config.color} ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      {config.label}
    </span>
  );
}

// Suggested next status based on project progress
export function getSuggestedStatus(project: {
  status: string;
  photoFolderId?: string;
  cachedScopeOfWork?: any;
  cachedCostEstimate?: any;
  photoCount?: number;
}): ProjectStatus | null {
  const current = normalizeStatus(project.status);

  // When photos uploaded → suggest "Analyzing"
  if (current === 'intake' && project.photoFolderId && (project.photoCount || 0) > 0) {
    return 'analyzing';
  }

  // When AI analysis complete → suggest "Underwriting"
  if (current === 'analyzing' && project.cachedScopeOfWork) {
    return 'underwriting';
  }

  // When cost estimate saved → suggest "Accepted"
  if (current === 'underwriting' && project.cachedCostEstimate) {
    return 'accepted';
  }

  return null;
}
