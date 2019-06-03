import { WithStyles } from '@material-ui/core/styles';
import { clamp, compose, defaultTo } from 'ramda';
import * as React from 'react';
import { compose as composeC } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import Paper from 'src/components/core/Paper';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import defaultNumeric from 'src/utilities/defaultNumeric';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title' | 'inner' | 'expPanelButton';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3)
    },
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    inner: {
      paddingBottom: theme.spacing(3)
    },
    expPanelButton: {
      padding: 0,
      marginTop: theme.spacing(2)
    }
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

type CombinedProps = Props & WithNodeBalancerActions & WithStyles<ClassNames>;

const errorResources = {
  client_conn_throttle: 'client connection throttle',
  label: 'label'
};

class NodeBalancerSettings extends React.Component<CombinedProps, State> {
  static defaultFieldsStates = (props: CombinedProps) => ({
    client_conn_throttle: props.nodeBalancerClientConnThrottle,
    label: props.nodeBalancerLabel
  });

  state: State = {
    errors: undefined,
    fields: NodeBalancerSettings.defaultFieldsStates(this.props),
    isSubmitting: false,
    success: undefined
  };

  handleLabelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { fields } = this.state;
    this.setState({
      fields: {
        ...fields,
        label: e.target.value
      }
    });
  };

  handleThrottleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { fields } = this.state;
    this.setState({
      fields: {
        ...fields,
        client_conn_throttle: controlClientConnectionThrottle(e.target.value)
      }
    });
  };

  onSubmitUpdateNodeBalancer = () => {
    const { label, client_conn_throttle } = this.state.fields;
    const {
      nodeBalancerActions: { updateNodeBalancer }
    } = this.props;

    this.setState({
      errors: undefined,
      isSubmitting: true,
      success: undefined
    });
    const data = { label, client_conn_throttle };
    updateNodeBalancer({ nodeBalancerId: this.props.nodeBalancerId, ...data })
      .then(() => {
        this.setState({
          isSubmitting: false,
          success: 'NodeBalancer settings updated successfully'
        });
      })
      .catch(error => {
        this.setState(
          { isSubmitting: false, errors: getAPIErrorOrDefault(error) },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  render() {
    const { fields, isSubmitting, success } = this.state;
    const { classes, nodeBalancerLabel } = this.props;
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${nodeBalancerLabel} - Settings`} />
        <Typography variant="h1" className={classes.title}>
          Settings
        </Typography>
        <Paper className={classes.root}>
          <Grid item xs={12}>
            {generalError && <Notice error text={generalError} />}
            {success && <Notice success text={success} />}
          </Grid>
          <div className={classes.inner}>
            <TextField
              data-qa-label-panel
              errorText={hasErrorFor('label')}
              label="Label"
              placeholder="Enter a label between 3 and 32 characters"
              onChange={this.handleLabelInputChange}
              value={fields.label}
            />
            <FormHelperText>Rename your NodeBalancer</FormHelperText>
          </div>
          <div className={classes.inner}>
            <TextField
              data-qa-connection-throttle
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">/ second</InputAdornment>
                )
              }}
              errorText={hasErrorFor('client_conn_throttle')}
              label="Client Connection Throttle"
              onChange={this.handleThrottleInputChange}
              placeholder="0"
              value={defaultTo(0, fields.client_conn_throttle)}
            />
            <FormHelperText>
              To help mitigate abuse, throttle connections from a single client
              IP to this number per second. 0 to disable.
            </FormHelperText>
          </div>
          <ActionsPanel className={classes.expPanelButton}>
            <Button
              onClick={this.onSubmitUpdateNodeBalancer}
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
  defaultNumeric(0)
);

const styled = withStyles(styles);

const enhanced = composeC<CombinedProps, Props>(
  styled,
  withNodeBalancerActions
);

export default enhanced(NodeBalancerSettings);
