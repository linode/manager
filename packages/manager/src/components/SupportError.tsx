import { APIError } from '@linode/api-v4/lib/types';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';
import { capitalize } from 'src/utilities/capitalize';

import { ErrorMatcher } from './RenderError';

interface Props {
  error: APIError;
}

const supportTextRegex = new RegExp(/(open a support ticket|contact Support)/i);

export const SupportError = (props: Props) => {
  const theme = useTheme();
  const { error } = props;
  const errorMsg = error.reason.split(supportTextRegex);

  return (
    <Typography
      sx={{
        fontFamily: theme.font.bold,
        fontSize: '1rem',
        lineHeight: '20px',
      }}
    >
      {errorMsg.map((substring: string, idx) => {
        const openTicket = substring.match(supportTextRegex);
        if (openTicket) {
          return (
            <SupportLink
              text={
                substring.match(/^[A-Z]/)
                  ? capitalize(openTicket[0])
                  : openTicket[0]
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

export const supportErrorMatcher: ErrorMatcher = {
  condition: (e) => !!e.reason.match(supportTextRegex),
  element: (e) => <SupportError error={e} />,
};
