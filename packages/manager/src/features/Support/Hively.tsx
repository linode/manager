import { Box, Divider, Stack, Typography } from '@linode/ui';
import { DateTime } from 'luxon';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { parseAPIDate } from 'src/utilities/date';

import { OFFICIAL_USERNAMES } from './ticketUtils';

interface Props {
  /** The username of the Linode user who created the ticket. */
  linodeUsername: string;
  /** The ID of the reply. */
  replyId: string;
  /** The ID of the ticket. */
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

export const Hively = (props: Props) => {
  const { linodeUsername, replyId, ticketId } = props;
  const href = `https://secure.teamhively.com/ratings/add/account/587/source/hs/ext/${linodeUsername}/ticket/${ticketId}-${replyId}/rating/`;

  return (
    <Box sx={{ padding: 1 }}>
      <Divider />
      <Stack alignItems="center" direction="row" pl={1} spacing={1.5}>
        <Typography
          sx={{
            padding: '2px 20px 2px 0',
          }}
        >
          <Link external to={href + '3'}>
            How did I do?
          </Link>
        </Typography>
        <Link
          accessibleAriaLabel="Happy feedback"
          external
          hideIcon
          to={href + '3'}
        >
          <img
            alt="Happy face emoji"
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/841/px_25/Happy_square_gradient_icon.png?1704911301'
            }
          />
        </Link>
        <Link
          accessibleAriaLabel="Mediocre feedback"
          external
          hideIcon
          to={href + '2'}
        >
          <img
            alt="Indifferent face emoji"
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/842/px_25/Neutral_square_gradient_icon.png?1704911301'
            }
          />
        </Link>
        <Link
          accessibleAriaLabel="Unhappy feedback"
          external
          hideIcon
          to={href + '1'}
        >
          <img
            alt="Sad Face emoji"
            src={
              'https://secure.teamhively.com/system/smileys/icons/000/000/843/px_25/Unhappy_square_gradient_icon.png?1704911301'
            }
          />
        </Link>
      </Stack>
    </Box>
  );
};
