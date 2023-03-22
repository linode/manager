import * as React from 'react';
import { APIError } from '@linode/api-v4/lib/types';
import Typography from 'src/components/core/Typography';
import SupportLink from 'src/components/SupportLink';
import { useTheme } from '@mui/material/styles';

interface Props {
  errors: APIError[];
}

export const SupportError = (props: Props) => {
  const theme = useTheme();
  const { errors } = props;
  const errorMsg = errors[0].reason.split(/(open a support ticket)/i);

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
        if (openTicket) {
          return (
            <SupportLink
              key={`${substring}-${idx}`}
              text={
                substring.match(/Open.*/)
                  ? 'Open a support ticket'
                  : 'open a support ticket'
              }
            />
          );
        } else {
          return substring;
        }
      })}
    </Typography>
  );
};
