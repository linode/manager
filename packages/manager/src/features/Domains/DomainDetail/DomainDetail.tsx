import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { CircleProgress } from 'src/components/CircleProgress';
import { styled } from '@mui/material/styles';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { LandingHeader } from 'src/components/LandingHeader';
import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from 'src/components/Typography';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';
import DomainRecords from '../DomainRecords';
import { DeleteDomain } from '../DeleteDomain';
import { DownloadDNSZoneFileButton } from '../DownloadDNSZoneFileButton';
import { Paper } from 'src/components/Paper';
import {
  useDomainQuery,
  useDomainRecordsQuery,
  useUpdateDomainMutation,
} from 'src/queries/domains';

export const DomainDetail = () => {
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
          pathname: location.pathname,
          labelOptions: { noCap: true },
          onEditHandlers: {
            editableTextTitle: domain.domain,
            onEdit: handleLabelChange,
            onCancel: resetEditableLabel,
            errorText: updateError,
          },
        }}
        extraActions={
          <DownloadDNSZoneFileButton
            domainId={domain.id}
            domainLabel={domain.domain}
          />
        }
      />
      {location.state && location.state.recordError && (
        <StyledNotice error text={location.state.recordError} />
      )}
      <StyledRootGrid container>
        <StyledMainGrid xs={12}>
          <DomainRecords
            domain={domain}
            updateDomain={updateDomain}
            domainRecords={records}
            updateRecords={refetchRecords}
          />
        </StyledMainGrid>
        <StyledTagSectionGrid xs={12}>
          <StyledPaper>
            <StyledTypography variant="h3" data-qa-title>
              Tags
            </StyledTypography>
            <TagsPanel tags={domain.tags} updateTags={handleUpdateTags} />
          </StyledPaper>
          <StyledDiv>
            <DeleteDomain
              domainId={domain.id}
              domainLabel={domain.domain}
              onSuccess={() => history.push('/domains')}
            />
          </StyledDiv>
        </StyledTagSectionGrid>
      </StyledRootGrid>
    </>
  );
};

const StyledTypography = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    marginBottom: theme.spacing(2),
  })
);

const StyledPaper = styled(Paper, { label: 'StyledPaper' })(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  minHeight: '160px',
  height: '93%',
}));

const StyledNotice = styled(Notice, { label: 'StyledNotice' })(({ theme }) => ({
  marginTop: `${theme.spacing(3)} !important`,
  marginBottom: `0 !important`,
}));

const StyledRootGrid = styled(Grid, { label: 'StyledRootGrid' })(
  ({ theme }) => ({
    marginLeft: 0,
    marginRight: 0,
    marginBottom: theme.spacing(3),
  })
);

const StyledMainGrid = styled(Grid, { label: 'StyledMainGrid' })(
  ({ theme }) => ({
    '&.MuiGrid-item': {
      padding: 0,
    },
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  })
);

const StyledTagSectionGrid = styled(Grid, { label: 'StyledTagGrid' })(
  ({ theme }) => ({
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(2),
      order: 2,
    },
    '&.MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  })
);

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
  },
  display: 'flex',
  justifyContent: 'flex-end',
}));
