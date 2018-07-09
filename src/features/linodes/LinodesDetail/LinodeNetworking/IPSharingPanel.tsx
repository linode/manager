import { clone, flatten, pathOr, uniq } from 'ramda';
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
import { getLinodes } from 'src/services/linodes';
import { shareAddresses } from 'src/services/networking';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 
  'ipFieldLabel'
  | 'containerDivider'
  | 'ipField'
  | 'addNewButton'
  | 'noIPsMessage';

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
    width: 260,
  },
  ipFieldLabel: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: `calc(175px + ${theme.spacing.unit * 2}px)`,
    },
  },
  noIPsMessage: {
    marginTop: theme.spacing.unit * 2,
  }
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
  ipChoiceLabels: {
    [key: string]: string;
  };
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
    ipChoiceLabels: {},
    ipsToShare: this.props.linodeSharedIPs,
    loading: true,
    submitting: false,
  };
  mounted = false;

  static errorResources = { };
  static selectIPText = 'Select an IP';

  componentDidMount() {
    this.mounted = true;
    const { linodeRegion, linodeID } = this.props;
    const choiceLabels = {}
    getLinodes({}, { region: linodeRegion })
      .then(response => {
        const linodes = pathOr([], ['data'], response);
        const ipChoices = flatten<string>(
          linodes
            .filter((linode: Linode.Linode) => {
              return linode.id !== linodeID;
            })
            .map((linode: Linode.Linode) => {
              // side-effect of this mapping is saving the labels
              linode.ipv4.map((ip: string) => {
                choiceLabels[ip] = linode.label;
              });
              return linode.ipv4;
            })
          )
            .filter((ip: string) => {
              return !ip.startsWith('192.168.');
            });
        ipChoices.unshift(IPSharingPanel.selectIPText);
        if (!this.mounted) { return ;}
        this.setState({
          ipChoices,
          ipChoiceLabels: choiceLabels,
          loading: false,
        })
      })
      .catch((response) => {
        const errors = pathOr([], ['response', 'data', 'errors'], response);
        if (!this.mounted) { return ;}
        this.setState({
          errors,
          loading: false,
        })
      })
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.mounted) { return ;}
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

  onIPSelect = (ipIdx: number) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (ipIdx === undefined) { return; }
    const newIPsToShare = clone(this.state.ipsToShare);
    newIPsToShare[+ipIdx] = e.target.value;
    if (!this.mounted) { return ;}
    this.setState({
      ipsToShare: newIPsToShare,
    })
  }
  
  onIPDelete = (ipIdx: number) => (e: React.MouseEvent<HTMLElement>) => {
    if (ipIdx === undefined) { return; }
    const newIPsToShare = clone(this.state.ipsToShare);
    newIPsToShare.splice(+ipIdx, 1);
    if (!this.mounted) { return ;}
    this.setState({
      ipsToShare: newIPsToShare,
    })
  }

  remainingChoices = (selectedIP: string) => {
    return this.state.ipChoices.filter((ip: string) => {
      const hasBeenSelected = this.state.ipsToShare.includes(ip);
      return ip === selectedIP || !hasBeenSelected;
    })
  }
  
  renderShareIPRow = (ip: string, idx: number) => {
    const { classes } = this.props;
    return (
      <Grid container key={idx}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item>
          <Select
            value={ip}
            onChange={this.onIPSelect(idx)}
            fullWidth={false}
            className={classes.ipField}
          >
            {this.remainingChoices(ip).map((ipChoice: string, choiceIdx: number) =>
              <MenuItem 
                data-ip-idx={idx}
                key={choiceIdx}
                value={ipChoice}
              >
                {ipChoice} {this.state.ipChoiceLabels[ipChoice]}
              </MenuItem>)
            }
          </Select>
        </Grid>
        <Grid item>
          <IconButton
            onClick={this.onIPDelete(idx)}
            destructive
          >
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
    );
  }

  addIPToShare = () => {
    if (!this.mounted) { return ;}
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
    if (!this.mounted) { return ;}
    this.setState({
      errors: undefined,
      submitting: true,
    })
    shareAddresses({ linode_id: this.props.linodeID, ips: finalIPs })
      .then((response) => {
        this.props.refreshIPs();
        if (!this.mounted) { return ;}
        this.setState({
          errors: undefined,
          submitting: false,
          successMessage: 'IP Sharing updated successfully',
        })
      })
      .catch((response) => {
        const errors = pathOr([], ['response', 'data', 'errors'], response);
        if (!this.mounted) { return ;}
        this.setState({
          errors,
          submitting: false,
        })
      });
  }

  onCancel = () => {
    if (!this.mounted) { return ;}
    this.setState({
      errors: undefined,
      ipsToShare: this.props.linodeSharedIPs,
    })
  }

  renderActions = () => {
    const { submitting, loading } = this.state;
    const noChoices = this.state.ipChoices.length <= 1;
    return (
      <ActionsPanel>
        <Button
          loading={submitting}
          disabled={loading || noChoices}
          onClick={this.onSubmit}
          type="primary"
        >
          Save
      </Button>
        <Button
          disabled={submitting || loading || noChoices}
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
    const { errors, successMessage, ipsToShare, loading, ipChoices } = this.state;

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
              : ipChoices.length <= 1
                ? <Typography className={classes.noIPsMessage}>
                    You have no other Linodes in this Linode's datacenter with which to share IPs.
                  </Typography>
                : <React.Fragment>
                    {linodeIPs.map((ip: string) => this.renderMyIPRow(ip))}
                    {ipsToShare.map((ip: string, idx: number) => this.renderShareIPRow(ip, idx))}
                    {/* the "1" that will always be there is the selectionText */}
                    {this.remainingChoices('').length > 1 &&
                      <div className={classes.addNewButton}>
                        <AddNewLink
                          label="Add IP Address"
                          onClick={this.addIPToShare}
                          left
                        />
                      </div>
                    }
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
