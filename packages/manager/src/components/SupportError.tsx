import { APIError } from '@linode/api-v4/lib/types';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';

interface Props {
  errors: APIError[];
}

export const SupportError = (props: Props) => {
  const theme = useTheme();
  const { errors } = props;
  const errorMsg = errors[0].reason.split(
    /(open a support ticket|contact support)/i
  );

  return (
    <Typography
      sx={{
        fontFamily: theme.font.bold,
        fontSize: '1rem',
        lineHeight: '20px',
      }}
    >
      {errorMsg.map((substring: string, idx) => {
        const openTicket = substring.match(/open a support ticket/i);
        const contact = substring.match(/contact support/i);
        if (openTicket) {
          return (
            <SupportLink
              text={
                substring.match(/Open.*/)
                  ? 'Open a support ticket'
                  : 'open a support ticket'
              }
              key={`${substring}-${idx}`}
            />
          );
        } else if (contact) {
          return (
            <SupportLink
              text={
                substring.match(/Contact.*/)
                  ? 'Contact support'
                  : 'contact support'
              }
              key={`${substring}-${idx}`}
            />
          );
        } else {
          return substring;
        }
      })}
    </Typography>
  );
};
