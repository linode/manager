import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid'; 
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';

import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 
  'ipFieldLabel'
  | 'containerDivider'
  | 'ipField';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  containerDivider: {
   marginTop: theme.spacing.unit,
  },
  ipField: {
    marginTop: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 175,
    },
  },
  ipFieldLabel: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: `calc(175px + ${theme.spacing.unit * 2}px)`,
    },
  },
});

interface Props {
  linodeID: number;
  linodeIPs: string[];
}

interface State {
  ipChoices: string[];
  ipsToShare: string[];
  submitting: boolean;
  successMessage?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class IPSharingPanel extends React.Component<CombinedProps, State> {
  state: State = {
    ipChoices: ['Select an IP'],
    ipsToShare: ['Select an IP'],
    submitting: false,
  };

  static errorResources = {
  };

  renderMyIPRow = (ip: string) => {
    const { classes } = this.props;
    return (
      <Grid container key={ip}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item>
          <TextField disabled value={ip} className={classes.ipField} />
        </Grid>
      </Grid>
    );
  }

  onIPSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ipIdx = e.currentTarget.getAttribute('data-ip-idx');
    console.log(e.target.value, ipIdx);
  }
  
  renderShareIPRow = (ip: string, idx: number) => {
    const { ipChoices } = this.state;
    const { classes } = this.props;
    return (
      <Grid container key={ip}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item>
          <Select
            value={ip}
            data-ip-idx={idx}
            onChange={this.onIPSelect}
            fullWidth={false}
            className={classes.ipField}
          >
            {ipChoices.map((ipChoice: string) =>
              <MenuItem key={ipChoice} value={ipChoice}>{ipChoice}</MenuItem>)}
          </Select>
        </Grid>
      </Grid>
    );
  }

  render() {
    const { classes, linodeIPs } = this.props;
    const { errors, successMessage, ipsToShare } = this.state;

    const errorFor = getAPIErrorsFor(IPSharingPanel.errorResources, errors);
    const generalError = errorFor('none');

    return (
      <ExpansionPanel
        defaultExpanded
        heading="IP Sharing"
        error={generalError}
        success={successMessage}
      >
        <Grid container>
          <Grid item sm={12} lg={8} xl={6}>
            <Typography>
              IP Sharing allows a Linode to share an IP address assignment
              (one or more additional IPv4 addresses). This can be
              used to allow one Linode to begin serving requests should
              another become unresponsive. Only IPs in the same
              datacenter are offered for sharing.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid item className={classes.ipFieldLabel}>IP Addresses</Grid>
            </Grid>
            {linodeIPs.map((ip: string) => this.renderMyIPRow(ip))}
            {ipsToShare.map((ip: string, idx: number) => this.renderShareIPRow(ip, idx))}
          </Grid>
        </Grid>
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(IPSharingPanel);
