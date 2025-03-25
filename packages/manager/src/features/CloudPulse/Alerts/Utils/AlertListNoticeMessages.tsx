import { List, ListItem, Notice, Typography } from '@linode/ui';
import React from 'react';

import type { NoticeVariant } from '@linode/ui';
import type { SxProps } from '@mui/material';

interface AlertListNoticeMessagesProps {
  /**
   * The error message to display, potentially containing multiple errors
   */
  errorMessage: string;
  /**
   * The separator used to split the error message into individual errors
   */
  separator: string;
  /**
   * Additional styles to apply for the Notice component
   */
  sx?: SxProps;
  /**
   * The visual variant of the notice (e.g., 'error', 'warning', 'success')
   */
  variant: NoticeVariant;
}

export const AlertListNoticeMessages = (
  props: AlertListNoticeMessagesProps
) => {
  const { errorMessage, separator, sx, variant } = props;
  const errorList = errorMessage.split(separator);

  if (errorList.length > 1) {
    return (
      <Notice data-alert-notice sx={sx} variant={variant}>
        <List sx={{ listStyleType: 'disc', pl: 1.5 }}>
          {errorList.map((error, index) => (
            <ListItem
              data-testid="alert_notice_message_list"
              key={index}
              sx={{ display: 'list-item', pl: 0.5, py: 0.5 }}
            >
              {error}
            </ListItem>
          ))}
        </List>
      </Notice>
    );
  }

  return (
    <Notice data-alert-notice sx={sx} variant={variant}>
      <Typography
        sx={(theme) => ({
          fontFamily: theme.tokens.font.FontWeight.Bold,
        })}
        data-testid="alert_message_notice"
      >
        {errorList[0]}
      </Typography>
    </Notice>
  );
};
