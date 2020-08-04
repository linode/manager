import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import { formatDate } from 'src/utilities/formatDate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(),
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  header: {
    borderBottom: `solid 1px ${theme.palette.divider}`,
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
  body: {
    width: '70%'
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
  showMore?: JSX.Element;
  loading?: boolean;
  emptyMessage?: string;
}

export type CombinedProps = Props;

export const NotificationSection: React.FC<Props> = props => {
  const {
    content,
    header,
    emptyMessage,
    loading,
    showMoreText,
    showMoreTarget
  } = props;
  const _loading = Boolean(loading); // false if not provided
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.header}>
          <Typography variant="h3">{header}</Typography>
          {showMoreTarget && (
            <Typography variant="body1">
              <strong>
                <Link to={showMoreTarget}>
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
  );
};

interface BodyProps {
  header: string;
  loading: boolean;
  content: NotificationItem[];
  emptyMessage?: string;
}

const ContentBody: React.FC<BodyProps> = React.memo(props => {
  const { content, emptyMessage, header, loading } = props;
  const classes = useStyles();
  if (loading) {
    return (
      <div className={classes.loading}>
        <CircleProgress mini />
      </div>
    );
  }
  return content.length > 0 ? (
    // eslint-disable-next-line
    <>
      {content.map(thisItem => (
        <ContentRow key={`notification-row-${thisItem.id}`} item={thisItem} />
      ))}
    </>
  ) : (
    <Typography className={classes.notificationItem}>
      {emptyMessage
        ? emptyMessage
        : `You have no ${header.toLocaleLowerCase()}.`}
    </Typography>
  );
});

const ContentRow: React.FC<{
  item: NotificationItem;
}> = React.memo(props => {
  const { item } = props;
  const classes = useStyles();
  return (
    <div className={classes.notificationItem}>
      <div className={classes.body}>{item.body}</div>
      {item.timeStamp && (
        <Typography>
          {formatDate(item.timeStamp, { humanizeCutoff: 'week' })}
        </Typography>
      )}
    </div>
  );
});

export default React.memo(NotificationSection);
