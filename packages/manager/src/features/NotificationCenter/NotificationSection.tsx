import * as React from 'react';
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
}

export type CombinedProps = Props;

export const NotificationSection: React.FC<Props> = props => {
  const { content, header, showMore, showMoreText, showMoreTarget } = props;
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
        {content.length > 0 ? (
          content.map(thisItem => (
            <ContentRow
              key={`notification-row-${thisItem.id}`}
              item={thisItem}
            />
          ))
        ) : (
          <Typography className={classes.notificationItem}>
            You have no {header.toLocaleLowerCase()}.
          </Typography>
        )}
        {showMore && (
          <Typography className={classes.notificationItem}>
            {showMore}
          </Typography>
        )}
      </div>
    </div>
  );
};

const ContentRow: React.FC<{
  item: NotificationItem;
}> = React.memo(props => {
  const { item } = props;
  const classes = useStyles();
  return (
    <div className={classes.notificationItem}>
      <div className={item.timeStamp ? classes.body : undefined}>
        {item.body}
      </div>
      {item.timeStamp && (
        <Typography>
          {formatDate(item.timeStamp, { humanizeCutoff: 'week' })}
        </Typography>
      )}
    </div>
  );
});

export default React.memo(NotificationSection);
