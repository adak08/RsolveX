import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  User, 
  Building2, 
  FileText, 
  XCircle,
  MessageSquare,
  Settings,
  Star
} from 'lucide-react';

export const formatAuditEvent = (log) => {
  const { action, metadata = {}, actorName, actorModel, targetName, targetModel, summary } = log;
  
  // Default fallback event
  let event = {
    title: action?.replace(/\./g, ' → ') || 'Activity Logged',
    description: summary || 'A system event occurred',
    icon: FileText,
    color: 'gray',
    details: metadata
  };

  // Safe object extractor for nested metadata
  const getMeta = (key) => {
    // metadata might be an array of {key, label, value} or a raw object
    if (Array.isArray(metadata)) {
      const item = metadata.find(m => m && m.key === key);
      return item ? item.value : null;
    }
    return metadata?.[key];
  };

  const getUpdates = () => {
    if (Array.isArray(metadata)) {
      const updatesItem = metadata.find(m => m && m.key === 'updates');
      return updatesItem?.value;
    }
    return metadata?.updates;
  };

  const getActivityLog = () => {
    if (Array.isArray(metadata)) {
      const act = metadata.find(m => m && m.key === 'activityLog');
      return act?.value;
    }
    return metadata?.activityLog;
  };

  const targetDisplay = targetName || targetModel || 'Item';
  const actorDisplay = actorName || actorModel || 'System';

  switch (action) {
    case 'complaint.created':
      event.title = 'Complaint Submitted';
      event.description = `New complaint submitted by ${actorDisplay}`;
      event.icon = FileText;
      event.color = 'blue';
      break;

    case 'complaint.assigned':
    case 'complaint.bulk_assigned':
      event.title = 'Staff Assigned';
      const assignedTo = getMeta('assignedTo') || getMeta('assignedToName') || 'a staff member';
      event.description = `Assigned to ${assignedTo}`;
      event.icon = User;
      event.color = 'blue';
      break;

    case 'complaint.status_changed':
    case 'complaint.updated':
      event.title = 'Complaint Updated';
      event.icon = Clock;
      event.color = 'purple';
      
      const updates = getUpdates();
      const activityLog = getActivityLog();
      
      if (activityLog && Array.isArray(activityLog) && activityLog.length > 0) {
        event.description = activityLog.join(', ');
      } else if (activityLog && typeof activityLog === 'string') {
        event.description = activityLog;
      } else if (updates && updates.status) {
        event.title = 'Status Changed';
        event.description = `Status updated to ${updates.status}`;
        
        if (updates.status === 'resolved') {
          event.icon = CheckCircle2;
          event.color = 'green';
        } else if (updates.status === 'rejected') {
          event.icon = XCircle;
          event.color = 'red';
        } else if (updates.status === 'in-progress') {
          event.icon = Clock;
          event.color = 'purple';
        }
      } else {
        event.description = summary || 'Details of the complaint were modified';
      }
      break;

    case 'complaint.resolved':
      event.title = 'Complaint Resolved';
      event.description = `Resolution confirmed by ${actorDisplay}`;
      event.icon = CheckCircle2;
      event.color = 'green';
      break;

    case 'complaint.rejected':
      event.title = 'Complaint Rejected';
      const reason = getMeta('rejectionReason') || getMeta('reason');
      event.description = reason ? `Reason: ${reason}` : 'Complaint was rejected';
      event.icon = XCircle;
      event.color = 'red';
      break;

    case 'complaint.rated':
      event.title = 'Complaint Rated';
      const score = getMeta('score');
      event.description = score ? `Rated ${score} stars by ${actorDisplay}` : 'User submitted a rating';
      event.icon = Star;
      event.color = 'yellow';
      break;

    case 'staff.registered':
      event.title = 'Staff Registered';
      event.description = `${targetDisplay} joined the team`;
      event.icon = UserPlus;
      event.color = 'teal';
      break;

    case 'user.joined_workspace':
    case 'staff.joined_workspace':
      event.title = 'Joined Workspace';
      event.description = `${actorDisplay} joined the workspace`;
      event.icon = Building2;
      event.color = 'amber';
      break;

    case 'workspace.settings_updated':
      event.title = 'Settings Updated';
      event.description = 'Workspace configuration was modified';
      event.icon = Settings;
      event.color = 'gray';
      break;

    case 'complaint.commented':
      event.title = 'Comment Added';
      event.description = 'A new comment was added to the thread';
      event.icon = MessageSquare;
      event.color = 'gray';
      break;
      
    default:
      if (action?.includes('created')) {
        event.color = 'blue';
      } else if (action?.includes('updated')) {
        event.color = 'purple';
      } else if (action?.includes('deleted') || action?.includes('removed')) {
        event.color = 'red';
        event.icon = XCircle;
      }
      break;
  }

  // Ensure details is an object and clean up unnecessary technical keys
  if (Array.isArray(event.details)) {
    // If it's our old format [{key, label, value}]
    if (event.details.every(item => item && typeof item === 'object' && 'key' in item)) {
      const cleanDetails = {};
      event.details.forEach(item => {
        cleanDetails[item.label || item.key] = item.value;
      });
      event.details = cleanDetails;
    }
  }

  return event;
};

export const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500'
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    dot: 'bg-yellow-500'
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500'
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500'
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400'
  }
};
