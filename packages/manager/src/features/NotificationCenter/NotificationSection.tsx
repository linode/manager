import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { formatDate } from 'src/utilities/formatDate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
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
  icon: JSX.Element;
  content: NotificationItem[];
  showMore?: JSX.Element;
}

export type CombinedProps = Props;

export const NotificationSection: React.FC<Props> = props => {
  const { content, header, icon, showMore } = props;
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <span className={classes.icon}>{icon}</span>
      <div className={classes.content}>
        <Typography variant="h2">{header}</Typography>

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
        <Typography className={classes.notificationItem}>{showMore}</Typography>
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
