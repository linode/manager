import Edit from '@material-ui/icons/Edit';
import {
  Domain,
  DomainRecord,
  getDomainRecords
} from 'linode-js-sdk/lib/domains';
import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import summaryPanelStyles, {
  StyleProps
} from 'src/containers/SummaryPanels.styles';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getAllWithArguments } from 'src/utilities/getAll';

import Loading from 'src/components/LandingLoading';
import domainsContainer, {
  DomainActionsProps,
  StateProps
} from 'src/containers/domains.container';

import DomainRecords from './DomainRecordsWrapper';

type RouteProps = RouteComponentProps<{ domainId?: string }>;

type ClassNames = 'error' | 'tagsButton' | 'editIcon';

const styles = (theme: Theme) =>
  createStyles({
    ...summaryPanelStyles(theme),
    error: {
      marginTop: `${theme.spacing(3)}px !important`,
      marginBottom: `0 !important`
    },
    tagsButton: {
      padding: `${theme.spacing(0.5)}px ${theme.spacing(2)}px`,
      height: 34,
      minWidth: 80,
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1)
    },
    editIcon: {
      width: 20,
      height: 20,
      marginRight: theme.spacing(0.5)
    }
  });

type CombinedProps = RouteProps &
  StyleProps &
  DomainActionsProps &
  DomainProps &
  WithStyles<ClassNames>;

const DomainDetail: React.FC<CombinedProps> = props => {
  const {
    classes,
    domain,
    domainsLoading,
    domainsError,
    location,
    match: {
      params: { domainId }
    }
  } = props;

  const [records, updateRecords] = React.useState<DomainRecord[]>([]);
  React.useEffect(() => {
    refreshDomainRecords();
  }, []);

  const tagSection = document.getElementById('domains-tag-section');
  const scrollToTags = () => {
    return tagSection && tagSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateTags = (tagsList: string[]) => {
    if (!domainId) {
      return Promise.reject('No Domain ID specified.');
    }
    return props.updateDomain({
      domainId: +domainId,
      tags: tagsList
    });
  };

  const refreshDomainRecords = () => {
    getAllWithArguments<DomainRecord>(getDomainRecords)([+domainId!])
      .then(({ data }) => {
        updateRecords(data);
      })
      /** silently fail if DNS records couldn't be updated. No harm here */
      .catch(() => null);
  };

  if (domainsLoading) {
    return <Loading shouldDelay />;
  }

  /** Error State */
  if (domainsError.read) {
    return (
      <ErrorState errorText="There was an error retrieving your domain. Please reload and try again." />
    );
  }

  /** Empty State */
  if (!domain) {
    return null;
  }

  return (
    <React.Fragment>
      <Grid container justify="space-between">
        <Grid item>
          <Breadcrumb
            pathname={location.pathname}
            labelTitle={domain.domain}
            labelOptions={{ noCap: true }}
          />
        </Grid>
        <Button
          buttonType="secondary"
          onClick={() => scrollToTags()}
          className={classes.tagsButton}
          aria-label={`Manage tags for "${domain.domain}"`}
        >
          <Edit className={classes.editIcon} /> Tags
        </Button>
      </Grid>
      {props.location.state && props.location.state.recordError && (
        <Notice
          className={classes.error}
          error
          text={props.location.state.recordError}
        />
      )}
      <DomainRecords
        handleUpdateTags={handleUpdateTags}
        updateRecords={refreshDomainRecords}
        records={records}
        domain={domain}
      />
    </React.Fragment>
  );
};

const localStyles = withStyles(styles);
const reloaded = reloadableWithRouter<{}, { domainId?: number }>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.domainId !==
      routePropsNew.match.params.domainId
    );
  }
);

interface DomainProps extends Omit<StateProps, 'domainsData'> {
  domain?: Domain;
}

export default compose<CombinedProps, RouteProps>(
  reloaded,
  domainsContainer<DomainProps, RouteComponentProps<{ domainId?: string }>>(
    (ownProps, domainsLoading, domainsError, domains) => ({
      domainsError,
      domainsLoading,
      domain: !domains
        ? undefined
        : domains.find(
            eachDomain =>
              eachDomain.id ===
              +pathOr(0, ['match', 'params', 'domainId'], ownProps)
          )
    })
  ),
  localStyles
)(DomainDetail);
