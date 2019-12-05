import { IPAddress, updateIP } from 'linode-js-sdk/lib/networking';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import { arePropsEqual } from 'src/utilities/arePropsEqual';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'section' | 'header' | 'rdnsRecord' | 'ipv6Input';

const styles = (theme: Theme) =>
  createStyles({
    section: {
      marginTop: theme.spacing(2),
      borderTop: `1px solid ${theme.palette.divider}`
    },
    header: {
      marginTop: theme.spacing(2)
    },
    rdnsRecord: {
      marginTop: theme.spacing(2)
    },
    ipv6Input: {
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  open: boolean;
  onClose: () => void;
  rdns?: string | null;
  range?: string;
  address?: string;
  ips?: IPAddress[];
  updateIPs?: (ip: IPAddress) => void;
}

interface State {
  rdns?: string | null;
  address?: string;
  loading: boolean;
  errors?: APIError[];
  delayText: string | null;
  ipv6Address?: string | null;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ViewRangeDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    rdns: this.props.rdns,
    address: this.props.address,
    loading: false,
    delayText: null,
    ipv6Address: this.props.range
  };

  timer: any = undefined;
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.timer);
  }

  errorResources = {
    rdns: 'RDNS'
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    // This is a hack fix. We need to refactor and replace all components with
    // `componentWillReceiveProps`. @todo: do this.
    // https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops
    if (
      !arePropsEqual<CombinedProps>(
        ['rdns', 'address', 'range'],
        this.props,
        nextProps
      )
    ) {
      this.setState({
        rdns: nextProps.rdns,
        address: nextProps.address,
        ipv6Address: nextProps.range,
        errors: undefined
      });
    }
  }

  showDelayText = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({
      delayText:
        'Your request is still pending. Editing RDNS can take up to 30 seconds. Thank you for your patience.'
    });
  };

  save = () => {
    const { onClose, range } = this.props;
    const { rdns, address, ipv6Address } = this.state;

    const ipToUpdate = range ? ipv6Address : address;

    // If the field is blank, return an error.
    if (!ipToUpdate) {
      return this.setState({
        errors: [
          { field: 'ipv6Address', reason: 'Please enter an IPv6 Address' }
        ]
      });
    }

    this.setState({ loading: true, errors: undefined });
    this.timer = setTimeout(this.showDelayText, 5000);

    updateIP(ipToUpdate, !rdns || rdns === '' ? null : rdns)
      .then(ip => {
        if (!this.mounted) {
          return;
        }
        clearTimeout(this.timer);
        this.setState({ loading: false, delayText: null });

        // If we're updating a range, manually update the parent component.
        if (range && this.props.updateIPs) {
          this.props.updateIPs(ip);
        }

        onClose();
      })
      .catch(errResponse => {
        if (!this.mounted) {
          return;
        }
        clearTimeout(this.timer);
        this.setState(
          {
            errors: getAPIErrorOrDefault(errResponse),
            loading: false,
            delayText: null
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  handleChangeDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ rdns: e.target.value });
  };

  handleChangeIPv6Address = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ ipv6Address: e.target.value });
  };

  render() {
    const { open, onClose, range, ips, classes } = this.props;
    const { rdns, ipv6Address, delayText, errors, loading } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);

    return (
      <Drawer open={open} onClose={onClose} title={`Edit Reverse DNS`}>
        <React.Fragment>
          {range && (
            <div className={classes.ipv6Input}>
              <TextField
                placeholder="Enter an IPv6 address"
                value={ipv6Address || ''}
                errorText={hasErrorFor('ipv6Address')}
                onChange={this.handleChangeIPv6Address}
                data-qa-address-name
              />
            </div>
          )}
          <TextField
            placeholder="Enter a domain name"
            value={rdns || ''}
            errorText={hasErrorFor('rdns')}
            onChange={this.handleChangeDomain}
            data-qa-domain-name
          />
          <Typography variant="body1">
            Leave this field blank to reset RDNS
          </Typography>
          {hasErrorFor('none') && (
            <FormHelperText error style={{ marginTop: 16 }} data-qa-error>
              {hasErrorFor('none')}
            </FormHelperText>
          )}
          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              buttonType="primary"
              onClick={this.save}
              loading={loading}
              data-qa-submit
            >
              Save
            </Button>
            <Button
              buttonType="secondary"
              className="cancel"
              onClick={onClose}
              data-qa-cancel
            >
              Close
            </Button>
          </ActionsPanel>
          <Typography variant="body1">{delayText}</Typography>
          {range && ips && ips.length > 0 && (
            <div className={classes.section}>
              <Typography variant="h3" className={classes.header}>
                Existing Records
              </Typography>
              {ips.map(ip => (
                <div key={ip.address} className={classes.rdnsRecord}>
                  <Typography>{ip.address}</Typography>
                  <Typography>{ip.rdns || ''}</Typography>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      </Drawer>
    );
  }
}

const styled = withStyles(styles);

export default styled(ViewRangeDrawer);
