import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { CircleProgress } from 'src/components/CircleProgress';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import summaryPanelStyles from 'src/containers/SummaryPanels.styles';
import LandingHeader from 'src/components/LandingHeader';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';
import DomainRecords from '../DomainRecords';
import DeleteDomain from '../DeleteDomain';
import { DownloadDNSZoneFileButton } from '../DownloadDNSZoneFileButton';
import {
  useDomainQuery,
  useDomainRecordsQuery,
  useUpdateDomainMutation,
} from 'src/queries/domains';

const useStyles = makeStyles((theme: Theme) => ({
  ...summaryPanelStyles(theme),
  delete: {
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
    },
  },
  error: {
    marginBottom: `0 !important`,
    marginTop: `${theme.spacing(3)} !important`,
  },
  main: {
    '&.MuiGrid-item': {
      padding: 0,
    },
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  root: {
    marginBottom: theme.spacing(3),
    marginLeft: 0,
    marginRight: 0,
  },
  tagsSection: {
    '&.MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(2),
      order: 2,
    },
  },
}));

export const DomainDetail = () => {
  const classes = useStyles();
  const params = useParams<{ domainId: string }>();
  const domainId = Number(params.domainId);

  const history = useHistory();
  const location = useLocation<{ recordError?: string }>();

  const { data: domain, error, isLoading } = useDomainQuery(domainId);
  const { mutateAsync: updateDomain } = useUpdateDomainMutation();
  const {
    data: records,
    error: recordsError,
    isLoading: isRecordsLoading,
    refetch: refetchRecords,
  } = useDomainRecordsQuery(domainId);

  const [updateError, setUpdateError] = React.useState<string | undefined>();

  const handleLabelChange = (label: string) => {
    setUpdateError(undefined);

    if (!domain) {
      return Promise.reject('No Domain found.');
    }

    return updateDomain({ domain: label, id: domain.id }).catch((e) => {
      setUpdateError(e[0].reason);
      return Promise.reject(e);
    });
  };

  const resetEditableLabel = () => {
    setUpdateError(undefined);
    return domain?.domain;
  };

  const handleUpdateTags = (tagsList: string[]) => {
    return updateDomain({
      id: domainId,
      tags: tagsList,
    });
  };

  if (isLoading || isRecordsLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your Domain." />
    );
  }

  if (recordsError) {
    return (
      <ErrorState errorText="There was an error retrieving your Domain's Records." />
    );
  }

  if (domain === undefined || records === undefined) {
    return null;
  }

  return (
    <>
      <LandingHeader
        title="Domain Details"
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/dns-manager/"
        breadcrumbProps={{
          labelOptions: { noCap: true },
          onEditHandlers: {
            editableTextTitle: domain.domain,
            errorText: updateError,
            onCancel: resetEditableLabel,
            onEdit: handleLabelChange,
          },
          pathname: location.pathname,
        }}
        extraActions={
          <DownloadDNSZoneFileButton
            domainId={domain.id}
            domainLabel={domain.domain}
          />
        }
      />
      {location.state && location.state.recordError && (
        <Notice
          className={classes.error}
          error
          text={location.state.recordError}
        />
      )}
      <Grid container className={classes.root}>
        <Grid xs={12} className={classes.main}>
          <DomainRecords
            domain={domain}
            updateDomain={updateDomain}
            domainRecords={records}
            updateRecords={refetchRecords}
          />
        </Grid>
        <Grid xs={12} className={classes.tagsSection}>
          <Paper className={classes.summarySection}>
            <Typography variant="h3" className={classes.title} data-qa-title>
              Tags
            </Typography>
            <TagsPanel tags={domain.tags} updateTags={handleUpdateTags} />
          </Paper>
          <div className={classes.delete}>
            <DeleteDomain
              domainId={domain.id}
              domainLabel={domain.domain}
              onSuccess={() => history.push('/domains')}
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default DomainDetail;
