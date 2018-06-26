import * as React from 'react';

import { clamp, compose, defaultTo } from 'ramda';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

import { updateNodeBalancer } from 'src/services/nodebalancers';

import defaultNumeric from 'src/utilities/defaultNumeric';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root'
| 'title'
| 'adornment'
| 'inner' 
| 'expPanelButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  adornment: {
    fontSize: '.9rem',
    marginRight: 10,
  },
  inner: {
    paddingBottom: theme.spacing.unit * 3,
  },
  expPanelButton: {
    padding: 0,
    marginTop: theme.spacing.unit * 2,
  },
});

interface Props {
  nodeBalancerId: number;
  nodeBalancerLabel: string;
  nodeBalancerClientConnThrottle: number;
}

interface State {
  isSubmitting: boolean;
  errors?: Linode.ApiFieldError[];
  success?: string;
  fields: FieldsState;
}

interface FieldsState {
  label?: string;
  client_conn_throttle?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const errorResources = {
  client_conn_throttle: 'client connection throttle',
  label: 'label',
};

class NodeBalancerSettings extends React.Component<CombinedProps, State> {
  static defaultFieldsStates = (props: CombinedProps) => ({
    client_conn_throttle: props.nodeBalancerClientConnThrottle,
    label: props.nodeBalancerLabel,
  })

  state: State = {
    errors: undefined,
    fields: NodeBalancerSettings.defaultFieldsStates(this.props),
    isSubmitting: false,
    success: undefined,
  };

  handleLabelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { fields } = this.state;
    this.setState({
      fields: {
        ...fields,
        label: e.target.value,
      },
    })
  }

  handleThrottleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { fields } = this.state;
    this.setState({
      fields: {
        ...fields,
        client_conn_throttle: controlClientConnectionThrottle(e.target.value),
      },
    });
  }

  updateNodeBalancer = () => {
    const { label, client_conn_throttle } = this.state.fields;
    this.setState({
      errors: undefined,
      isSubmitting: true,
      success: undefined,
    });
    const data = { label, client_conn_throttle };
    updateNodeBalancer(this.props.nodeBalancerId, data).then(() => {
      this.setState({
        isSubmitting: false,
        success:'NodeBalancer settings updated successfully',
      });
    }).catch((error) => {
      this.setState({ isSubmitting: false, errors: error.response.data.errors }, () => {
        scrollErrorIntoView();
      });
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
        <Paper style={{ padding: 24 }}>
          <Grid item xs={12}>
            {generalError && <Notice error text={generalError}/>}
            {success && <Notice success text={success}/>}
          </Grid>
          <div className={classes.inner}>
            <TextField 
              data-qa-label-panel
              errorText={hasErrorFor('label')}
              label='Label'
              placeholder='Enter a label between 3 and 32 characters'
              onChange={this.handleLabelInputChange}
              value={fields.label}
              />
          </div>
          <div className={classes.inner}>
            <TextField 
                data-qa-connection-throttle
                InputProps={{
                  endAdornment: <span className={classes.adornment}>
                  / second</span>,
                }}
                errorText={hasErrorFor('client_conn_throttle')}
                label='Client Connection Throttle'
                onChange={this.handleThrottleInputChange}
                placeholder='0'
                value={defaultTo(0, fields.client_conn_throttle)}
              />
            </div>
          <ActionsPanel
            className={classes.expPanelButton}
          >
            <Button
              onClick={this.updateNodeBalancer}
              type="primary"
              disabled={isSubmitting}
              data-qa-label-save
            >
              Save
          </Button>
          </ActionsPanel>
        </Paper>
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
