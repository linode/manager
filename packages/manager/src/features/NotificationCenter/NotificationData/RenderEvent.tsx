import { Event } from '@linode/api-v4/lib/account/types';
import classNames from 'classnames';
import * as React from 'react';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import GravatarIcon from 'src/features/Profile/DisplaySettings/GravatarIcon';
import { parseAPIDate } from 'src/utilities/date';
import useEventInfo from './useEventInfo';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: '100%',
  },
  icon: {
    height: 40,
    minWidth: 40,
    marginRight: 20,
  },
  event: {
    color: theme.textColors.tableHeader,
    '&:hover': {
      backgroundColor: theme.bg.app,
      cursor: 'pointer',
      marginLeft: -20,
      marginRight: -20,
      paddingLeft: 20,
      paddingRight: 20,
      width: 'calc(100% + 40px)',
      '& a': {
        textDecoration: 'none',
      },
    },
  },
  eventMessage: {
    marginTop: 2,
  },
  unseenEvent: {
    color: theme.textColors.headlineStatic,
    textDecoration: 'none',
  },
}));

interface Props {
  event: Event;
  onClose: () => void;
}

export const RenderEvent: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { event, onClose } = props;
  const { message, linkTarget } = useEventInfo(event);

  if (message === null) {
    return null;
  }

  const eventMessage = (
    <Typography
      className={classNames({
        [classes.unseenEvent]: !event.seen,
      })}
    >
      {message}
    </Typography>
  );

  return (
    <>
      <Box
        className={classNames({
          [classes.root]: true,
          [classes.event]: !!linkTarget,
        })}
        display="flex"
        data-test-id={event.action}
      >
        <GravatarIcon username={event.username} className={classes.icon} />
        <div className={classes.eventMessage}>
          {linkTarget ? (
            <Link to={linkTarget} onClick={onClose}>
              {eventMessage}
            </Link>
          ) : (
            eventMessage
          )}
          <Typography
            className={classNames({ [classes.unseenEvent]: !event.seen })}
          >
            {parseAPIDate(event.created).toRelative()}
          </Typography>
        </div>
      </Box>
      <Divider />
    </>
  );
};

export default React.memo(RenderEvent);
