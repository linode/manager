import * as React from 'react';
import { compose, clamp, defaultTo } from 'ramda';
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

import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import defaultNumeric from 'src/utilities/defaultNumeric';

import { updateNodeBalancer } from 'src/services/nodebalancers';

type ClassNames = 'root'
| 'title'
| 'inner'
| 'adornment';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  inner: {
    padding: 0,
  },
  adornment: {
    fontSize: '.9rem',
    marginRight: 10,
  },
});

interface Props {
  nodeBalancer: Linode.NodeBalancer;
}

interface State {
  isSubmitting: boolean;
  errors?: Linode.ApiFieldError[];
  success?: SuccessMessages;
  fields: FieldsState;
}

type updateNodeBalancerData = 'label' | 'client_conn_throttle';

interface FieldsState {
  label?: string;
  client_conn_throttle?: number;
}

interface SuccessMessages {
  label?: string;
  client_conn_throttle?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  label: 'label',
  client_conn_throttle: 'client connection throttle',
};

class NodeBalancerSettings extends React.Component<CombinedProps, State> {
  static defaultFieldsStates = {};

  static defaultSuccessMessages = {
    label: undefined,
    client_conn_throttle: undefined,
  };

  state: State = {
    isSubmitting: false,
    errors: undefined,
    fields: NodeBalancerSettings.defaultFieldsStates,
    success: NodeBalancerSettings.defaultSuccessMessages,
  };

  updateNodeBalancer = (whichField: updateNodeBalancerData) => {
    const { label, client_conn_throttle } = this.state.fields;
    this.setState({
      isSubmitting: true,
      errors: undefined,
      success: NodeBalancerSettings.defaultSuccessMessages,
    });
    const data = (whichField === 'label') ? { label } : { client_conn_throttle };
    updateNodeBalancer(this.props.nodeBalancer.id, data).then((data) => {
      this.setState({
        isSubmitting: false,
        success: (whichField === 'label')
          ? {
            ...this.state.success,
            label: 'Label updated successfully',
          }
          : {
            ...this.state.success,
            client_conn_throttle: 'Client Connection Throttle updated successfully',
          },
      });
    }).catch((error) => {
      this.setState({ isSubmitting: false, errors: error.response.data.errors });
    });
  }

  render() {
    const { fields, isSubmitting, success } = this.state;
    const { classes } = this.props;
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);
    const generalError = hasErrorFor('none');
    return (
      <React.Fragment>
          <Typography variant="headline" className={classes.title}>
            Settings
          </Typography>

          {generalError && <Notice error>{generalError}</Notice>}
          <LabelAndTagsPanel
            isExpansion={true}
            success={success!.label}
            isSubmitting={isSubmitting}
            action={this.updateNodeBalancer}
            labelFieldProps={{
              onChange: e => this.setState({
                fields: {
                  ...fields,
                  label: e.target.value,
                },
              }),
              label: 'NodeBalancer Label',
              placeholder: 'Enter a label between 3 and 32 characters',
              errorText: hasErrorFor('label'),
            }}
          />

          <ClientConnectionThrottlePanel
            isExpansion={true}
            isSubmitting={isSubmitting}
            success={success!.client_conn_throttle}
            action={this.updateNodeBalancer}
            textFieldProps={{
              label: 'Client Connection Throttle',
              placeholder: '0',
              InputProps: {
                endAdornment:
                  <InputAdornment position="end" className={classes.adornment}>
                    / second
                  </InputAdornment>,
              },
              errorText: hasErrorFor('client_conn_throttle'),
              value: defaultTo(0, fields.client_conn_throttle),
              onChange: e => this.setState({
                fields: {
                  ...fields,
                  client_conn_throttle: controlClientConnectionThrottle(e.target.value),
                },
              }),
            }}
          />
      </React.Fragment>
    );
  }
}

const controlClientConnectionThrottle = compose(
  clamp(0, 20),
  defaultNumeric(0),
);

const styled = withStyles(styles, { withTheme: true });

export default styled(NodeBalancerSettings);
