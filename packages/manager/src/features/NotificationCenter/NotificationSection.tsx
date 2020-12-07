import * as classNames from 'classnames';
import * as React from 'react';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import { formatDate } from 'src/utilities/formatDate';
import Hidden from 'src/components/core/Hidden';
import ExtendedAccordion from 'src/components/ExtendedAccordion';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  header: {
    borderBottom: `solid 1px ${theme.cmrBorderColors.borderTypography}`,
    display: 'flex',
    justifyContent: 'space-between'
  },
  content: {
    width: '100%'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center'
  },
  icon: {
    marginRight: theme.spacing(),
    '& svg': {
      color: theme.color.grey1,
      stroke: theme.color.grey1
    }
  },
  notificationItem: {
    paddingTop: '10px',
    width: '100%',
    lineHeight: 1.43,
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  showMore: {
    ...theme.applyLinkStyles,
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: theme.spacing(),
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'none'
    }
  },
  caret: {
    color: theme.palette.primary.main
  },
  inverted: {
    transform: 'rotate(180deg)'
  }
}));

export interface NotificationItem {
  id: string;
  body: string | JSX.Element;
  timeStamp?: string;
}

interface Props {
  header: string;
  showMoreText?: string;
  showMoreTarget?: string;
  content: NotificationItem[];
  loading?: boolean;
  emptyMessage?: string;
  onClose?: () => void;
}

export type CombinedProps = Props;

export const NotificationSection: React.FC<Props> = props => {
  const {
    content,
    header,
    emptyMessage,
    loading,
    showMoreText,
    showMoreTarget,
    onClose
  } = props;

  const _loading = Boolean(loading); // false if not provided
  const classes = useStyles();

  const innerContent = () => {
    return (
      <ContentBody
        loading={_loading}
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
  emptyMessage?: string;
}

const ContentBody: React.FC<BodyProps> = React.memo(props => {
  const { content, emptyMessage, header, loading } = props;
  const classes = useStyles();
  const [showAll, setShowAll] = React.useState(false);

  if (loading) {
    return (
      <div className={classes.loading}>
        <CircleProgress mini />
      </div>
    );
  }

  const _content = showAll ? content : content.slice(0, 5);

  return _content.length > 0 ? (
    // eslint-disable-next-line
    <>
      {_content.map(thisItem => (
        <ContentRow key={`notification-row-${thisItem.id}`} item={thisItem} />
      ))}
      {content.length > 5 ? (
        <button
          className={classes.showMore}
          onClick={() => setShowAll(!showAll)}
          aria-label={`Display all ${content.length} items`}
        >
          {showAll ? 'Close' : `${content.length - 5} more`}
          <KeyboardArrowDown
            className={classNames({
              [classes.caret]: true,
              [classes.inverted]: showAll
            })}
          />
        </button>
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

// =============================================================================
// Row
// =============================================================================
export const ContentRow: React.FC<{
  item: NotificationItem;
}> = React.memo(props => {
  const { item } = props;
  const classes = useStyles();
  return (
    <div className={classes.notificationItem}>
      <div style={{ width: item.timeStamp ? '70%' : '100%' }}>{item.body}</div>
      {item.timeStamp && (
        <Typography>
          {formatDate(item.timeStamp, { humanizeCutoff: 'week' })}
        </Typography>
      )}
    </div>
  );
});

export default React.memo(NotificationSection);
