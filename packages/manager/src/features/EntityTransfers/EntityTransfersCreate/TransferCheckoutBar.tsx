import * as React from 'react';
import CheckoutBar from 'src/components/CheckoutBar';
import { TransferState } from './transferReducer';
import Typography from 'src/components/core/Typography';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({}));

interface Props {
  selectedEntities: TransferState;
  removeEntities: (type: string, entitiesToRemove: string[]) => void;
}

export const generatePayload = (selectedEntities: TransferState) => {
  return Object.keys(selectedEntities).reduce((acc, entityType) => {
    return {
      ...acc,
      [entityType]: Object.keys(selectedEntities[entityType]).map(Number)
    };
  }, {});
};

export const TransferCheckoutBar: React.FC<Props> = props => {
  const { selectedEntities, removeEntities } = props;
  const onSubmit = () => {
    const payload = generatePayload(selectedEntities);
    alert(JSON.stringify(payload));
  };

  const totalSelectedLinodes = Object.keys(selectedEntities.linodes).length;
  return (
    <CheckoutBar
      submitText="Generate Transfer Token"
      heading="Transfer Summary"
      onDeploy={onSubmit}
    >
      <div>
        {Object.entries(selectedEntities.linodes).map(([id, label]) => (
          <div key={`transfer-summary-${'linodes'}-${id}`}>
            {label}
            <button onClick={() => removeEntities('linodes', [String(id)])}>
              X
            </button>
          </div>
        ))}
        {totalSelectedLinodes > 0 ? (
          <Typography>
            {totalSelectedLinodes} Linodes to be transferred
          </Typography>
        ) : null}
      </div>
    </CheckoutBar>
  );
};

export default React.memo(TransferCheckoutBar);
