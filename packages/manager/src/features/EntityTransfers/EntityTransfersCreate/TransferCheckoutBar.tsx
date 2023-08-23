import { CreateTransferPayload } from '@linode/api-v4/lib/entity-transfers';
import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { pluralize } from 'src/utilities/pluralize';

import {
  StyledButton,
  StyledClose,
  StyledHeaderTypography,
  StyledRowBoxDiv,
  StyledRowDiv,
  StyledSubmitButton,
  StyledTypography,
} from './TransferCheckoutBar.styles';
import { TransferState } from './transferReducer';

interface Props {
  handleSubmit: (payload: CreateTransferPayload) => void;
  isCreating: boolean;
  removeEntities: (type: string, entitiesToRemove: string[]) => void;
  selectedEntities: TransferState;
}

export const generatePayload = (
  selectedEntities: TransferState
): CreateTransferPayload => {
  const entities = Object.keys(selectedEntities).reduce(
    (acc, entityType) => {
      return {
        ...acc,
        [entityType]: Object.keys(selectedEntities[entityType]).map(Number),
      };
    },
    { linodes: [] }
  );
  return { entities };
};

export const TransferRow: React.FC<{
  label: string;
  onClick: () => void;
}> = React.memo((props) => {
  const { label, onClick } = props;
  return (
    <StyledRowDiv>
      <Typography>
        <strong>{label}</strong>
      </Typography>
      <StyledButton onClick={onClick}>
        <StyledClose />
      </StyledButton>
    </StyledRowDiv>
  );
});

export const TransferCheckoutBar = React.memo((props: Props) => {
  const { handleSubmit, isCreating, removeEntities, selectedEntities } = props;
  const onSubmit = () => {
    const payload = generatePayload(selectedEntities);
    handleSubmit(payload);
  };

  const totalSelectedLinodes = Object.keys(selectedEntities.linodes).length;
  return (
    <div>
      <StyledHeaderTypography>Service Transfer Summary</StyledHeaderTypography>
      <StyledRowBoxDiv>
        {Object.entries(selectedEntities.linodes).map(([id, label]) => (
          <TransferRow
            key={`transfer-summary-${'linodes'}-${id}`}
            label={label}
            onClick={() => removeEntities('linodes', [String(id)])}
          />
        ))}
      </StyledRowBoxDiv>
      {totalSelectedLinodes > 0 ? (
        <StyledTypography>
          {pluralize('Linode', 'Linodes', totalSelectedLinodes)} to be
          transferred
        </StyledTypography>
      ) : (
        <Typography>No Linodes selected</Typography>
      )}
      <StyledSubmitButton
        buttonType="primary"
        disabled={totalSelectedLinodes === 0}
        loading={isCreating}
        onClick={onSubmit}
      >
        Generate Token
      </StyledSubmitButton>
    </div>
  );
});
