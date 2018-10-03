import { path } from 'ramda';
import * as React from 'react';

import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import { updateIP } from 'src/services/networking';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
  rdns?: string;
  address?: string;
}

interface State {
  rdns?: string;
  address?: string;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ViewRangeDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    rdns: this.props.rdns,
    address: this.props.address,
  };

  errorResources = {
    rdns: 'RDNS',
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      rdns: nextProps.rdns,
      address: nextProps.address,
      errors: undefined,
    });
  }

  save = () => {
    const { onClose } = this.props;
    const { rdns, address } = this.state;
    updateIP(address!, { rdns: (!rdns || rdns === '') ? null : rdns })
      .then((ipAddress) => {
        onClose();
      })
      .catch((errResponse) => {
        this.setState({
          errors: path(['response', 'data', 'errors'], errResponse),
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  handleChangeDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ rdns: e.target.value });
  }

  render() {
    const { open, onClose } = this.props;
    const { rdns, errors } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={`Edit Reverse DNS`}
      >
        <React.Fragment>
          <TextField
            placeholder="Enter a domain name"
            value={rdns || ''}
            errorText={hasErrorFor('rdns')}
            onChange={this.handleChangeDomain}
            data-qa-domain-name
          />
          <Typography variant="caption">
            Leave this field blank to reset RDNS
          </Typography>

          { hasErrorFor('none') &&
            <FormHelperText error style={{ marginTop: 16 }} data-qa-error>
              { hasErrorFor('none') }
            </FormHelperText>
          }

          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              variant="raised"
              color="primary"
              onClick={this.save}
              data-qa-submit
            >
              Save
            </Button>
            <Button
              variant="raised"
              color="secondary"
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

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(ViewRangeDrawer);
