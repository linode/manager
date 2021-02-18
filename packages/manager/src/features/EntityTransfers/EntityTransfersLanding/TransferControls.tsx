import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import HelpIcon from 'src/components/HelpIcon';
import TextField from 'src/components/TextField';
import ConfirmTransferDialog from './ConfirmTransferDialog';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  receiveTransfer: {
    display: 'flex',
    flexFlow: 'row wrap',
    alignItems: 'center',
    justifyContent: 'center'
  },
  reviewDetails: {
    marginLeft: theme.spacing(2)
  },
  label: {
    marginRight: theme.spacing(2),
    fontSize: '1rem'
  },
  transferInput: {
    width: 360,
    [theme.breakpoints.down('sm')]: {
      width: 150
    }
  },
  helpIcon: {
    color: theme.color.grey1
  }
}));

export const TransferControls: React.FC<{}> = _ => {
  const [token, setToken] = React.useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  const classes = useStyles();
  const { push } = useHistory();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    // I don't love the UX here but it seems better than leaving a token in the input
    setTimeout(() => setToken(''), 150);
  };

  const handleCreateTransfer = () => push('/account/entity-transfers/create');
  return (
    <>
      <Grid container className={classes.root}>
        <Grid item>
          <Typography className={classes.label}>
            <strong>Receive a Transfer</strong>
          </Typography>
        </Grid>
        <div className={classes.receiveTransfer}>
          <TextField
            className={classes.transferInput}
            hideLabel
            value={token}
            label="Receive a Transfer"
            placeholder="Enter a token"
            onChange={handleInputChange}
          />
          <Button
            className={classes.reviewDetails}
            buttonType="primary"
            disabled={token === ''}
            onClick={() => setConfirmDialogOpen(true)}
          >
            Review Details
          </Button>
          <Hidden mdDown>
            <HelpIcon
              className={classes.helpIcon}
              text="Enter a transfer token to review the details and accept the transfer."
            />
          </Hidden>
        </div>
        <Button buttonType="primary" onClick={handleCreateTransfer}>
          Make a Transfer
        </Button>
      </Grid>
      <ConfirmTransferDialog
        open={confirmDialogOpen}
        token={token}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default React.memo(TransferControls);
