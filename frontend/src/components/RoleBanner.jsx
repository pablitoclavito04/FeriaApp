import { useState } from 'react';

// Explains the current user's role and how to get more access. Shown on the
// dashboard after login; dismissible.
const MESSAGES = {
  admin: {
    title: 'You are an Admin',
    text: 'You have full access: create, edit, delete, publish the public website, and manage user roles in the Users section.',
  },
  editor: {
    title: 'You are an Editor',
    text: 'You can edit existing fairs, casetas, menus and concerts. You cannot create, delete or publish. To get more access, ask an admin to upgrade your role.',
  },
  viewer: {
    title: 'You are a Viewer',
    text: 'You can view everything in read-only mode. To create or edit content, ask an admin to upgrade your role to editor or admin.',
  },
};

const RoleBanner = ({ role }) => {
  const [dismissed, setDismissed] = useState(false);
  const info = MESSAGES[role];

  if (!info || dismissed) return null;

  return (
    <div className="role-banner">
      <div>
        <strong>{info.title}.</strong> {info.text}
      </div>
      <button className="role-banner__close" onClick={() => setDismissed(true)} aria-label="Dismiss">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default RoleBanner;
