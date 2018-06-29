import { clone, pathOr, uniq } from 'ramda';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Delete } from '@material-ui/icons';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid'; 
import IconButton from 'src/components/IconButton';
import LinearProgress from 'src/components/LinearProgress';
import MenuItem from 'src/components/MenuItem';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';
import { listIPs, shareAddresses } from 'src/services/networking';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 
  'ipFieldLabel'
  | 'containerDivider'
  | 'ipField'
  | 'addNewButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  addNewButton: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: -theme.spacing.unit * 2,
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
  linodeSharedIPs: string[];
  refreshIPs: () => Promise<void>;
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
    ipChoices: [],
    ipsToShare: this.props.linodeSharedIPs,
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
                   && ip.public === true
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

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      ipsToShare: nextProps.linodeSharedIPs,
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
        <Grid item>
          <IconButton
            data-ip-idx={idx}
            onClick={this.onIPDelete}
            destructive
          >
            <Delete />
          </IconButton>
        </Grid>
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

  onSubmit = () => {
    const finalIPs = uniq(this.state.ipsToShare
      .filter((ip: string) => ip !== IPSharingPanel.selectIPText));
    this.setState({
      errors: undefined,
      submitting: true,
    })
    shareAddresses({ linode_id: this.props.linodeID, ips: finalIPs })
      .then((response) => {
        this.props.refreshIPs();
        this.setState({
          errors: undefined,
          submitting: false,
          successMessage: 'IP Sharing updated successfully',
        })
      })
      .catch((response) => {
        const errors = pathOr([], ['response', 'data', 'errors'], response);
        this.setState({
          errors,
          submitting: false,
        })
      });
  }

  onCancel = () => {
    this.setState({
      errors: undefined,
      ipsToShare: this.props.linodeSharedIPs,
    })
  }

  renderActions = () => {
    const { submitting, loading } = this.state;
    return (
      <ActionsPanel>
        <Button
          loading={submitting}
          disabled={loading}
          onClick={this.onSubmit}
          type="primary"
        >
          Save
      </Button>
        <Button
          disabled={submitting || loading}
          onClick={this.onCancel}
          type="secondary"
        >
          Cancel
        </Button>
      </ActionsPanel>
    );
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
        actions={this.renderActions}
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
