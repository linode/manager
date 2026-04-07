import { Chip, Hidden, Stack, styled } from '@linode/ui';
import { splitAt } from '@linode/utilities';
import { TableCell, TableRow } from 'akamai-cds-react-components/Table';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { ShowMore } from 'src/components/ShowMore/ShowMore';

import { ReservedIpsActionMenu } from './ReservedIpsActionMenu';

import type { ReservedIpsActionHandlers } from './ReservedIpsActionMenu';
import type { IPAddress } from '@linode/api-v4';

interface Props {
  handlers: ReservedIpsActionHandlers;
  ip: IPAddress;
  regionLabel: string;
}

/**
 * Derives the Cloud Manager route from the assigned entity.
 * API URLs (e.g. `/v4/linode/instances/123`) are not valid app routes.
 */
const getEntityRoute = (
  entity: IPAddress['assigned_entity']
): null | string => {
  if (!entity) {
    return null;
  }

  switch (entity.type) {
    case 'linode':
      return `/linodes/${entity.id}`;
    case 'nodebalancer':
      return `/nodebalancers/${entity.id}`;
    default:
      return null;
  }
};

export const ReservedIpsLandingRow = ({ handlers, ip, regionLabel }: Props) => {
  const { address, assigned_entity, tags } = ip;
  const entityRoute = getEntityRoute(assigned_entity);

  return (
    <TableRow hoverable zebra>
      <TableCell>{address}</TableCell>
      <TableCell>
        {assigned_entity && entityRoute ? (
          <Link
            accessibleAriaLabel={`Navigate to ${assigned_entity.type} ${assigned_entity.label}`}
            to={entityRoute}
          >
            {assigned_entity.label}
          </Link>
        ) : (
          'Unassigned'
        )}
      </TableCell>
      <Hidden smDown>
        <TableCell>{regionLabel}</TableCell>
        <Hidden mdDown>
          <TableCell>
            {tags?.length > 0 ? <TagsList tags={tags} /> : ''}
          </TableCell>
        </Hidden>
      </Hidden>
      <StyledActionMenuCell>
        <ReservedIpsActionMenu handlers={handlers} ip={ip} />
      </StyledActionMenuCell>
    </TableRow>
  );
};

/**
 * Displays up to 3 non-clickable tag chips, with a "+N" ShowMore popover
 * for any overflow tags.
 */
const MAX_VISIBLE_TAGS = 2;

const TagsList = ({ tags }: { tags: string[] }) => {
  const [visible, overflow] = splitAt(MAX_VISIBLE_TAGS, tags);

  return (
    <>
      {visible.map((tag) => (
        <StyledTagChip key={tag} label={tag} />
      ))}
      {overflow.length > 0 && (
        <ShowMore
          ariaItemType="tags"
          items={overflow}
          render={(items) => (
            <Stack spacing={0.5}>
              {items.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </Stack>
          )}
        />
      )}
    </>
  );
};

const StyledTagChip = styled(Chip, {
  label: 'StyledTagChip',
})(({ theme }) => ({
  '& .MuiChip-label': {
    color: theme.tokens.component.Badge.Informative.Subtle.Text,
    font: theme.font.bold,
    fontSize: theme.tokens.font.FontSize.Xxxs,
  },
}));

const StyledActionMenuCell = styled(TableCell, {
  label: 'StyledActionMenuCell',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end',
  maxWidth: 40,
  '& button': {
    backgroundColor: 'transparent',
    color: theme.tokens.alias.Content.Icon.Primary.Default,
    padding: 0,
  },
  '& button:hover': {
    backgroundColor: 'transparent',
    color: theme.tokens.alias.Content.Icon.Primary.Hover,
  },
}));
