import { Domain, DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Hidden } from 'src/components/Hidden';
import { styled } from '@mui/material/styles';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { DomainActionMenu, Handlers } from './DomainActionMenu';
import { getDomainDisplayType } from './domainUtils';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';

type CombinedProps = { domain: Domain } & Handlers;

export const DomainTableRow = React.memo((props: CombinedProps) => {
  const { domain, onDisableOrEnable, onClone, onRemove, onEdit } = props;

  return (
    <TableRow
      key={domain.id}
      data-qa-domain-cell={domain.domain}
      ariaLabel={`Domain ${domain.domain}`}
    >
      <TableCell data-qa-domain-label>
        <StyledDiv>
          {domain.type !== 'slave' ? (
            <Link to={`/domains/${domain.id}`} tabIndex={0}>
              {domain.domain}
            </Link>
          ) : (
            <StyledLinkButton onClick={() => props.onEdit(domain)}>
              {domain.domain}
            </StyledLinkButton>
          )}
        </StyledDiv>
      </TableCell>
      <TableCell statusCell data-qa-domain-status>
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
          onDisableOrEnable={onDisableOrEnable}
          onRemove={onRemove}
          onClone={onClone}
          onEdit={onEdit}
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
