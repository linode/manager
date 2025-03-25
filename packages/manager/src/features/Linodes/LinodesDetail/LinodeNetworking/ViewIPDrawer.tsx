import { useRegionsQuery } from '@linode/queries';
import { ActionsPanel, Drawer, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { NotFound } from 'src/components/NotFound';

import type { IPAddress } from '@linode/api-v4/lib/networking';

interface Props {
  ip?: IPAddress;
  onClose: () => void;
  open: boolean;
}

export const ViewIPDrawer = (props: Props) => {
  const { ip } = props;

  const { data: regions } = useRegionsQuery();

  const actualRegion = regions?.find((r) => r.id === ip?.region);

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={props.onClose}
      open={props.open}
      title={`Details for IP`}
    >
      {ip && (
        <React.Fragment>
          <StyledSectionDiv data-qa-ip-address-heading>
            <Typography variant="h3">Address</Typography>
            <Typography data-qa-ip-address variant="body1">
              {ip.address}
            </Typography>
          </StyledSectionDiv>

          <StyledSectionDiv data-qa-gateway-heading>
            <Typography variant="h3">Gateway</Typography>
            <Typography data-qa-gateway variant="body1">
              {ip.gateway}
            </Typography>
          </StyledSectionDiv>

          <StyledSectionDiv data-qa-subnet-heading>
            <Typography variant="h3">Subnet Mask</Typography>
            <Typography data-qa-subnet variant="body1">
              {ip.subnet_mask}
            </Typography>
          </StyledSectionDiv>

          <StyledSectionDiv data-qa-type-heading>
            <Typography variant="h3">Type</Typography>
            <Typography data-qa-type variant="body1">
              {ip.type}
            </Typography>
          </StyledSectionDiv>

          <StyledSectionDiv data-qa-public-heading>
            <Typography variant="h3">Public</Typography>
            <Typography data-qa-public variant="body1">
              {ip.public ? 'Yes' : 'No'}
            </Typography>
          </StyledSectionDiv>

          {ip.rdns && (
            <StyledSectionDiv data-qa-rdns-heading>
              <Typography variant="h3">RDNS</Typography>
              <Typography data-qa-rdns variant="body1">
                {ip.rdns}
              </Typography>
            </StyledSectionDiv>
          )}

          <StyledSectionDiv
            data-qa-region-heading
            style={{ border: 0, paddingBottom: 0 }}
          >
            <Typography variant="h3">Region</Typography>
            <Typography data-qa-region variant="body1">
              {actualRegion?.label ?? ip.region}
            </Typography>
          </StyledSectionDiv>

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

const StyledSectionDiv = styled('div', { label: 'StyledSectionDiv' })(
  ({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  })
);
