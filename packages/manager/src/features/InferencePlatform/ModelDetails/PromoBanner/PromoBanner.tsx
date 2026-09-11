import React from 'react';

import { Paper } from '../../components/Paper/Paper';
import { Typography } from '../../components/Typography/Typography';
import styles from './PromoBanner.module.css';

export const PromoBanner = () => {
  return (
    <Paper className={styles.paper}>
      <Typography className={styles.label}>
        User-benefit advertisement
      </Typography>
    </Paper>
  );
};
