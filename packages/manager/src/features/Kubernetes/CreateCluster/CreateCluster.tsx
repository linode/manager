import {
  createKubernetesCluster,
  getKubernetesVersions,
  KubernetesVersion,
  PoolNodeRequest
} from 'linode-js-sdk/lib/kubernetes';
import { APIError } from 'linode-js-sdk/lib/types';
import { pick, remove, update } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { StickyContainer } from 'react-sticky';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
// import Box from 'src/components/core/Box';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import DocumentationButton from 'src/components/DocumentationButton';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import RegionSelect from 'src/components/EnhancedSelect/variants/RegionSelect';
import ErrorState from 'src/components/ErrorState';
// import H1Header from 'src/components/H1Header';
// import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withTypes, { WithTypesProps } from 'src/containers/types.container';
import { WithRegionsProps } from 'src/features/linodes/LinodesCreate/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import KubeCheckoutBar from '.././KubeCheckoutBar';
import { getMonthlyPrice } from '.././kubeUtils';
import { PoolNodeWithPrice } from '.././types';
// import NodePoolPanel from './NodePoolPanel';

type ClassNames =
  | 'root'
  | 'title'
  | 'main'
  | 'sidebar'
  | 'inner'
  | 'inputWidth'
  | 'regionSubtitle';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(3)
    },
    main: {
      maxWidth: '890px !important'
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        // marginTop: '45px !important'
      }
    },
    inner: {
      padding: theme.spacing(3),
      paddingTop: theme.spacing(2),
      '& > div': {
        marginBottom: theme.spacing(2)
      },
      '& label': {
        color: theme.color.headline,
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '1.33rem',
        letterSpacing: '0.25px',
        margin: 0
      }
    },
    inputWidth: {
      maxWidth: 440,
      '& .react-select__menu': {
        maxWidth: 440
      }
    },
    regionSubtitle: {
      '& p': {
        fontWeight: 500,
        lineHeight: '1.43rem',
        margin: 0,
        marginBottom: 4,
        maxWidth: '100%'
      },
      '& .MuiInput-root': {
        maxWidth: 440
      },
      '& .react-select__menu': {
        maxWidth: 440
      }
    }
  });

interface State {
  selectedRegion?: string;
  selectedType?: string;
  numberOfLinodes: number;
  nodePools: PoolNodeWithPrice[];
  label?: string;
  version?: Item<string>;
  errors?: APIError[];
  submitting: boolean;
  versionOptions: Item<string>[];
}

type CombinedProps = RouteComponentProps<{}> &
  WithStyles<ClassNames> &
  WithRegionsProps &
  WithTypesProps;

/**
 * It's very unlikely there will ever be more than one page of
 * active/available K8s versions. API paginates the response
 * though to match convention, so to be safe we're following
 * our own convention.
 */
const getAllVersions = getAll<KubernetesVersion>(getKubernetesVersions);

const regionHelperText = (
  <React.Fragment>
    You can use
    {` `}
    <a
      target="_blank"
      aria-describedby="external-site"
      rel="noopener noreferrer"
      href="https://www.linode.com/speedtest"
      style={{ fontWeight: 600 }}
    >
      our speedtest page
    </a>
    {` `}
    to find the best region for your current location.
  </React.Fragment>
);

export class CreateCluster extends React.Component<CombinedProps, State> {
  state: State = {
    selectedRegion: undefined,
    selectedType: undefined,
    numberOfLinodes: 3,
    nodePools: [],
    label: undefined,
    version: undefined,
    errors: undefined,
    submitting: false,
    versionOptions: []
  };

  componentDidMount() {
    getAllVersions()
      .then(response => {
        /**
         * 1. Convert versions to Items
         * 2. Sort descending (so newest version is at top)
         * // 3. Pre-select the newest version <--- do this someday, but not now
         */
        const versionOptions = response.data
          .map(eachVersion => ({
            value: eachVersion.id,
            label: eachVersion.id
          }))
          .sort(sortByLabelDescending);
        this.setState({
          versionOptions
          // version: versionOptions[0]
        });
      })
      .catch(error => {
        this.setState({
          errors: getAPIErrorOrDefault(
            error,
            'Unable to load Kubernetes versions.',
            'versionLoad'
          )
        });
      });
  }

  createCluster = () => {
    const { selectedRegion, nodePools, label, version } = this.state;
    const {
      history: { push }
    } = this.props;

    this.setState({
      errors: undefined,
      submitting: true
    });

    const _version = version ? version.value : undefined;

    /**
     * We need to remove the monthly price, which is used for client-side
     * calculations, and send only type and count to the API.
     */
    const node_pools = nodePools.map(
      pick(['type', 'count'])
    ) as PoolNodeRequest[];
    const payload = {
      region: selectedRegion,
      node_pools,
      label,
      version: _version
    };

    createKubernetesCluster(payload)
      .then(cluster => push(`/kubernetes/clusters/${cluster.id}`))
      .catch(err =>
        this.setState(
          {
            errors: getAPIErrorOrDefault(err, 'Error creating your cluster'),
            submitting: false
          },
          scrollErrorIntoView
        )
      );
  };

