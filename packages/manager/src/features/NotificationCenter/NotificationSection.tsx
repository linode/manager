import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { MenuLink } from '@reach/menu-button';
import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExtendedAccordion from 'src/components/ExtendedAccordion';
import { menuLinkStyle } from 'src/features/TopMenu/UserMenu/UserMenu';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  notificationSpacing: {
    marginBottom: theme.spacing(2),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `solid 1px ${theme.borderColors.borderTypography}`,
    marginBottom: 6,
  },
  content: {
    width: '100%',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
  },
  notificationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    width: '100%',
    '& p': {
      color: theme.textColors.headlineStatic,
      lineHeight: '1.25rem',
    },
  },
  showMore: {
    ...theme.applyLinkStyles,
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: theme.spacing(),
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  caret: {
    color: theme.palette.primary.main,
    marginRight: -4,
  },
  inverted: {
    transform: 'rotate(180deg)',
  },
  emptyMessage: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2.5),
  },
  menuItemLink: {
    ...menuLinkStyle(theme.textColors.linkActiveLight),
  },
}));

export interface NotificationItem {
  id: string;
  body: string | JSX.Element;
  countInTotal: boolean;
}

interface Props {
  header: string;
  count?: number;
  showMoreText?: string;
  showMoreTarget?: string;
  content: NotificationItem[];
  loading?: boolean;
  emptyMessage?: string;
}

export type CombinedProps = Props;

export const NotificationSection: React.FC<Props> = (props) => {
  const classes = useStyles();

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
          <Hidden xsDown>
            <div
              className={classNames({
                [classes.root]: true,
                [classes.notificationSpacing]: isActualNotificationContainer,
              })}
            >
              <div className={classes.content}>
                <div className={classes.header}>
                  <Typography variant="h3">{header}</Typography>
                  {showMoreTarget && (
                    <strong>
                      <MenuLink
                        as={Link}
                        to={showMoreTarget}
                        className={classes.menuItemLink}
                        style={{ padding: 0 }}
                      >
                        {showMoreText ?? 'View history'}
                      </MenuLink>
                    </strong>
                  )}
                </div>
                <ContentBody
                  loading={_loading}
                  count={_count}
                  content={content}
                  header={header}
                  emptyMessage={emptyMessage}
                />
              </div>
            </div>
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
  const classes = useStyles();

  const { header, content, count, emptyMessage, loading } = props;

  const [showAll, setShowAll] = React.useState(false);

  if (loading) {
    return (
      <div className={classes.loading}>
        <CircleProgress mini />
      </div>
    );
  }

  const _content = showAll ? content : content.slice(0, count);

  return _content.length > 0 ? (
    // eslint-disable-next-line
    <>
      {_content.map((thisItem) => (
        <div
          className={classes.notificationItem}
          key={`notification-row-${thisItem.id}`}
        >
          {thisItem.body}
        </div>
      ))}
      {content.length > count ? (
        <Box display="flex" justifyContent="flex-end">
          <button
            className={classes.showMore}
            onClick={() => setShowAll(!showAll)}
            aria-label={`Display all ${content.length} items`}
            data-test-id="showMoreButton"
          >
            {showAll ? 'Collapse' : `${content.length - count} more`}
            <KeyboardArrowDown
              className={classNames({
                [classes.caret]: true,
                [classes.inverted]: showAll,
              })}
            />
          </button>
        </Box>
      ) : null}
    </>
  ) : header === 'Events' ? (
    <Typography className={classes.emptyMessage} variant="body1">
      {emptyMessage
        ? emptyMessage
        : `You have no ${header.toLocaleLowerCase()}.`}
    </Typography>
  ) : null;
});

export default React.memo(NotificationSection);
