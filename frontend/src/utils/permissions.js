// Role-based permission helpers used to show/hide actions in the panel.
// The backend enforces these for real; this is only for UX.
//
//   admin  -> everything
//   editor -> edit existing items only
//   viewer -> read only

export const canCreate = (role) => role === 'admin';
export const canEdit = (role) => role === 'admin' || role === 'editor';
export const canDelete = (role) => role === 'admin';
export const canPublish = (role) => role === 'admin';
export const canManageUsers = (role) => role === 'admin';
