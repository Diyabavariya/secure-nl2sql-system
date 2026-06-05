import React from 'react';

import AccessDeniedPage from './AccessDeniedPage';

export default function ProtectedSection({ allowed, role, resource, onBack, children }) {
  if (!allowed) {
    return <AccessDeniedPage role={role} resource={resource} onBack={onBack} />;
  }

  return children;
}