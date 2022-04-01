import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import classNames from 'classnames';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExtendedAccordion from 'src/components/ExtendedAccordion';
import { Link } from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `solid 1px ${theme.borderColors.borderTypography}`,
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
}));

export interface NotificationItem {
  id: string;
  body: string | JSX.Element;
  countInTotal: boolean;
}

interface Props {
  header: string;
  count?: number; // @todo do we even need the expansion behavior anymore?
  showMoreText?: string;
  showMoreTarget?: string;
  content: NotificationItem[];
  loading?: boolean;
  emptyMessage?: string;
  onClose?: () => void;
}

export type CombinedProps = Props;

export const NotificationSection: React.FC<Props> = (props) => {
  const {
    content,
    count,
    header,
    emptyMessage,
    loading,
    showMoreText,
    showMoreTarget,
    onClose,
  } = props;

  const _loading = Boolean(loading); // false if not provided
  const _count = count ?? 5;
  const classes = useStyles();

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

  return (
    <>
      <Hidden smDown>
        <div className={classes.root}>
          <div className={classes.content}>
            <div className={classes.header}>
              <Typography variant="h3">{header}</Typography>
              {showMoreTarget && (
                <Typography variant="body1">
                  <strong>
                    <Link
                      to={showMoreTarget}
                      onClick={() => {
                        if (onClose) {
                          onClose();
                        }
                      }}
                    >
                      {showMoreText ?? 'View history'}
                    </Link>
                  </strong>
                </Typography>
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

      <Hidden mdUp>
        <ExtendedAccordion
          heading={header}
          headingNumberCount={content.length > 0 ? content.length : undefined}
          renderMainContent={innerContent}
        />
      </Hidden>
    </>
  );
};

// =============================================================================
// Body
// =============================================================================
interface BodyProps {
  header: string;
  loading: boolean;
  content: NotificationItem[];
  count: number;
  emptyMessage?: string;
}

const ContentBody: React.FC<BodyProps> = React.memo((props) => {
  const classes = useStyles();

  const { content, count, emptyMessage, header, loading } = props;

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
            {showAll ? 'Close' : `${content.length - count} more`}
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
  ) : (
    <Typography className={classes.notificationItem}>
      {emptyMessage
        ? emptyMessage
        : `You have no ${header.toLocaleLowerCase()}.`}
    </Typography>
  );
});

export default React.memo(NotificationSection);