  addPool = (pool: PoolNodeWithPrice) => {
    const { nodePools } = this.state;
    this.setState({
      nodePools: [...nodePools, pool]
    });
  };

  updatePool = (poolIdx: number, updatedPool: PoolNodeWithPrice) => {
    const { nodePools } = this.state;
    const updatedPoolWithPrice = {
      ...updatedPool,
      totalMonthlyPrice: getMonthlyPrice(
        updatedPool.type,
        updatedPool.count,
        this.props.typesData || []
      )
    };
    this.setState({
      nodePools: update(poolIdx, updatedPoolWithPrice, nodePools)
    });
  };

  removePool = (poolIdx: number) => {
    const { nodePools } = this.state;
    const updatedPools = remove(poolIdx, 1, nodePools);
    this.setState({
      nodePools: updatedPools
    });
  };

  updateLabel = (newLabel: string) => {
    /**
     * If the new label is an empty string, use undefined.
     * This allows it to pass Yup validation.
     */
    this.setState({ label: newLabel ? newLabel : undefined });
  };

  render() {
    const {
      classes,
      regionsData,
      typesData,
      // typesLoading,
      typesError,
      regionsError
    } = this.props;

    const {
      errors,
      label,
      selectedRegion,
      // selectedType,
      // numberOfLinodes,
      nodePools,
      submitting,
      version,
      versionOptions
    } = this.state;

    const errorMap = getErrorMap(
      ['region', 'node_pools', 'label', 'version', 'versionLoad'],
      errors
    );

    // Only displaying regions that have LKE capability
    const filteredRegions = regionsData
      ? regionsData.filter(thisRegion =>
          thisRegion.capabilities.includes('Kubernetes')
        )
      : [];

    const _region = filteredRegions.find(
      thisRegion => thisRegion.id === selectedRegion
    );

    const regionDisplay = _region ? _region.display : undefined;

    if (typesError || regionsError || errorMap.versionLoad) {
      /**
       * This information is necessary to create a Cluster.
       * Otherwise, show an error state.
       */

      return <ErrorState errorText={'An unexpected error occurred.'} />;
    }

    return (
      <StickyContainer>
        <Grid container>
          <DocumentTitleSegment segment="Create a Kubernetes Cluster" />
          <Grid
            container
            justify="space-between"
            alignItems="flex-end"
            className={classes.title}
          >
            <Grid item>
              <Breadcrumb
                pathname={location.pathname}
                labelTitle="Create a Cluster"
                labelOptions={{ noCap: true }}
              />
            </Grid>
            <Grid item>
              <Grid container alignItems="flex-end">
                <Grid item className="pt0">
                  <DocumentationButton href="https://www.linode.com/docs/platform" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item className={`mlMain py0`}>
            <div className={classes.main}>
              <Paper data-qa-label-header>
                <div className={classes.inner}>
                  <Grid item>
                    <TextField
                      className={classes.inputWidth}
                      data-qa-label-input
                      errorText={errorMap.label}
                      label="Cluster Label"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        this.updateLabel(e.target.value)
                      }
                      value={label || ''}
                    />
                  </Grid>
                  <Grid item>
                    <RegionSelect
                      label={'Region'}
                      placeholder={' '}
                      className={classes.regionSubtitle}
                      // error={errorMap.region}
                      handleSelection={(regionID: string) =>
                        this.setState({ selectedRegion: regionID })
                      }
                      regions={filteredRegions}
                      selectedID={selectedRegion || null}
                      textFieldProps={{
                        helperText: regionHelperText,
                        helperTextPosition: 'top'
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Select
                      className={classes.inputWidth}
                      label="Kubernetes Version"
                      value={version || null}
                      errorText={errorMap.version}
                      options={versionOptions}
                      placeholder={' '}
                      onChange={(selected: Item<string>) =>
                        this.setState({ version: selected })
                      }
                      isClearable={false}
                    />
                  </Grid>
                </div>
              </Paper>
            </div>
          </Grid>
          <Grid item className={`${classes.sidebar} mlSidebar`}>
            <KubeCheckoutBar
              label={label || ''}
              region={regionDisplay}
              pools={nodePools}
              createCluster={this.createCluster}
              submitting={submitting}
              typesData={typesData || []}
              updateFor={[
                label,
                selectedRegion,
                nodePools,
                submitting,
                typesData,
                classes
              ]}
            />
          </Grid>
        </Grid>
      </StickyContainer>
    );
  }
}

const sortByLabelDescending = (a: Item, b: Item) => {
  if (a.value > b.value) {
    return -1;
  } else if (a.value < b.value) {
    return 1;
  }
  return 0;
};

const styled = withStyles(styles);

const withRegions = regionsContainer(({ data, loading, error }) => ({
  regionsData: data.map(r => ({ ...r, display: dcDisplayNames[r.id] })), // @todo DRY this up
  regionsLoading: loading,
  regionsError: error
}));

const enhanced = compose<CombinedProps, {}>(
  styled,
  withRouter,
  withRegions,
  withTypes
);

export default enhanced(CreateCluster);
