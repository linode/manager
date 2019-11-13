import * as moment from 'moment';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  hivelyContainer: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    margin: `${theme.spacing(3)}px ${theme.spacing(1)}px 0`,
    paddingTop: theme.spacing(1),
    borderTop: `1px solid ${theme.color.grey2}`
  },
  hivelyLink: {
    textDecoration: 'none',
    color: theme.color.black,
    marginRight: theme.spacing(2)
  },
  hivelyImage: {
    width: '25px',
    margin: 3
  },
  hivelyLinkIcon: {
    display: 'inline-block',
    marginRight: theme.spacing(1)
  }
}));

interface Props {
  linodeUsername: string;
  ticketId: string;
  replyId: string;
}

export const shouldRenderHively = (
  fromLinode: boolean,
  updated: string,
  username?: string
) => {
  /* Render Hively only for replies marked as from_linode,
   * and are on tickets less than 7 days old,
   * and when the user is not "Linode"
   * Defaults to showing Hively if there are any errors parsing dates
   * or the date is invalid.
   */
  try {
    if (username === 'Linode') {
      return false;
    }
    const lastUpdated = moment(updated, 'YYYY-MM-DD HH:mm:ss');
    if (!lastUpdated.isValid()) {
      return true;
    }
    const diff = moment.duration(moment().diff(lastUpdated));
    return fromLinode && diff <= moment.duration(7, 'days');
  } catch {
    return true;
  }
};

export const Hively: React.FC<Props> = props => {
  const classes = useStyles();
  const { linodeUsername, ticketId, replyId } = props;
  const href = `https://secure.teamhively.com/ratings/add/account/587/source/hs/ext/${linodeUsername}/ticket/${ticketId}-${replyId}/rating/`;

  return (
    <div className={classes.hivelyContainer}>
      <Divider />
      <Typography component="span">
        <a
          className={classes.hivelyLink}
          href={href + '3'}
          target="_blank"
          rel="noopener noreferrer"
        >
          How did I do?
        </a>
      </Typography>
      <span>
        <a
          href={href + '3'}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.hivelyLinkIcon}
        >
          <img
            className={classes.hivelyImage}
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/541/px_25/icon_positive.png'
            }
            alt="Face symbol outlined in green with a happy expression."
          />
        </a>
        <a
          href={href + '2'}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.hivelyLinkIcon}
        >
          <img
            className={classes.hivelyImage}
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/542/px_25/icon_indifferent.png'
            }
            alt="Face symbol outlined in yellow with an indifferent expression."
          />
        </a>
        <a
          href={href + '1'}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.hivelyLinkIcon}
        >
          <img
            className={classes.hivelyImage}
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/543/px_25/icon_negative.png'
            }
            alt="Face symbol outlined in red with an unhappy expression."
          />
        </a>
      </span>
    </div>
  );
};
