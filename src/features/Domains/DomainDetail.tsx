import { pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import styled, { StyleProps } from 'src/containers/SummaryPanels.styles';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getDomainRecords } from 'src/services/domains';
import { getAllWithArguments } from 'src/utilities/getAll';

import Loading from 'src/components/LandingLoading';
import domainsContainer, {
  DomainActionsProps,
  StateProps
} from 'src/containers/domains.container';

import DomainRecords from './DomainRecordsWrapper';

type RouteProps = RouteComponentProps<{ domainId?: string }>;

type ClassNames = 'error';

const styles = (theme: Theme) =>
  createStyles({
    error: {
      marginTop: `${theme.spacing(3)}px !important`,
      marginBottom: `0 !important`
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
    match: {
      params: { domainId }
    }
  } = props;

  const [records, updateRecords] = React.useState<Linode.DomainRecord[]>([]);
  React.useEffect(() => {
    refreshDomainRecords();
  }, []);

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
    getAllWithArguments<Linode.DomainRecord>(getDomainRecords)([+domainId!])
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
  if (domainsError) {
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
          <Breadcrumb location={location} labelTitle={domain.domain} />
        </Grid>
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
  domain?: Linode.Domain;
}

export default compose<CombinedProps, {}>(
  reloaded,
  domainsContainer<DomainProps, RouteComponentProps<{ domainId?: string }>>(
    (ownProps, domainsLoading, domains, domainsError) => ({
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
  localStyles,
  styled
)(DomainDetail);
