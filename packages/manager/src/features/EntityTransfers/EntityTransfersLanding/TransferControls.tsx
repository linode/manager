import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Button } from 'src/components/Button/Button';
import { Hidden } from 'src/components/Hidden';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

import { ConfirmTransferDialog } from './ConfirmTransferDialog';

// sm = 600, md = 960, lg = 1280

const xs_sm = 450;

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    color: theme.textColors.headlineStatic,
    fontSize: '1rem',
    marginRight: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      flexBasis: '100%',
      marginBottom: theme.spacing(1),
    },
    whiteSpace: 'nowrap',
  },
  labelWrapper: {
    margin: 0,
    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap',
    },
    [theme.breakpoints.down('md')]: {
      '& > div': {
        margin: 0,
        padding: 0,
      },
      marginBottom: theme.spacing(1),
      padding: 0,
      width: 'calc(600px - 32px)',
    },
    [theme.breakpoints.down('sm')]: {
      margin: `${theme.spacing(1)} 0`,
      width: '100%',
    },
    [theme.breakpoints.down(xs_sm)]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
  makeTransfer: {
    paddingLeft: 0,
    paddingRight: 0,
    [theme.breakpoints.down('md')]: {
      width: 'calc(600px - 32px)',
    },
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      width: '100%',
    },
  },
  makeTransferButton: {
    marginBottom: theme.spacing(),
    minWidth: 152,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    [theme.breakpoints.down('sm')]: {
      margin: `${theme.spacing()} 0`,
    },
    [theme.breakpoints.down(xs_sm)]: {
      marginTop: 0,
      minWidth: 'auto',
    },
    whiteSpace: 'nowrap',
  },
  reviewDetails: {
    marginLeft: theme.spacing(2),
    [theme.breakpoints.down(xs_sm)]: {
      marginLeft: 0,
      marginTop: theme.spacing(),
      width: '100%',
    },
  },
  root: {
    margin: `${theme.spacing(2)} 0`,
    [theme.breakpoints.down('md')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      marginLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(2),
    },
  },
  transferInput: {
    [theme.breakpoints.down('lg')]: {
      width: 240,
    },
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
    width: 360,
  },
  transferInputWrapper: {
    [theme.breakpoints.down('md')]: {
      '& > div': {
        flexGrow: 1,
      },
      flexBasis: '100%',
      width: 'calc(600px-32px)',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

export const TransferControls = React.memo(() => {
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
        alignItems="center"
        className={classes.root}
        container
        justifyContent="space-between"
        spacing={2}
        wrap="nowrap"
      >
        <Grid
          alignItems="center"
          className={`px0 ${classes.labelWrapper}`}
          container
          wrap="nowrap"
        >
          <Typography className={classes.label}>
            <strong>Receive a Service Transfer</strong>
          </Typography>
          <Grid
            alignItems="center"
            className={classes.transferInputWrapper}
            container
            direction="row"
          >
            <TextField
              className={classes.transferInput}
              hideLabel
              label="Receive a Service Transfer"
              onChange={handleInputChange}
              placeholder="Enter a token"
              value={token}
            />
            <Button
              buttonType="primary"
              className={classes.reviewDetails}
              disabled={token === ''}
              onClick={() => setConfirmDialogOpen(true)}
            >
              Review Details
            </Button>
            <Hidden mdDown>
              <TooltipIcon
                status="help"
                text="Enter a service transfer token to review the details and accept the transfer."
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
        onClose={handleCloseDialog}
        open={confirmDialogOpen}
        token={token}
      />
    </>
  );
});
