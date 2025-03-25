import { List, ListItem, Notice, Typography } from '@linode/ui';
import React from 'react';

import type { NoticeProps } from '@linode/ui';

interface AlertListNoticeMessagesProps extends NoticeProps {
  /**
   * The error message to display, potentially containing multiple errors
   */
  errorMessage: string;
  /**
   * The separator used to split the error message into individual errors
   */
  separator: string;
}

export const AlertListNoticeMessages = (
  props: AlertListNoticeMessagesProps
) => {
  const { errorMessage, separator, style, variant } = props;
  const errorList = errorMessage.split(separator);

  if (errorList.length > 1) {
    return (
      <Notice data-alert-notice style={style} variant={variant}>
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
    <Notice data-alert-notice style={style} variant={variant}>
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
