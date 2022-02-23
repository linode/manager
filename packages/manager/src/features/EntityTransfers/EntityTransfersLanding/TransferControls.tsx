import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import TextField from 'src/components/TextField';
import ConfirmTransferDialog from './ConfirmTransferDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: `${theme.spacing(2)}px 0`,
    width: '100%',
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-end',
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      marginTop: theme.spacing(),
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  },
  reviewDetails: {
    marginLeft: theme.spacing(2),
  },
  labelWrapper: {
    margin: 0,
    width: '100%',
    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap',
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginLeft: theme.spacing(),
    },
  },
  label: {
    color: theme.textColors.headlineStatic,
    fontSize: '1rem',
    marginRight: theme.spacing(),
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 4,
      marginLeft: 0,
    },
  },
  transferInputWrapper: {
    [theme.breakpoints.down('xs')]: {
      width: 'calc(100% - 16px)',
      '& > div': {
        flexGrow: 1,
      },
    },
  },
  transferInput: {
    width: 360,
    [theme.breakpoints.down('md')]: {
      width: 240,
    },
    [theme.breakpoints.down('sm')]: {
      width: 200,
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  makeTransfer: {
    [theme.breakpoints.up('md')]: {
      '&.MuiGrid-item': {
        paddingRight: 0,
      },
    },
    [theme.breakpoints.down('xs')]: {
      margin: 0,
      width: '100%',
      '&.MuiGrid-item': {
        padding: 0,
      },
    },
  },
  makeTransferButton: {
    minWidth: 152,
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(),
    },
    [theme.breakpoints.down('sm')]: {
      margin: 0,
    },
    [theme.breakpoints.down('xs')]: {
      margin: 0,
      marginTop: theme.spacing(),
      marginBottom: theme.spacing(),
      width: 'calc(100% - 32px)',
    },
  },
}));

export const TransferControls: React.FC<{}> = (_) => {
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

  const handleCreateTransfer = () => push('/account/service-transfers/create');
  return (
    <>
      <Grid
        container
        className={classes.root}
        alignItems="center"
        justifyContent="space-between"
        wrap="nowrap"
      >
        <Grid
          container
          item
          className={`px0 ${classes.labelWrapper}`}
          alignItems="center"
          wrap="nowrap"
        >
          <Typography className={classes.label}>
            <strong>Receive a Service Transfer</strong>
          </Typography>
          <Grid
            container
            item
            className={classes.transferInputWrapper}
            direction="row"
            alignItems="center"
          >
            <TextField
              className={classes.transferInput}
              hideLabel
              value={token}
              label="Receive a Service Transfer"
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
            <Hidden smDown>
              <HelpIcon text="Enter a service transfer token to review the details and accept the transfer." />
            </Hidden>
          </Grid>
        </Grid>
        <Grid item className={classes.makeTransfer}>
          <Button
            buttonType="primary"
            className={classes.makeTransferButton}
            onClick={handleCreateTransfer}
          >
            Make a Service Transfer
          </Button>
        </Grid>
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
