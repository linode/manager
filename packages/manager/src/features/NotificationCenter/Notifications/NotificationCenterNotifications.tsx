import { CircleProgress, StyledLinkButton } from '@linode/ui';
import React from 'react';

import { useStyles } from '../NotificationCenter.styles';
import {
  StyledCaret,
  StyledEmptyMessage,
  StyledLToggleContainer,
  StyledLoadingContainer,
  StyledNotificationCenterItem,
} from '../NotificationCenter.styles';

import type { NotificationCenterNotificationsItem } from '../types';

interface NotificationCenterNotificationsProps {
  content: NotificationCenterNotificationsItem[];
  count: number;
  emptyMessage?: string;
  header: 'Events' | 'Notifications';
  loading: boolean;
}

export const NotificationCenterNotifications = React.memo(
  (props: NotificationCenterNotificationsProps) => {
    const { classes, cx } = useStyles();
    const { content, count, emptyMessage, header, loading } = props;
    const [showAll, setShowAll] = React.useState(false);

    if (loading) {
      return (
        <StyledLoadingContainer>
          <CircleProgress size="sm" />
        </StyledLoadingContainer>
      );
    }

    const _content = showAll ? content : content.slice(0, count);

    if (_content.length === 0 && header === 'Notifications') {
      return null;
    }

    if (_content.length === 0 && header === 'Events') {
      return (
        <StyledEmptyMessage variant="body1">
          {emptyMessage
            ? emptyMessage
            : `You have no ${header.toLocaleLowerCase()}.`}
        </StyledEmptyMessage>
      );
    }

    return (
      <>
        {_content.map((notificationCenterItem) => (
          <StyledNotificationCenterItem
            data-testid="notification-item"
            header={props.header}
            key={`notification-row-${notificationCenterItem.id}`}
          >
            {notificationCenterItem.body}
          </StyledNotificationCenterItem>
        ))}
        {content.length > count ? (
          <StyledLToggleContainer display="flex" justifyContent="flex-end">
            <StyledLinkButton
              sx={(theme) => ({
                color: 'primary.main',
                font: theme.font.bold,
                textDecoration: 'none !important',
              })}
              aria-label={`Display all ${content.length} items`}
              data-testid="showMoreButton"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Collapse' : `${content.length - count} more`}
              <StyledCaret
                className={cx({
                  [classes.inverted]: showAll,
                })}
              />
            </StyledLinkButton>
          </StyledLToggleContainer>
        ) : null}
      </>
    );
  }
);
