import { Typography } from '@mui/material';
import React from 'react';

export const TICKET_SEVERITY_TOOLTIP_TEXT = (
  <>
    <Typography paragraph>
      <Typography
        display="inline"
        sx={(theme) => ({ fontFamily: theme.font.bold })}
      >
        3-Low Impact:
      </Typography>{' '}
      Routine maintenance, configuration change requests, questions about your
      account or contract, help managing your services online, information
      requests, and general feedback.
    </Typography>
    <Typography paragraph>
      <Typography
        display="inline"
        sx={(theme) => ({ fontFamily: theme.font.bold })}
      >
        2-Moderate Impact:
      </Typography>{' '}
      Akamai system or application is partially or moderately impacted, or a
      single incidence of failure is reported. There is no workaround or the
      workaround is cumbersome to implement.
    </Typography>
    <Typography paragraph>
      <Typography
        display="inline"
        sx={(theme) => ({ fontFamily: theme.font.bold })}
      >
        1-Major Impact:
      </Typography>{' '}
      Akamai system or major application is down or seriously impacted and there
      is no reasonable workaround currently available.
    </Typography>
  </>
);
