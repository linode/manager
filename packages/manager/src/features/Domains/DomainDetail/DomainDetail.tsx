import Edit from '@material-ui/icons/Edit';
import { DomainRecord, getDomainRecords } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import summaryPanelStyles, {
  StyleProps
} from 'src/containers/SummaryPanels.styles';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import useDomains from 'src/hooks/useDomains';
import { getAllWithArguments } from 'src/utilities/getAll';

import Loading from 'src/components/LandingLoading';

import DomainRecords from '../DomainRecordsWrapper';

type RouteProps = RouteComponentProps<{ domainId?: string }>;

const useStyles = makeStyles((theme: Theme) => ({
  ...summaryPanelStyles(theme),
  error: {
    marginTop: `${theme.spacing(3)}px !important`,
    marginBottom: `0 !important`
  },
  cta: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing()
  },
  tagsButton: {
    height: 34,
    marginLeft: 0,
    marginRight: theme.spacing(3),
    minWidth: 'auto',
    padding: 0,
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  editIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing()
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

  const tagSection = document.getElementById('domains-tag-section');
  const scrollToTags = () => {
    return tagSection && tagSection.scrollIntoView({ behavior: 'smooth' });
  };

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
    <React.Fragment>
      <Grid
        container
        className="m0"
        alignItems="center"
        justify="space-between"
      >
        <Grid item className="px0">
          <Breadcrumb
            pathname={location.pathname}
            labelTitle={domain.domain}
            labelOptions={{ noCap: true }}
          />
        </Grid>
        <Grid item className={`${classes.cta}`}>
          <Button
            buttonType="secondary"
            className={classes.tagsButton}
            onClick={() => scrollToTags()}
            aria-label={`Manage tags for "${domain.domain}"`}
          >
            <Edit className={classes.editIcon} /> Tags
          </Button>
          <DocumentationButton href="https://www.linode.com/docs/guides/dns-manager/" />
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

const reloaded = reloadableWithRouter<{}, { domainId?: number }>(
  (routePropsOld, routePropsNew) => {
    return (
      routePropsOld.match.params.domainId !==
      routePropsNew.match.params.domainId
    );
  }
);

export default compose<CombinedProps, RouteProps>(reloaded)(DomainDetail);
