import { List, ListItem, Notice, Typography } from '@linode/ui';
import React from 'react';

import type { NoticeVariant } from '@linode/ui';

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
   * The visual variant of the notice (e.g., 'error', 'warning', 'success')
   */
  variant: NoticeVariant;
}

export const AlertListNoticeMessages = (
  props: AlertListNoticeMessagesProps
) => {
  const { errorMessage, separator, variant } = props;
  const errorList = errorMessage.split(separator);

  if (errorList.length > 1) {
    return (
      <AlertNoticeErrorState variant={variant}>
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
      </AlertNoticeErrorState>
    );
  } else {
    return (
      <AlertNoticeErrorState variant={variant}>
        <Typography
          sx={(theme) => ({
            fontFamily: theme.tokens.typography.Body.Bold,
          })}
          data-testid="alert_message_notice"
          variant="body2"
        >
          {errorList[0]}
        </Typography>
      </AlertNoticeErrorState>
    );
  }
};

/**
 * Wrapper component for displaying error messages within a Notice component
 */
const AlertNoticeErrorState = ({
  children,
  variant
}: {
  children: React.ReactNode;
  variant: NoticeVariant;
}): JSX.Element => {
  return (
    <Notice variant={variant}>
      {children}
    </Notice>
  );
};
