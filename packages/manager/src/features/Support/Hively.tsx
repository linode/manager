import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';
import { parseAPIDate } from 'src/utilities/date';

import { OFFICIAL_USERNAMES } from './ticketUtils';

const useStyles = makeStyles((theme: Theme) => ({
  hivelyContainer: {
    alignItems: 'center',
    borderTop: `1px solid ${theme.color.grey2}`,
    display: 'flex',
    flexFlow: 'row nowrap',
    margin: `${theme.spacing(3)} ${theme.spacing(1)} 0`,
    paddingTop: theme.spacing(1),
  },
  hivelyImage: {
    margin: 3,
    width: '25px',
  },
  hivelyLink: {
    color: theme.color.black,
    marginRight: theme.spacing(2),
    textDecoration: 'none',
  },
  hivelyLinkIcon: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  linodeUsername: string;
  replyId: string;
  ticketId: string;
}

export const shouldRenderHively = (
  fromLinode: boolean,
  updated: string,
  username?: string
) => {
  /* Render Hively only for replies marked as from_linode,
   * and are on tickets less than 7 days old,
   * and when the user is not "Linode" or "Linode Trust & Safety"
   * Defaults to showing Hively if there are any errors parsing dates
   * or the date is invalid.
   */
  try {
    if (username && OFFICIAL_USERNAMES.includes(username)) {
      return false;
    }
    const lastUpdated = parseAPIDate(updated);
    if (!lastUpdated.isValid) {
      return true;
    }
    return fromLinode && lastUpdated >= DateTime.local().minus({ days: 7 });
  } catch {
    return true;
  }
};

export const Hively: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { linodeUsername, replyId, ticketId } = props;
  const href = `https://secure.teamhively.com/ratings/add/account/587/source/hs/ext/${linodeUsername}/ticket/${ticketId}-${replyId}/rating/`;

  return (
    <div className={classes.hivelyContainer}>
      <Divider />
      <Typography component="span">
        <a
          aria-describedby="external-site"
          className={classes.hivelyLink}
          href={href + '3'}
          rel="noopener noreferrer"
          target="_blank"
        >
          How did I do?
        </a>
      </Typography>
      <span>
        <a
          aria-describedby="external-site"
          className={classes.hivelyLinkIcon}
          href={href + '3'}
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/541/px_25/icon_positive.png'
            }
            alt="Face symbol outlined in green with a happy expression."
            className={classes.hivelyImage}
          />
        </a>
        <a
          aria-describedby="external-site"
          className={classes.hivelyLinkIcon}
          href={href + '2'}
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/542/px_25/icon_indifferent.png'
            }
            alt="Face symbol outlined in yellow with an indifferent expression."
            className={classes.hivelyImage}
          />
        </a>
        <a
          aria-describedby="external-site"
          className={classes.hivelyLinkIcon}
          href={href + '1'}
          rel="noopener noreferrer"
          target="_blank"
        >
          <img
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/543/px_25/icon_negative.png'
            }
            alt="Face symbol outlined in red with an unhappy expression."
            className={classes.hivelyImage}
          />
        </a>
      </span>
    </div>
  );
};
