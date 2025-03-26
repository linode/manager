import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { IPRange } from '@linode/api-v4/lib/networking';

interface Props {
  onClose: () => void;
  open: boolean;
  range?: IPRange;
}

export const ViewRangeDrawer = (props: Props) => {
  const { range } = props;
  const region = (range && range.region) || '';

  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === region);

  return (
    <Drawer
      onClose={props.onClose}
      open={props.open}
      title={`Details for IP Range`}
    >
      {props.range && (
        <React.Fragment>
          <StyledDiv>
            <Typography variant="h3">IP Range</Typography>
            <Typography variant="body1">
              {props.range.range} / {props.range.prefix} routed to{' '}
              {props.range.route_target}
            </Typography>
          </StyledDiv>

          <StyledDiv style={{ border: 0, paddingBottom: 0 }}>
            <Typography variant="h3">Region</Typography>
            <Typography variant="body1">
              {actualRegion?.label ?? region}
            </Typography>
          </StyledDiv>

          <ActionsPanel
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Close',
              onClick: props.onClose,
            }}
          />
        </React.Fragment>
      )}
    </Drawer>
  );
};

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));
