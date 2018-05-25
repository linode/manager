import * as React from 'react';
import { compose, clamp, defaultTo, map, path, pathOr } from 'ramda';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { StickyContainer, Sticky, StickyProps } from 'react-sticky';

import { withStyles, WithStyles, Theme, StyleRules } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import InputAdornment from 'material-ui/Input/InputAdornment';

import { createNodeBalancer } from 'src/services/nodebalancers';
import { dcDisplayNames } from 'src/constants';
import Grid from 'src/components/Grid';
import PromiseLoader from 'src/components/PromiseLoader';
import CheckoutBar from 'src/components/CheckoutBar';
import LabelAndTagsPanel from 'src/components/LabelAndTagsPanel';
import SelectRegionPanel, { ExtendedRegion } from 'src/components/SelectRegionPanel';
import ClientConnectionThrottlePanel from './ClientConnectionThrottlePanel';
import defaultNumeric from 'src/utilities/defaultNumeric';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import Notice from 'src/components/Notice';

type Styles =
  'root'
  | 'main'
  | 'sidebar';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
  },
  main: {
  },
  sidebar: {
  },
});

interface Props {
}

interface ConnectedProps {
  regions: ExtendedRegion[];
}

interface PreloadedProps { }

type CombinedProps = Props
  & ConnectedProps
  & RouteComponentProps<{}>
  & WithStyles<Styles>
  & PreloadedProps;

interface FieldsState {
  label?: string;
  region?: string;
  clientConnThrottle?: number;
}

interface State {
  submitting: boolean;
  fields: FieldsState;
  errors?: Linode.ApiFieldError[];
}

const preloaded = PromiseLoader<Props>({});

const errorResources = {
  label: 'label',
  region: 'region',
  client_conn_throttle: 'client connection throttle',
};

class NodeBalancerCreate extends React.Component<CombinedProps, State> {
  static defaultFieldsStates = {};

  state: State = {
    submitting: false,
    fields: NodeBalancerCreate.defaultFieldsStates,
  };

  mounted: boolean = false;

  createNodeBalancer = () => {
    const { fields } = this.state;
    const { history } = this.props;

    /** Clear Errors */
    this.setState({ errors: undefined });

    /** Validation */
    if (!fields.region) {
      return this.setState({ errors: [{ field: 'region', reason: 'A region is required.' }] });
    }

    /** Set requesting state. */
    this.setState({ submitting: true });

    /** Send request. */
    createNodeBalancer({
      ...fields,
      client_conn_throttle: fields.clientConnThrottle,
    })
      .then((response) => {
        history.push('/nodebalancers');
      })
      .catch((errorResponse) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], errorResponse);

        if (errors) {
          return this.setState({ errors, submitting: false });
        }

        return this.setState({
          submitting: false,
          errors: [
            { field: 'none', reason: `An unexpected error has occured..` }],
        });
      });
  }

  render() {
    const { classes, regions } = this.props;
    const { fields } = this.state;
    const hasErrorFor = getAPIErrorFor(errorResources, this.state.errors);
    const generalError = hasErrorFor('none');

    return (
      <StickyContainer>
        <Grid container>
          <Grid item className={`${classes.main} mlMain`}>
            <Typography variant="headline">
              Create a NodeBalancer
            </Typography>

            { generalError && <Notice error>{generalError}</Notice> }

            <LabelAndTagsPanel
              labelFieldProps={{
                label: 'NodeBalancer Label',
                value: fields.label || '',
                errorText: hasErrorFor('label'),
                onChange: e => this.setState({
                  fields: {
                    ...fields,
                    label: e.target.value,
                  },
                }),
              }}
            />
            <SelectRegionPanel
              regions={regions}
              error={hasErrorFor('region')}
              selectedID={fields.region || null}
              handleSelection={region => this.setState({
                fields: {
                  ...fields,
                  region,
                },
              })}
            />
            <ClientConnectionThrottlePanel
              textFieldProps={{
                InputProps: {
                  endAdornment: <InputAdornment position="end">/ second</InputAdornment>,
                },
                errorText: hasErrorFor('client_conn_throttle'),
                value: defaultTo(0, fields.clientConnThrottle),
                onChange: e => this.setState({
                  fields: {
                    ...fields,
                    clientConnThrottle: controlClientConnectionThrottle(e.target.value),
                  },
                }),
              }}
            />
          </Grid>
          <Grid item className={`${classes.sidebar} mlSidebar`}>
            <Sticky topOffset={-24} disableCompensation>
              {
                (props: StickyProps) => {
                  const { region } = this.state.fields;
                  const { regions } = this.props;
                  let displaySections;
                  if (region) {
                    const foundRegion = regions.find(r => r.id === region);
                    if (foundRegion) {
                      displaySections = { title: foundRegion.display };
                    } else {
                      displaySections = { title: 'Unknown Region' };
                    }
                  }
                  return (
                    <CheckoutBar
                      heading={`${this.state.fields.label || 'NodeBalancer'} Summary`}
                      onDeploy={() => this.createNodeBalancer()}
                      calculatedPrice={20}
                      displaySections={displaySections && [displaySections]}
                      disabled={this.state.submitting}
                    />
                  );
                }
              }
            </Sticky>
          </Grid>
        </Grid>
      </StickyContainer>
    );
  }
}
const controlClientConnectionThrottle = compose(
  clamp(0, 20),
  defaultNumeric(0),
);

const connected = connect((state: Linode.AppState) => ({
  regions: compose(
    map((region: Linode.Region) => ({
      ...region,
      display: dcDisplayNames[region.id],
    })),
    pathOr([], ['resources', 'regions', 'data', 'data']),
  )(state),
}));

const styled = withStyles(styles, { withTheme: true });

export default compose(
  connected,
  preloaded,
  styled,
  withRouter,
)(NodeBalancerCreate);
