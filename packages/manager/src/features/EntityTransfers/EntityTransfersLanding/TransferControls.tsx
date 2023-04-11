import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import TextField from 'src/components/TextField';
import ConfirmTransferDialog from './ConfirmTransferDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: `${theme.spacing(2)} 0`,
    [theme.breakpoints.down('lg')]: {
      alignItems: 'flex-end',
    },
    [theme.breakpoints.down('sm')]: {
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
    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap',
    },
    [theme.breakpoints.down('md')]: {
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
    [theme.breakpoints.down('md')]: {
      marginBottom: 4,
      marginLeft: 0,
    },
  },
  transferInputWrapper: {
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 16px)',
      '& > div': {
        flexGrow: 1,
      },
    },
  },
  transferInput: {
    width: 360,
    [theme.breakpoints.down('lg')]: {
      width: 240,
    },
    [theme.breakpoints.down('md')]: {
      width: 200,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  makeTransfer: {
    paddingRight: 0,
    paddingLeft: 0,
    [theme.breakpoints.up('md')]: {
      '&.MuiGrid-item': {
        paddingRight: 0,
      },
    },
    [theme.breakpoints.down('sm')]: {
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
    [theme.breakpoints.down('lg')]: {
      marginBottom: theme.spacing(),
    },
    [theme.breakpoints.down('md')]: {
      margin: 0,
    },
    [theme.breakpoints.down('sm')]: {
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
        spacing={2}
      >
        <Grid
          container
          className={`px0 ${classes.labelWrapper}`}
          alignItems="center"
          wrap="nowrap"
        >
          <Typography className={classes.label}>
            <strong>Receive a Service Transfer</strong>
          </Typography>
          <Grid
            container
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
            <Hidden mdDown>
              <TooltipIcon
                text="Enter a service transfer token to review the details and accept the transfer."
                status="help"
              />
            </Hidden>
          </Grid>
        </Grid>
        <Grid className={classes.makeTransfer}>
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
