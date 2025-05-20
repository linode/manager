import { Tooltip } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import {
  StyledDateTimeDisplay,
  StyledGrid,
  StyledLink,
} from './IssueDay.styles';

import type { ManagedIssue } from '@linode/api-v4';

export interface IssueDayProps {
  day: string;
  issues: ManagedIssue[];
}

interface DayDisplayProps {
  day: string;
  icon: JSX.Element;
  ticketUrl?: string;
}

const DayDisplay = (props: DayDisplayProps) => {
  const { day, icon, ticketUrl } = props;

  const ConditionalDateTimeDisplay = ticketUrl
    ? StyledDateTimeDisplay
    : DateTimeDisplay;

  return (
    <StyledGrid alignItems="center" container direction="row" spacing={2}>
      <Grid>{icon}</Grid>
      <Grid>
        <ConditionalDateTimeDisplay displayTime={false} value={day} />
      </Grid>
      {ticketUrl && (
        <Tooltip
          data-qa-open-ticket-tooltip
          enterTouchDelay={0}
          leaveTouchDelay={5000}
          placement={'top'}
          title={'See the ticket associated with this incident'}
        >
          <StyledLink to={ticketUrl}>
            <TicketIcon />
          </StyledLink>
        </Tooltip>
      )}
    </StyledGrid>
  );
};

const iconStyles = {
  height: 30,
  width: 30,
};

export const IssueDay = (props: IssueDayProps) => {
  const { day, issues } = props;

  const issueLinks = issues.map((thisIssue) => thisIssue.entity.id);

  if (issues.length === 0) {
    // No issues for today
    return <DayDisplay day={day} icon={<Good {...iconStyles} />} />;
  }

  return (
    <DayDisplay
      day={day}
      icon={<Bad {...iconStyles} />}
      // For now, not worrying about the possibility of multiple tickets opened in a single day
      ticketUrl={`/support/tickets/${issueLinks[0]}`}
    />
  );
};

export default IssueDay;
