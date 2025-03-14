import { Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { StyledNotice } from '../AlertsResources/AlertsResourcesNotice';

import type { NoticeVariant } from '@linode/ui';

interface AlertsNoticeProps {
  /**
   * The text that needs to be displayed in the notice
   */
  text: string;
  /**
   * The variant of notice like info, error, warning
   */
  variant?: NoticeVariant;
}

export const AlertsNoticeMessage = (props: AlertsNoticeProps) => {
  const { text, variant } = props;

  return (
    <Grid item xs={12}>
      <StyledNotice variant={variant}>
        <Typography
          sx={(theme) => ({
            fontFamily: theme.tokens.typography.Body.Bold,
          })}
          data-testid="alert_message_notice"
        >
          {text}
        </Typography>
      </StyledNotice>
    </Grid>
  );
};
