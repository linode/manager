import { pathOr, clone } from 'ramda';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Delete } from '@material-ui/icons';

import AddNewLink from 'src/components/AddNewLink';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid'; 
import IconButton from 'src/components/IconButton';
import LinearProgress from 'src/components/LinearProgress';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';
import { listIPs } from 'src/services/networking';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 
  'ipFieldLabel'
  | 'containerDivider'
  | 'ipField'
  | 'addNewButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  addNewButton: {
    marginTop: theme.spacing.unit,
  },
  containerDivider: {
   marginTop: theme.spacing.unit,
  },
  ipField: {
    marginTop: 0,
    width: 200,
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
  linodeRegion: string;
  linodeIPs: string[];
}

interface State {
  ipChoices: string[];
  ipsToShare: string[];
  loading: boolean;
  submitting: boolean;
  successMessage?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class IPSharingPanel extends React.Component<CombinedProps, State> {
  state: State = {
    ipChoices: [IPSharingPanel.selectIPText],
    ipsToShare: [IPSharingPanel.selectIPText],
    loading: true,
    submitting: false,
  };

  static errorResources = {
  };

  static selectIPText = 'Select an IP';

  componentDidMount() {
    const { linodeRegion } = this.props;
    listIPs(linodeRegion)
      .then(response => {
        const ips = pathOr([], ['data'], response);
        const ipChoices = ips
          .filter((ip: Linode.IPAddress) => {
            return ip.type === 'ipv4'
                   && !this.props.linodeIPs.includes(ip.address);
          })
          .map((ip: Linode.IPAddress) => ip.address);
        ipChoices.unshift(IPSharingPanel.selectIPText);
        this.setState({
          ipChoices,
          loading: false,
        })
      })
      .catch((response) => {
        const errors = pathOr([], ['response', 'data', 'errors'], response);
        this.setState({
          errors,
          loading: false,
        })
      })
  }

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
    if (!ipIdx) { return; }
    const newIPsToShare = clone(this.state.ipsToShare);
    newIPsToShare[+ipIdx] = e.target.value;
    this.setState({
      ipsToShare: newIPsToShare,
    })
  }
  
  onIPDelete = (e: React.MouseEvent<HTMLElement>) => {
    const ipIdx = e.currentTarget.getAttribute('data-ip-idx');
    if (!ipIdx) { return; }
    const newIPsToShare = clone(this.state.ipsToShare);
    newIPsToShare.splice(+ipIdx, 1);
    this.setState({
      ipsToShare: newIPsToShare,
    })
  }
  
  renderShareIPRow = (ip: string, idx: number) => {
    const { ipChoices } = this.state;
    const { classes } = this.props;
    return (
      <Grid container key={idx}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item>
          <Select
            value={ip}
            onChange={this.onIPSelect}
            fullWidth={false}
            className={classes.ipField}
          >
            {ipChoices.map((ipChoice: string, choiceIdx: number) =>
              <MenuItem 
                data-ip-idx={idx}
                key={choiceIdx}
                value={ipChoice}
              >
                {ipChoice}
              </MenuItem>)
            }
          </Select>
        </Grid>
        {(idx !== 0) &&
          <Grid item>
            <IconButton
              data-ip-idx={idx}
              onClick={this.onIPDelete}
              destructive
            >
              <Delete />
            </IconButton>
          </Grid>
        }
      </Grid>
    );
  }

  addIPToShare = () => {
    this.setState({
      ipsToShare: [
        ...this.state.ipsToShare,
        IPSharingPanel.selectIPText,
      ],
    })
  }

  render() {
    const { classes, linodeIPs } = this.props;
    const { errors, successMessage, ipsToShare, loading } = this.state;

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
            {loading
              ? <LinearProgress style={{ margin: '50px' }} />
              : <React.Fragment>
                  {linodeIPs.map((ip: string) => this.renderMyIPRow(ip))}
                  {ipsToShare.map((ip: string, idx: number) => this.renderShareIPRow(ip, idx))}
                  <div className={classes.addNewButton}>
                    <AddNewLink
                      label="Add IP Address"
                      onClick={this.addIPToShare}
                      left
                    />
                  </div>
                </React.Fragment>
            }
          </Grid>
        </Grid>
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(IPSharingPanel);
