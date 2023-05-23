import * as React from 'react';
import Box from 'src/components/core/Box';
import classNames from 'classnames';
import ExtendedAccordion from 'src/components/ExtendedAccordion';
import Hidden from 'src/components/core/Hidden';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Typography from 'src/components/core/Typography';
import { CircleProgress } from 'src/components/CircleProgress';
import { Link } from 'react-router-dom';
import { LinkStyledButton } from 'src/components/Button/LinkStyledButton';
import { makeStyles } from 'tss-react/mui';
import { menuLinkStyle } from 'src/features/TopMenu/UserMenu/UserMenu';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  inverted: {
    transform: 'rotate(180deg)',
  },
  notificationSpacing: {
    marginBottom: theme.spacing(2),
  },
  menuItemLink: {
    ...menuLinkStyle(theme.textColors.linkActiveLight),
  },
  showMore: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: theme.spacing(),
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'none',
    },
  },
}));

export interface NotificationItem {
  id: string;
  body: string | JSX.Element;
  countInTotal: boolean;
}

interface NotificationSectionProps {
  header: string;
  count?: number;
  showMoreText?: string;
  showMoreTarget?: string;
  content: NotificationItem[];
  loading?: boolean;
  emptyMessage?: string;
}

export const NotificationSection = (props: NotificationSectionProps) => {
  const { classes } = useStyles();

  const {
    content,
    count,
    header,
    emptyMessage,
    loading,
    showMoreText,
    showMoreTarget,
  } = props;

  const _count = count ?? 5;
  const _loading = Boolean(loading); // false if not provided

  const innerContent = () => {
    return (
      <ContentBody
        loading={_loading}
        count={_count}
        content={content}
        header={header}
        emptyMessage={emptyMessage}
      />
    );
  };

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
                      <Link
                        to={showMoreTarget}
                        className={classes.menuItemLink}
                        style={{ padding: 0 }}
                      >
                        {showMoreText ?? 'View history'}
                      </Link>
                    </strong>
                  )}
                </StyledHeader>
                <ContentBody
                  loading={_loading}
                  count={_count}
                  content={content}
                  header={header}
                  emptyMessage={emptyMessage}
                />
              </Box>
            </StyledRootContainer>
          </Hidden>

          <Hidden smUp>
            <ExtendedAccordion
              heading={header}
              headingNumberCount={
                content.length > 0 ? content.length : undefined
              }
              renderMainContent={innerContent}
              defaultExpanded={true}
            />
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
  header: string;
  content: NotificationItem[];
  count: number;
  emptyMessage?: string;
  loading: boolean;
}

const ContentBody: React.FC<BodyProps> = React.memo((props) => {
  const { classes } = useStyles();

  const { header, content, count, emptyMessage, loading } = props;

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
        <StyledNotificationItem key={`notification-row-${thisItem.id}`}>
          {thisItem.body}
        </StyledNotificationItem>
      ))}
      {content.length > count ? (
        <Box display="flex" justifyContent="flex-end">
          <LinkStyledButton
            onClick={() => setShowAll(!showAll)}
            aria-label={`Display all ${content.length} items`}
            data-test-id="showMoreButton"
          >
            {showAll ? 'Collapse' : `${content.length - count} more`}
            <StyledCaret
              className={classNames({
                [classes.inverted]: showAll,
              })}
            />
          </LinkStyledButton>
        </Box>
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
})(({ theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const StyledHeader = styled('div', {
  label: 'StyledHeader',
})(({ theme }) => ({
  alignItems: 'center',
  borderBottom: `solid 1px ${theme.borderColors.borderTypography}`,
  display: 'flex',
  justifyContent: 'space-between',
  paddingBottom: theme.spacing(),
}));

const StyledLoadingContainer = styled('div', {
  label: 'StyledLoadingContainer',
})(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

const StyledNotificationItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  fontSize: '0.875rem',
  justifyContent: 'space-between',
  marginTop: theme.spacing(),
  width: '100%',
  '& p': {
    color: theme.textColors.headlineStatic,
    lineHeight: '1.25rem',
  },
}));

const StyledCaret = styled(KeyboardArrowDown)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(),
}));

const StyledEmptyMessage = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(),
  marginBottom: theme.spacing(2.5),
}));
