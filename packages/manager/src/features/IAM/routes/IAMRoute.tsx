import { Outlet } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from '../Shared/DocumentTitleSegment/DocumentTitleSegment';
import styles from '../Shared/global.module.css';
import { SuspenseLoader } from '../Shared/SuspenseLoader/SuspenseLoader';

export const IAMRoute = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <div className={styles.noMargin}>
        <DocumentTitleSegment segment="Identity and Access" />
        <Outlet />
      </div>
    </React.Suspense>
  );
};
