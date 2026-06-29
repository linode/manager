import * as React from 'react';

import styles from './drawerInlineActions.module.css';

export const DrawerInlineActions = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className={styles.drawerInlineActions}>{children}</div>;
};
