import { List, ListItem, Notice, Typography } from '@linode/ui';
import React from 'react';

import type { NoticeVariant } from '@linode/ui';

interface AlertListNoticeMessagesProps {
  errorMessage: string;
  variant: NoticeVariant;
}

export const AlertListNoticeMessages = (
  props: AlertListNoticeMessagesProps
) => {
  const { errorMessage, variant } = props;
  if (!errorMessage.length) {
    return null;
  }
  const errorList = errorMessage.split('|');

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
            fontFamily: theme.font.bold,
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

const AlertNoticeErrorState = ({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: NoticeVariant;
}) => {
  return (
    <Notice spacingBottom={0} spacingTop={4} variant={variant}>
      {children}
    </Notice>
  );
};
