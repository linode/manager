import { DomainRecord, getDomainRecords } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocsLink from 'src/components/DocsLink';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import summaryPanelStyles from 'src/containers/SummaryPanels.styles';
import { useDomainQuery, useUpdateDomainMutation } from 'src/queries/domains';
import { getAllWithArguments } from 'src/utilities/getAll';
import DomainRecords from '../DomainRecordsWrapper';

const useStyles = makeStyles((theme: Theme) => ({
  ...summaryPanelStyles(theme),
  root: {
    margin: 0,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: theme.spacing(),
    },
    [theme.breakpoints.down('sm')]: {
      paddingRight: theme.spacing(),
    },
  },
  error: {
    marginTop: `${theme.spacing(3)}px !important`,
    marginBottom: `0 !important`,
  },
}));

const DomainDetail = () => {
  const classes = useStyles();
  const params = useParams<{ domainId: string }>();
  const domainId = Number(params.domainId);

  const location = useLocation<any>();

  const { data: domain, error, isLoading } = useDomainQuery(domainId);
  const { mutateAsync: updateDomain } = useUpdateDomainMutation();

  const [records, updateRecords] = React.useState<DomainRecord[]>([]);
  const [updateError, setUpdateError] = React.useState<string | undefined>();

  React.useEffect(() => {
    refreshDomainRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLabelChange = (label: string) => {
    setUpdateError(undefined);

    if (!domain) {
      return Promise.reject('No Domain found.');
    }

    return updateDomain({ id: domain.id, domain: label }).catch((e) => {
      setUpdateError(e[0].reason);
      return Promise.reject(e);
    });
  };

  const resetEditableLabel = () => {
    setUpdateError(undefined);
    return domain?.domain;
  };

  const handleUpdateTags = (tagsList: string[]) => {
    if (!domainId) {
      return Promise.reject('No Domain ID specified.');
    }
    return updateDomain({
      id: +domainId,
      tags: tagsList,
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

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your Domain. Please reload and try again." />
    );
  }

  if (!domain) {
    return null;
  }

  return (
    <>
      <Grid
        container
        className={`${classes.root} m0`}
        justifyContent="space-between"
      >
        <Grid item className="p0">
          <Breadcrumb
            pathname={location.pathname}
            labelOptions={{ noCap: true }}
            onEditHandlers={{
              editableTextTitle: domain.domain,
              onEdit: handleLabelChange,
              onCancel: resetEditableLabel,
              errorText: updateError,
            }}
          />
        </Grid>
        <Grid item className="p0" style={{ marginTop: 14 }}>
          <DocsLink href="https://www.linode.com/docs/guides/dns-manager/" />
        </Grid>
      </Grid>
      {location.state && location.state.recordError && (
        <Notice
          className={classes.error}
          error
          text={location.state.recordError}
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

export default DomainDetail;
