import { TransferEntities } from '@linode/api-v4/lib/entity-transfers/types';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Dialog } from 'src/components/Dialog/Dialog';
import { Typography } from 'src/components/Typography';

export interface Props {
  entities?: TransferEntities;
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

export const TransferDetailsDialog = React.memo((props: Props) => {
  const { entities, isOpen, onClose, token } = props;

  return (
    <Dialog
      fullWidth
      onClose={onClose}
      open={isOpen}
      title="Service Transfer Details"
    >
      <StyledTokenDiv>
        <StyledTypography>Token: </StyledTypography>
        {token}
      </StyledTokenDiv>
      <StyledTypography>Linode IDs:</StyledTypography>
      <StyledEntitiesDiv>
        {entities?.linodes.map((entity, idx) => {
          return (
            <Typography data-testid={idx} key={idx}>
              {entity}
            </Typography>
          );
        })}
      </StyledEntitiesDiv>
    </Dialog>
  );
});

export const StyledEntitiesDiv = styled('div', {
  label: 'StyledDiv',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontFamily: theme.font.bold,
}));

export const StyledTokenDiv = styled('div', {
  label: 'StyledTokenDiv',
})(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));
