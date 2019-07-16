import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import { updateIP } from 'src/services/networking';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

interface Props {
  open: boolean;
  onClose: () => void;
  rdns?: string | null;
  address?: string;
}

interface State {
  rdns?: string | null;
  address?: string;
  loading: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props;

class ViewRangeDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    rdns: this.props.rdns,
    address: this.props.address,
    loading: false
  };

  errorResources = {
    rdns: 'RDNS'
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      rdns: nextProps.rdns,
      address: nextProps.address,
      errors: undefined
    });
  }

  save = () => {
    const { onClose } = this.props;
    const { rdns, address } = this.state;
    this.setState({ loading: true });
    updateIP(address!, !rdns || rdns === '' ? null : rdns)
      .then(_ => {
        this.setState({ loading: false });
        onClose();
      })
      .catch(errResponse => {
        this.setState(
          {
            errors: getAPIErrorOrDefault(errResponse),
            loading: false
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

  render() {
    const { open, onClose } = this.props;
    const { rdns, errors, loading } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);

    return (
      <Drawer open={open} onClose={onClose} title={`Edit Reverse DNS`}>
        <React.Fragment>
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
        </React.Fragment>
      </Drawer>
    );
  }
}

export default ViewRangeDrawer;
