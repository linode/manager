import React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import type {
  EntityType,
  TicketType,
  TicketTypeData,
} from './SupportTicketDialog';

export const SMTP_DIALOG_TITLE = 'Contact Support: SMTP Restriction Removal';
export const SMTP_HELPER_TEXT =
  'In an effort to fight spam, outbound connections are restricted on ports 25, 465, and 587. To have these restrictions removed, please provide us with the following information. A member of the Support team will review your request and follow up with you as soon as possible.';

export const TICKET_TYPE_MAP: Record<TicketType, TicketTypeData> = {
  general: {
    dialogTitle: 'Open a Support Ticket',
    helperText: (
      <>
        {`We love our customers, and we\u{2019}re here to help if you need us.
        Please keep in mind that not all topics are within the scope of our support.
        For overall system status, please see `}
        <Link to="https://status.linode.com">status.linode.com</Link>.
      </>
    ),
  },
  smtp: {
    dialogTitle: SMTP_DIALOG_TITLE,
    helperText: SMTP_HELPER_TEXT,
  },
};

export const ENTITY_MAP: Record<string, EntityType> = {
  Databases: 'database_id',
  Domains: 'domain_id',
  Firewalls: 'firewall_id',
  Kubernetes: 'lkecluster_id',
  Linodes: 'linode_id',
  NodeBalancers: 'nodebalancer_id',
  Volumes: 'volume_id',
};

export const ENTITY_ID_TO_NAME_MAP: Record<EntityType, string> = {
  database_id: 'Database Cluster',
  domain_id: 'Domain',
  firewall_id: 'Firewall',
  general: '',
  linode_id: 'Linode',
  lkecluster_id: 'Kubernetes Cluster',
  nodebalancer_id: 'NodeBalancer',
  none: '',
  volume_id: 'Volume',
};

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
