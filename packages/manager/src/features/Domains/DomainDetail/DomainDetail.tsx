import { DomainRecord, getDomainRecords } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Loading from 'src/components/LandingLoading';
import Notice from 'src/components/Notice';
import summaryPanelStyles, {
  StyleProps
} from 'src/containers/SummaryPanels.styles';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import useDomains from 'src/hooks/useDomains';
import { getAllWithArguments } from 'src/utilities/getAll';
import DomainRecords from '../DomainRecordsWrapper';

type RouteProps = RouteComponentProps<{ domainId?: string }>;

const useStyles = makeStyles((theme: Theme) => ({
  ...summaryPanelStyles(theme),
  root: {
    margin: 0,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing()
    },
    [theme.breakpoints.down('sm')]: {
      paddingRight: theme.spacing()
    }
  },
  error: {
    marginTop: `${theme.spacing(3)}px !important`,
    marginBottom: `0 !important`
  }
}));

type CombinedProps = RouteProps & StyleProps;

const DomainDetail: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    location,
    match: {
      params: { domainId }
    }
  } = props;

  const { domains, updateDomain } = useDomains();
  const domain = domains.itemsById[String(domainId)];
  const { loading: domainsLoading, error: domainsError } = domains;

  const [records, updateRecords] = React.useState<DomainRecord[]>([]);
  React.useEffect(() => {
    refreshDomainRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateTags = (tagsList: string[]) => {
    if (!domainId) {
      return Promise.reject('No Domain ID specified.');
    }
    return updateDomain({
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
      <ErrorState errorText="There was an error retrieving your Domain. Please reload and try again." />
    );
  }

  /** Empty State */
  if (!domain) {
    return null;
  }

  return (
    <>
      <Grid
        container
        className={classes.root}
        alignItems="center"
        justify="space-between"
      >
        <Breadcrumb
          pathname={location.pathname}
          labelTitle={domain.domain}
          labelOptions={{ noCap: true }}
        />
        <DocumentationButton href="https://www.linode.com/docs/guides/dns-manager/" />
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
    </>
  );
};

const reloaded = reloadableWithRouter<{}, { domainId?: number }>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.domainId !==
      routePropsNew.match.params.domainId
    );
  }
);

export default compose<CombinedProps, RouteProps>(reloaded)(DomainDetail);
