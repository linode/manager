import { CreateTransferPayload } from '@linode/api-v4/lib/entity-transfers';
import Close from '@mui/icons-material/Close';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';
import { pluralize } from 'src/utilities/pluralize';

import { TransferState } from './transferReducer';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    backgroundColor: 'inherit',
    border: 'none',
    color: '#979797',
    textDecoration: 'none',
    [theme.breakpoints.down('md')]: {
      visibility: 'visible',
    },
    visibility: 'hidden',
  },
  close: {
    '& svg': { height: 11, width: 11 },
  },
  entitySummaryText: {
    color: theme.color.green,
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(3),
  },
  header: {
    color: theme.color.green,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    lineHeight: '1.5rem',
  },
  root: {},
  row: {
    '&:first-of-type': {
      borderTop: `solid 1px ${theme.color.border2}`,
    },
    '&:hover > button': {
      visibility: 'visible',
    },
    alignItems: 'center',
    borderBottom: `solid 1px ${theme.color.border2}`,
    display: 'flex',
    justifyContent: 'space-between',
    padding: `5px 0px`,
  },
  rowBox: {
    marginTop: theme.spacing(3),
    maxHeight: '75vh',
    overflowY: 'auto',
  },
  submitButton: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: theme.spacing(3),
    width: '100%',
  },
}));

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
  const classes = useStyles();
  return (
    <div className={classes.row}>
      <Typography>
        <strong>{label}</strong>
      </Typography>
      <button className={classes.button} onClick={onClick}>
        <Close className={classes.close} />
      </button>
    </div>
  );
});

export const TransferCheckoutBar: React.FC<Props> = (props) => {
  const { handleSubmit, isCreating, removeEntities, selectedEntities } = props;
  const classes = useStyles();
  const onSubmit = () => {
    const payload = generatePayload(selectedEntities);
    handleSubmit(payload);
  };

  const totalSelectedLinodes = Object.keys(selectedEntities.linodes).length;
  return (
    <div className={classes.root}>
      <Typography className={classes.header}>
        Service Transfer Summary
      </Typography>
      <div className={classes.rowBox}>
        {Object.entries(selectedEntities.linodes).map(([id, label]) => (
          <TransferRow
            key={`transfer-summary-${'linodes'}-${id}`}
            label={label}
            onClick={() => removeEntities('linodes', [String(id)])}
          />
        ))}
      </div>
      {totalSelectedLinodes > 0 ? (
        <Typography className={classes.entitySummaryText}>
          {pluralize('Linode', 'Linodes', totalSelectedLinodes)} to be
          transferred
        </Typography>
      ) : (
        <Typography>No Linodes selected</Typography>
      )}
      <Button
        buttonType="primary"
        className={classes.submitButton}
        disabled={totalSelectedLinodes === 0}
        loading={isCreating}
        onClick={onSubmit}
      >
        Generate Token
      </Button>
    </div>
  );
};

export default React.memo(TransferCheckoutBar);
