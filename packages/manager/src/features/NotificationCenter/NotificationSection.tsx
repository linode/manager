import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Accordion } from 'src/components/Accordion';
import { Box } from 'src/components/Box';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  inverted: {
    transform: 'rotate(180deg)',
  },
  notificationSpacing: {
    '& > div:not(:first-child)': {
      margin: `${theme.spacing()} 0`,
      padding: '0 20px',
    },
    marginBottom: theme.spacing(2),
  },
  showMore: {
    '&:hover': {
      textDecoration: 'none',
    },
    alignItems: 'center',
    display: 'flex',
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: theme.spacing(),
  },
}));

export interface NotificationItem {
  body: JSX.Element | string;
  countInTotal: boolean;
  id: string;
}

interface NotificationSectionProps {
  content: NotificationItem[];
  count?: number;
  emptyMessage?: string;
  header: string;
  loading?: boolean;
  showMoreTarget?: string;
  showMoreText?: string;
}

export const NotificationSection = (props: NotificationSectionProps) => {
  const { classes } = useStyles();

  const {
    content,
    count,
    emptyMessage,
    header,
    loading,
    showMoreTarget,
    showMoreText,
  } = props;

  const _count = count ?? 5;
  const _loading = Boolean(loading); // false if not provided

  const isActualNotificationContainer = header === 'Notifications';

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isActualNotificationContainer && content.length === 0 ? null : (
        <>
          <Hidden smDown>
            <StyledRootContainer
              className={classNames({
                [classes.notificationSpacing]: isActualNotificationContainer,
              })}
            >
              <Box sx={{ width: '100%' }}>
                <StyledHeader>
                  <Typography variant="h3">{header}</Typography>
                  {showMoreTarget && (
                    <strong>
                      <Link style={{ padding: 0 }} to={showMoreTarget}>
                        {showMoreText ?? 'View history'}
                      </Link>
                    </strong>
                  )}
                </StyledHeader>
                <ContentBody
                  content={content}
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
                content.length > 0 ? content.length : undefined
              }
              defaultExpanded={true}
              heading={header}
            >
              <ContentBody
                content={content}
                count={_count}
                emptyMessage={emptyMessage}
                header={header}
                loading={_loading}
              />
            </Accordion>
          </Hidden>
        </>
      )}
    </>
  );
};

// =============================================================================
// Body
// =============================================================================
interface BodyProps {
  content: NotificationItem[];
  count: number;
  emptyMessage?: string;
  header: string;
  loading: boolean;
}

const ContentBody = React.memo((props: BodyProps) => {
  const { classes } = useStyles();

  const { content, count, emptyMessage, header, loading } = props;

  const [showAll, setShowAll] = React.useState(false);

  if (loading) {
    return (
      <StyledLoadingContainer>
        <CircleProgress mini />
      </StyledLoadingContainer>
    );
  }

  const _content = showAll ? content : content.slice(0, count);

  return _content.length > 0 ? (
    // eslint-disable-next-line
    <>
      {_content.map((thisItem) => (
        <StyledNotificationItem
          key={`notification-row-${thisItem.id}`}
          {...props}
        >
          {thisItem.body}
        </StyledNotificationItem>
      ))}
      {content.length > count ? (
        <StyledLToggleContainer display="flex" justifyContent="flex-end">
          <StyledLinkButton
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              textDecoration: 'none !important',
            }}
            aria-label={`Display all ${content.length} items`}
            data-test-id="showMoreButton"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Collapse' : `${content.length - count} more`}
            <StyledCaret
              className={classNames({
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

const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
}));

const StyledHeader = styled('div', {
  label: 'StyledHeader',
})(({ theme }) => ({
  alignItems: 'center',
  borderBottom: `solid 1px ${theme.borderColors.borderTable}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: `0 20px ${theme.spacing()}`,
}));

const StyledLoadingContainer = styled('div', {
  label: 'StyledLoadingContainer',
})(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

const StyledLToggleContainer = styled(Box, {
  label: 'StyledLToggleButton',
})(({ theme }) => ({
  padding: `0 16px ${theme.spacing()}`,
}));

const StyledNotificationItem = styled(Box, {
  label: 'StyledNotificationItem',
  shouldForwardProp: (prop) => prop !== 'content',
})<NotificationSectionProps>(({ theme, ...props }) => ({
  '& p': {
    color: theme.textColors.headlineStatic,
    lineHeight: '1.25rem',
  },
  display: 'flex',
  fontSize: '0.875rem',
  justifyContent: 'space-between',
  padding: props.header === 'Notifications' ? `${theme.spacing(1.5)} 20px` : 0,
  width: '100%',
}));

const StyledCaret = styled(KeyboardArrowDown)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(),
}));

const StyledEmptyMessage = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  marginTop: theme.spacing(),
  padding: `0 20px`,
}));
