import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Box } from 'src/components/Box';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import { NotificationCenterContent } from './NotificatioCenterContent';
import { useStyles } from './NotificationCenter.styles';
import { StyledHeader, StyledRootContainer } from './NotificationCenter.styles';
import { useFormattedNotifications } from './useFormattedNotifications';

export interface NotificationCenterItem {
  body: JSX.Element | string;
  countInTotal: boolean;
  eventId: number;
  id: string;
  showProgress?: boolean;
}

interface NotificationCenterProps {
  count?: number;
  loading?: boolean;
  onCloseNotificationCenter?: () => void;
  showMoreTarget?: string;
  showMoreText?: string;
}

export const NotificationCenter = (props: NotificationCenterProps) => {
  const { classes, cx } = useStyles();
  const notifications = useFormattedNotifications();
  const header = 'Notifications';
  const emptyMessage = 'No notifications to display.';

  const {
    count,
    loading,
    onCloseNotificationCenter,
    showMoreTarget,
    showMoreText,
  } = props;

  const _count = count ?? 5;
  const _loading = Boolean(loading); // false if not provided
  const isActualNotificationContainer = header === 'Notifications';

  if (isActualNotificationContainer && notifications.length === 0) {
    return null;
  }

  return (
    <>
      <Hidden smDown>
        <StyledRootContainer
          className={cx({
            [classes.notificationSpacing]: isActualNotificationContainer,
          })}
        >
          <Box sx={{ width: '100%' }}>
            <StyledHeader>
              <Typography variant="h3">{header}</Typography>
              {showMoreTarget && (
                <strong>
                  <Link
                    onClick={onCloseNotificationCenter}
                    style={{ padding: 0 }}
                    to={showMoreTarget}
                  >
                    {showMoreText ?? 'View history'}
                  </Link>
                </strong>
              )}
            </StyledHeader>
            <NotificationCenterContent
              content={notifications}
              count={_count}
              emptyMessage={emptyMessage}
              header={header}
              loading={_loading}
            />
          </Box>
        </StyledRootContainer>
      </Hidden>

      <Hidden smUp>
        <Accordion
          headingNumberCount={
            notifications.length > 0 ? notifications.length : undefined
          }
          defaultExpanded={true}
          heading={header}
        >
          <NotificationCenterContent
            content={notifications}
            count={_count}
            emptyMessage={emptyMessage}
            header={header}
            loading={_loading}
          />
        </Accordion>
      </Hidden>
    </>
  );
};
