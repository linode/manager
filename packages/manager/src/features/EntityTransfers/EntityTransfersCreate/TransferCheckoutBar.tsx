import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { pluralize } from 'src/utilities/pluralize';
import { TransferState } from './transferReducer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  header: {
    color: theme.color.green,
    fontSize: '1.25rem',
    lineHeight: '1.5rem',
    fontWeight: 'bold'
  },
  button: {
    textDecoration: 'none',
    border: 'none',
    backgroundColor: 'inherit',
    color: '#979797'
  },
  close: {
    '& svg': { height: 11, width: 11 }
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing()}px 0px`,
    borderBottom: `solid 1px ${theme.color.border2}`,
    '&:first-of-type': {
      borderTop: `solid 1px ${theme.color.border2}`
    }
  },
  rowBox: {
    maxHeight: '75vh',
    overflowY: 'auto',
    marginTop: theme.spacing(3)
  },
  submitButton: {
    marginTop: theme.spacing(3),
    width: '100%'
  },
  entitySummaryText: {
    marginTop: theme.spacing(3),
    color: theme.color.green,
    fontSize: '1rem',
    fontWeight: 'bold'
  }
}));

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

export const TransferRow: React.FC<{
  label: string;
  onClick: () => void;
}> = React.memo(props => {
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

export const TransferCheckoutBar: React.FC<Props> = props => {
  const { selectedEntities, removeEntities } = props;
  const classes = useStyles();
  const onSubmit = () => {
    const payload = generatePayload(selectedEntities);
    alert(JSON.stringify(payload));
  };

  const totalSelectedLinodes = Object.keys(selectedEntities.linodes).length;
  return (
    <div>
      <Typography className={classes.header}>Transfer Summary</Typography>
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
      ) : null}
      <Button
        buttonType="primary"
        disabled={totalSelectedLinodes === 0}
        onClick={onSubmit}
        className={classes.submitButton}
      >
        Generate Transfer Token
      </Button>
    </div>
  );
};

export default React.memo(TransferCheckoutBar);
