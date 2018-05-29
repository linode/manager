import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import InputAdornment from 'material-ui/Input/InputAdornment';

import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import ClientConnectionThrottlePanel from '../../ClientConnectionThrottlePanel';
import Notice from 'src/components/Notice';
// import Button from 'src/components/Button';
// import ActionsPanel from 'src/components/ActionsPanel';

import getAPIErrorFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root' | 'inner';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  inner: {
    padding: theme.spacing.unit,
  },
});

interface Props { }

interface State {
  isSubmitting: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  label: 'label',
  client_conn_throttle: 'client connection throttle',
};

class NodeBalancerSettings extends React.Component<CombinedProps, State> {
  state: State = {
    isSubmitting: false,
    errors: undefined,
  };

  render() {
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);
    const generalError = hasErrorFor('none');
    // const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography variant="headline">
          Settings
        </Typography>

        {generalError && <Notice error>{generalError}</Notice>}
        <LabelAndTagsPanel
          isExpansion={true}
          labelFieldProps={{
            label: 'NodeBalancer Label',
            placeholder: 'Please enter a label between 3 and 32 characters',
            errorText: hasErrorFor('label'),
          }}
        />
        <ClientConnectionThrottlePanel
          textFieldProps={{
            label: 'Client Connection Throttle',
            InputProps: {
              endAdornment: <InputAdornment position="end">/ second</InputAdornment>,
            },
            errorText: hasErrorFor('client_conn_throttle'),
          }}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(NodeBalancerSettings);
