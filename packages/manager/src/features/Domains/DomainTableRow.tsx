import { Domain, DomainStatus } from '@linode/api-v4/lib/domains';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { DomainActionMenu, Handlers } from './DomainActionMenu';
import { getDomainDisplayType } from './domainUtils';

interface DomainTableRowProps extends Handlers {
  domain: Domain;
}

export const DomainTableRow = React.memo((props: DomainTableRowProps) => {
  const { domain, onClone, onDisableOrEnable, onEdit, onRemove } = props;

  return (
    <TableRow
      ariaLabel={`Domain ${domain.domain}`}
      data-qa-domain-cell={domain.domain}
      key={domain.id}
    >
      <TableCell data-qa-domain-label>
        <StyledDiv>
          {domain.type !== 'slave' ? (
            <Link tabIndex={0} to={`/domains/${domain.id}`}>
              {domain.domain}
            </Link>
          ) : (
            <StyledLinkButton onClick={() => props.onEdit(domain)}>
              {domain.domain}
            </StyledLinkButton>
          )}
        </StyledDiv>
      </TableCell>
      <TableCell data-qa-domain-status statusCell>
        <StatusIcon status={domainStatusToIconStatus(domain.status)} />
        {humanizeDomainStatus(domain.status)}
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-domain-type>
          {getDomainDisplayType(domain.type)}
        </TableCell>
        <TableCell data-qa-domain-lastmodified>
          <DateTimeDisplay value={domain.updated} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <DomainActionMenu
          domain={domain}
          onClone={onClone}
          onDisableOrEnable={onDisableOrEnable}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      </TableCell>
    </TableRow>
  );
});

const humanizeDomainStatus = (status: DomainStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'disabled':
      return 'Disabled';
    case 'edit_mode':
      return 'Edit Mode';
    case 'has_errors':
      return 'Error';
    default:
      return 'Unknown';
  }
};

const domainStatusToIconStatus = (status: DomainStatus) => {
  switch (status) {
    case 'active':
      return 'active';
    case 'disabled':
      return 'inactive';
    case 'edit_mode':
      return 'inactive';
    case 'has_errors':
      return 'error';
    default:
      return 'inactive';
  }
};

const StyledDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
  flexFlow: 'row nowrap',
  whiteSpace: 'nowrap',
});
