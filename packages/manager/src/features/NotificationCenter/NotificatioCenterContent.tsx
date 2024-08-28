import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';

import { useStyles } from './NotificationCenter.styles';
import {
  StyledCaret,
  StyledEmptyMessage,
  StyledLToggleContainer,
  StyledLoadingContainer,
  StyledNotificationCenterItem,
} from './NotificationCenter.styles';

import type { NotificationCenterItem } from './NotificationCenter';

interface BodyProps {
  content: NotificationCenterItem[];
  count: number;
  emptyMessage?: string;
  header: string;
  loading: boolean;
}

export const NotificationCenterContent = React.memo((props: BodyProps) => {
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

  return _content.length > 0 ? (
    // eslint-disable-next-line
    <>
      {_content.map((thisItem) => (
        <StyledNotificationCenterItem
          data-testid="notification-item"
          header={props.header}
          key={`notification-row-${thisItem.id}`}
        >
          {thisItem.body}
        </StyledNotificationCenterItem>
      ))}
      {content.length > count ? (
        <StyledLToggleContainer display="flex" justifyContent="flex-end">
          <StyledLinkButton
            sx={(theme) => ({
              color: 'primary.main',
              fontFamily: theme.font.bold,
              textDecoration: 'none !important',
            })}
            aria-label={`Display all ${content.length} items`}
            data-test-id="showMoreButton"
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
  ) : header === 'Events' ? (
    <StyledEmptyMessage variant="body1">
      {emptyMessage
        ? emptyMessage
        : `You have no ${header.toLocaleLowerCase()}.`}
    </StyledEmptyMessage>
  ) : null;
});
