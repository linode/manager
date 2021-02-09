import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import TextField from 'src/components/TextField';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  receiveTransfer: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginRight: theme.spacing(3)
  },
  label: {
    marginRight: theme.spacing()
  }
}));

interface Props {
  onTokenInput: (token: string) => void;
  openConfirmTransferDialog: () => void;
}

export type CombinedProps = Props;

export const TransferControls: React.FC<Props> = props => {
  const { openConfirmTransferDialog, onTokenInput } = props;
  const classes = useStyles();
  const { push } = useHistory();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTokenInput(e.target.value);
  };

  const handleCreateTransfer = () => push('/account/entity-transfers/create');
  return (
    <div className={classes.root}>
      <div className={classes.receiveTransfer}>
        <Typography className={classes.label}>
          <strong>Receive a Transfer</strong>
        </Typography>
        <TextField
          hideLabel
          label="Receive a Transfer"
          placeholder="Enter a token"
          onChange={handleInputChange}
        />
        <Button buttonType="secondary" onClick={openConfirmTransferDialog}>
          Review Details
        </Button>
      </div>
      <Button buttonType="primary" onClick={handleCreateTransfer}>
        Make a Transfer
      </Button>
    </div>
  );
};

export default React.memo(TransferControls);
