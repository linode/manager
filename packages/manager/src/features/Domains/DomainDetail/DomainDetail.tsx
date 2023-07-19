import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';
import summaryPanelStyles from 'src/containers/SummaryPanels.styles';
import {
  useDomainQuery,
  useDomainRecordsQuery,
  useUpdateDomainMutation,
} from 'src/queries/domains';

import DeleteDomain from '../DeleteDomain';
import DomainRecords from '../DomainRecords';
import { DownloadDNSZoneFileButton } from '../DownloadDNSZoneFileButton';

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
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/dns-manager/"
        title="Domain Details"
      />
      {location.state && location.state.recordError && (
        <Notice
          className={classes.error}
          error
          text={location.state.recordError}
        />
      )}
      <Grid className={classes.root} container>
        <Grid className={classes.main} xs={12}>
          <DomainRecords
            domain={domain}
            domainRecords={records}
            updateDomain={updateDomain}
            updateRecords={refetchRecords}
          />
        </Grid>
        <Grid className={classes.tagsSection} xs={12}>
          <Paper className={classes.summarySection}>
            <Typography className={classes.title} data-qa-title variant="h3">
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
