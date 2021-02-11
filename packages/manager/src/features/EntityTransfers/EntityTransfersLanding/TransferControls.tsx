import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  receiveTransfer: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  reviewDetails: {
    marginLeft: theme.spacing()
  },
  label: {
    marginRight: theme.spacing(2),
    fontSize: '1rem'
  },
  transferInput: {
    width: 356,
    '& input': {
      width: '100%'
    }
  }
}));

interface Props {
  token: string;
  onTokenInput: (token: string) => void;
  openConfirmTransferDialog: () => void;
}

export type CombinedProps = Props;

export const TransferControls: React.FC<Props> = props => {
  const { openConfirmTransferDialog, onTokenInput, token } = props;
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
          className={classes.transferInput}
          fullWidth
          hideLabel
          label="Receive a Transfer"
          placeholder="Enter a token"
          onChange={handleInputChange}
        />
        <Button
          className={classes.reviewDetails}
          buttonType="primary"
          disabled={token === ''}
          onClick={openConfirmTransferDialog}
        >
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
