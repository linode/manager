import { Grid } from '@mui/material';

import NullComponent from 'src/components/NullComponent';

import { StyledNotice } from '../AlertsResources/AlertsResourcesNotice';

import { Typography, type NoticeVariant } from '@linode/ui';
import React from 'react';

interface ResourcesNoticeProps {
  /**
   * The text that needs to be displayed in the notice
   */
  text?: string;
  /**
   * The variant of notice like info, error, warning
   */
  variant?: NoticeVariant;
}

export const AlertsNoticeMessage = (props: ResourcesNoticeProps) => {
  const { text, variant } = props;

  if (!text?.length) {
    return <NullComponent />;
  }

  return (
    <Grid item xs={12}>
      <StyledNotice variant={variant}>
        <Typography
          sx={(theme) => ({
            fontFamily: theme.font.bold,
          })}
          data-testid="alert_message_notice"
          variant="body2"
        >
          {text}
        </Typography>
      </StyledNotice>
    </Grid>
  );
};
