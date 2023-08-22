import { ServiceTarget } from '@linode/api-v4';
import { styled } from '@mui/material/styles';
import React from 'react';

import { Hidden } from 'src/components/Hidden';
// import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableRow } from 'src/components/TableRow/TableRow';

import { ServiceTargetActionMenu } from './ServiceTargetActionMenu';

interface Props extends ServiceTarget {
  onDelete: () => void;
}

export const ServiceTargetRow = React.memo((props: Props) => {
  const { id, label, load_balancing_policy, onDelete } = props;

  return (
    <TableRow
      ariaLabel={`Service Target ${label}`}
      data-qa-service-target-cluster-id={id}
      key={`service-target-row-${id}`}
    >
      <TableCell>
        {/* TODO: AGLB - Link to service target details page */}
        {label}
      </TableCell>
      {/* TODO: AGLB - TBD for Beta, revisit if required for Beta */}
      {/* <TableCell statusCell>
        <StatusIcon status={'other'} />
      </TableCell> */}
      {/* TODO: AGLB - Marked Nice to Have for Beta */}
      <Hidden smDown>
        <TableCell>
          <StyledPolicySpan>
            {load_balancing_policy.toLowerCase().replace(/_/g, ' ')}
          </StyledPolicySpan>
        </TableCell>
      </Hidden>
      {/* TODO: AGLB - Needs API clarification: optional health_check fields in payload, unsure how to determine 'Yes/No'? */}
      <Hidden smDown>
        <TableCell>TODO: [Yes/No] </TableCell>
      </Hidden>
      <TableCell actionCell>
        {/* TODO: AGLB - Needs UX clarification: available actions? */}
        <ServiceTargetActionMenu label={label} toggleDialog={onDelete} />
      </TableCell>
    </TableRow>
  );
});

export const StyledPolicySpan = styled('span', {
  label: 'StyledPolicySpan',
})(() => ({
  textTransform: 'capitalize',
}));
