import {
  CircleProgress,
  ErrorState,
  Notice,
  Paper,
  Typography,
} from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { TagCell } from 'src/components/TagCell/TagCell';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import {
  useDomainQuery,
  useDomainRecordsQuery,
  useUpdateDomainMutation,
} from 'src/queries/domains';

import { DeleteDomain } from '../DeleteDomain';
import { DownloadDNSZoneFileButton } from '../DownloadDNSZoneFileButton';
import { DomainRecords } from './DomainRecords/DomainRecords';

import type { DomainState } from 'src/routes/domains';

export const DomainDetail = () => {
  const navigate = useNavigate();
  const params = useParams({ from: '/domains/$domainId' });
  const domainId = params.domainId;
  const location = useLocation();
  const locationState = location.state as DomainState;
  const { data: domain, error, isLoading } = useDomainQuery(
    domainId,
    !!domainId
  );
  const { mutateAsync: updateDomain } = useUpdateDomainMutation();
  const {
    data: records,
    error: recordsError,
    isLoading: isRecordsLoading,
    refetch: refetchRecords,
  } = useDomainRecordsQuery(domainId);

  const isDomainReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'domain',
    id: domainId,
  });

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
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/dns-manager"
        title="Domain Details"
      />
      {locationState?.recordError && (
        <StyledNotice text={locationState.recordError} variant="error" />
      )}
      <StyledRootGrid container>
        <StyledMainGrid size={{ xs: 12 }}>
          <DomainRecords
            domain={domain}
            domainRecords={records}
            updateDomain={updateDomain}
            updateRecords={refetchRecords}
          />
        </StyledMainGrid>
        <StyledTagSectionGrid size={{ xs: 12 }}>
          <StyledPaper>
            <StyledTypography data-qa-title variant="h3">
              Tags
            </StyledTypography>
            <TagCell
              disabled={isDomainReadOnly}
              tags={domain.tags}
              updateTags={handleUpdateTags}
              view="panel"
            />
          </StyledPaper>
          <StyledDiv>
            <DeleteDomain
              domainId={domain.id}
              domainLabel={domain.domain}
              onSuccess={() => navigate({ to: '/domains' })}
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
  height: '93%',
  marginBottom: theme.spacing(2),
  minHeight: '160px',
  padding: theme.spacing(2.5),
}));

const StyledNotice = styled(Notice, { label: 'StyledNotice' })(({ theme }) => ({
  marginBottom: `0 !important`,
  marginTop: `${theme.spacing(3)} !important`,
}));

const StyledRootGrid = styled(Grid, { label: 'StyledRootGrid' })(
  ({ theme }) => ({
    marginBottom: theme.spacing(3),
    marginLeft: 0,
    marginRight: 0,
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
    '&.MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(2),
      order: 2,
    },
  })
);

const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
  },
}));
