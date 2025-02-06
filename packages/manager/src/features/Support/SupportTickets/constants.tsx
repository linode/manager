import { Typography } from '@linode/ui';
import {
  createAccountLimitSupportTicketSchema,
  createSMTPSupportTicketSchema,
  createSupportTicketSchema,
} from '@linode/validation';
import React from 'react';

import { Link } from 'src/components/Link';

import type {
  EntityType,
  TicketType,
  TicketTypeData,
} from './SupportTicketDialog';
import type { TicketSeverity } from '@linode/api-v4';
import type { AnyObjectSchema } from 'yup';

export interface CustomFields {
  companyName: string;
  customerName: string;
  publicInfo: string;
  useCase: string;
}

export const SMTP_DIALOG_TITLE = 'Contact Support: SMTP Restriction Removal';
export const SMTP_HELPER_TEXT =
  'In an effort to fight spam, outbound connections are restricted on ports 25, 465, and 587. To have these restrictions removed, please provide us with the following information. A member of the Support team will review your request and follow up with you as soon as possible.';

export const ACCOUNT_LIMIT_DIALOG_TITLE =
  'Contact Support: Account Limit Increase';
export const ACCOUNT_LIMIT_HELPER_TEXT =
  'To request access to more Linodes, LKE nodes, and/or larger plans, please provide us with the following information. Typically, we require a few months of positive billing history on an account before we will consider an account limit increase.';

export const TICKET_TYPE_MAP: Record<TicketType, TicketTypeData> = {
  accountLimit: {
    dialogTitle: ACCOUNT_LIMIT_DIALOG_TITLE,
    helperText: ACCOUNT_LIMIT_HELPER_TEXT,
    ticketTitle: 'Account Limit Increase',
  },
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

// Validation
export const SCHEMA_MAP: Record<string, AnyObjectSchema> = {
  accountLimit: createAccountLimitSupportTicketSchema,
  general: createSupportTicketSchema,
  smtp: createSMTPSupportTicketSchema,
};

export const ENTITY_MAP: Record<string, EntityType> = {
  Databases: 'database_id',
  Domains: 'domain_id',
  Firewalls: 'firewall_id',
  Kubernetes: 'lkecluster_id',
  Linodes: 'linode_id',
  NodeBalancers: 'nodebalancer_id',
  'Object Storage': 'bucket',
  VPCs: 'vpc_id',
  Volumes: 'volume_id',
};

export const ENTITY_ID_TO_NAME_MAP: Record<EntityType, string> = {
  bucket: 'Bucket',
  database_id: 'Database Cluster',
  domain_id: 'Domain',
  firewall_id: 'Firewall',
  general: '',
  linode_id: 'Linode',
  lkecluster_id: 'Kubernetes Cluster',
  nodebalancer_id: 'NodeBalancer',
  none: '',
  volume_id: 'Volume',
  vpc_id: 'VPC',
};

// General custom fields common to multiple custom ticket types.
export const CUSTOM_FIELD_NAME_TO_LABEL_MAP: Record<string, string> = {
  customerName: 'First and last name',
  // eslint-disable-next-line perfectionist/sort-objects
  companyName: 'Business or company name',
  publicInfo:
    "Links to public information - e.g. your business or application's website, Twitter profile, GitHub, etc.",
  useCase: 'A clear and detailed description of your use case',
};

export const SMTP_FIELD_NAME_TO_LABEL_MAP: Record<string, string> = {
  ...CUSTOM_FIELD_NAME_TO_LABEL_MAP,
  emailDomains: 'Domain(s) that will be sending emails',
  useCase:
    "A clear and detailed description of your email use case, including how you'll avoid sending unwanted emails",
};

export const ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP: Record<string, string> = {
  ...CUSTOM_FIELD_NAME_TO_LABEL_MAP,
  numberOfEntities: 'Total number of entities you need?',
  // eslint-disable-next-line perfectionist/sort-objects
  linodePlan: 'Which Linode plan do you need access to?',
  useCase:
    'A detailed description of your use case and why you need access to more/larger entities',
};

// Used for finding specific custom fields within form data, based on the ticket type.
export const TICKET_TYPE_TO_CUSTOM_FIELD_KEYS_MAP: Record<string, string[]> = {
  accountLimit: Object.keys(ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP),
  smtp: Object.keys(SMTP_FIELD_NAME_TO_LABEL_MAP),
};

export const SEVERITY_LABEL_MAP: Map<TicketSeverity, string> = new Map([
  [1, '1-Major Impact'],
  [2, '2-Moderate Impact'],
  [3, '3-Low Impact'],
]);

export const SEVERITY_OPTIONS: {
  label: string;
  value: TicketSeverity;
}[] = Array.from(SEVERITY_LABEL_MAP).map(([severity, label]) => ({
  label,
  value: severity,
}));

export const TICKET_SEVERITY_TOOLTIP_TEXT = (
  <>
    <Typography paragraph>
      <Typography display="inline" sx={(theme) => ({ font: theme.font.bold })}>
        3-Low Impact:
      </Typography>{' '}
      Routine maintenance, configuration change requests, questions about your
      account or contract, help managing your services online, information
      requests, and general feedback.
    </Typography>
    <Typography paragraph>
      <Typography display="inline" sx={(theme) => ({ font: theme.font.bold })}>
        2-Moderate Impact:
      </Typography>{' '}
      Akamai system or application is partially or moderately impacted, or a
      single incidence of failure is reported. There is no workaround or the
      workaround is cumbersome to implement.
    </Typography>
    <Typography paragraph>
      <Typography display="inline" sx={(theme) => ({ font: theme.font.bold })}>
        1-Major Impact:
      </Typography>{' '}
      Akamai system or major application is down or seriously impacted and there
      is no reasonable workaround currently available.
    </Typography>
  </>
);
