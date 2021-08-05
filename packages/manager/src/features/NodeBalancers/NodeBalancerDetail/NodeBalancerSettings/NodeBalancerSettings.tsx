import { APIError } from '@linode/api-v4/lib/types';
import { clamp, compose, defaultTo } from 'ramda';
import * as React from 'react';
import { compose as composeC } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import InputAdornment from 'src/components/core/InputAdornment';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions,
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import defaultNumeric from 'src/utilities/defaultNumeric';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

const useStyles = makeStyles((theme: Theme) => ({
  inner: {
    paddingBottom: theme.spacing(2),
    '& label': {
      marginTop: 4,
    },
  },
}));

interface Props {
  nodeBalancerId: number;
  nodeBalancerLabel: string;
  nodeBalancerClientConnThrottle: number;
}

interface FieldsState {
  client_conn_throttle?: number;
  label?: string;
}

type CombinedProps = Props & WithNodeBalancerActions;

const errorResources = {
  client_conn_throttle: 'client connection throttle',
  label: 'label',
};

export const NodeBalancerSettings: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    nodeBalancerId,
    nodeBalancerLabel,
    nodeBalancerActions: { updateNodeBalancer },
  } = props;

  const defaultFieldsStates = {
    client_conn_throttle: props.nodeBalancerClientConnThrottle,
    label: props.nodeBalancerLabel,
  };

  const [fields, setFields] = React.useState<FieldsState>(defaultFieldsStates);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const hasErrorFor = getAPIErrorFor(errorResources, errors);
  const generalError = hasErrorFor('none');

  const handleLabelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields({ ...fields, label: e.target.value });
  };

  const handleThrottleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFields({
      ...fields,
      client_conn_throttle: controlClientConnectionThrottle(e.target.value),
    });
  };

  const onSubmitUpdateNodeBalancer = () => {
    setIsSubmitting(true);
    setSuccess(undefined);
    setErrors(undefined);

    updateNodeBalancer({ nodeBalancerId, ...fields })
      .then(() => {
        setIsSubmitting(false);
        setSuccess('NodeBalancer settings updated successfully');
      })
      .catch((error) => {
        setIsSubmitting(false);
        setErrors(getAPIErrorOrDefault(error));
        scrollErrorIntoView();
      });
  };

  return (
    <div>
      <DocumentTitleSegment segment={`${nodeBalancerLabel} - Settings`} />
      <Paper>
        <Grid item xs={12}>
          {generalError ? <Notice error text={generalError} /> : null}
          {success ? <Notice success text={success} /> : null}
        </Grid>
        <div className={classes.inner}>
          <TextField
            label="Label"
            placeholder="Enter a label between 3 and 32 characters"
            errorText={hasErrorFor('label')}
            onChange={handleLabelInputChange}
            value={fields.label}
            data-qa-label-panel
          />
          <FormHelperText>Rename your NodeBalancer</FormHelperText>
        </div>
        <div className={classes.inner}>
          <TextField
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">/ second</InputAdornment>
              ),
            }}
            label="Client Connection Throttle"
            errorText={hasErrorFor('client_conn_throttle')}
            onChange={handleThrottleInputChange}
            placeholder="0"
            value={defaultTo(0, fields.client_conn_throttle)}
            data-qa-connection-throttle
          />
          <FormHelperText>
            To help mitigate abuse, throttle connections from a single client IP
            to this number per second. 0 to disable.
          </FormHelperText>
        </div>
        <ActionsPanel className="p0">
          <Button
            buttonType="primary"
            disabled={isSubmitting}
            onClick={onSubmitUpdateNodeBalancer}
            data-qa-label-save
          >
            Save Changes
          </Button>
        </ActionsPanel>
      </Paper>
    </div>
  );
};

const controlClientConnectionThrottle = compose(clamp(0, 20), (value: string) =>
  defaultNumeric(0, value)
);

const enhanced = composeC<CombinedProps, Props>(withNodeBalancerActions);

export default enhanced(NodeBalancerSettings);
