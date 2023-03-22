import { DomainRecord, getDomainRecords } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import ErrorState from 'src/components/ErrorState';
import Notice from 'src/components/Notice';
import summaryPanelStyles from 'src/containers/SummaryPanels.styles';
import { useDomainQuery, useUpdateDomainMutation } from 'src/queries/domains';
import { getAll } from 'src/utilities/getAll';
import DomainRecords from '../DomainRecordsWrapper';
import LandingHeader from 'src/components/LandingHeader';

const getAllDomainRecords = (domainId: number) =>
  getAll<DomainRecord>((params) => getDomainRecords(domainId, params))().then(
    ({ data }) => data
  );

const useStyles = makeStyles((theme: Theme) => ({
  ...summaryPanelStyles(theme),
  error: {
    marginTop: `${theme.spacing(3)} !important`,
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
    getAllDomainRecords(domainId)
      .then((records) => {
        updateRecords(records);
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
      <LandingHeader
        title="Domain Details"
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/dns-manager/"
        breadcrumbProps={{
          pathname: location.pathname,
          labelOptions: { noCap: true },
          onEditHandlers: {
            editableTextTitle: domain.domain,
            onEdit: handleLabelChange,
            onCancel: resetEditableLabel,
            errorText: updateError,
          },
        }}
      />
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
