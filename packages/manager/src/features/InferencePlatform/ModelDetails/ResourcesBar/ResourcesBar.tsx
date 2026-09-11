import React from 'react';

import { Paper } from '../../components/Paper/Paper';
import { Typography } from '../../components/Typography/Typography';
import styles from './ResourcesBar.module.css';

export const ResourcesBar = () => {
  return (
    <Paper className={styles.paper}>
      <Typography className={styles.label}>
        Doc / SI Workflow / Guides / Benchmark
      </Typography>
    </Paper>
  );
};
