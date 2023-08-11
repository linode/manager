import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';
import { Typography } from 'src/components/Typography';
import {
  useDomainQuery,
  useDomainRecordsQuery,
  useUpdateDomainMutation,
} from 'src/queries/domains';

import { DeleteDomain } from '../DeleteDomain';
import DomainRecords from '../DomainRecords';
import { DownloadDNSZoneFileButton } from '../DownloadDNSZoneFileButton';

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
      <ProductInformationBanner bannerLocation="Domains" important warning />
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
        <StyledNotice error text={location.state.recordError} />
      )}
      <StyledRootGrid container>
        <StyledMainGrid xs={12}>
          <DomainRecords
            domain={domain}
            domainRecords={records}
            updateDomain={updateDomain}
            updateRecords={refetchRecords}
          />
        </StyledMainGrid>
        <StyledTagSectionGrid xs={12}>
          <StyledPaper>
            <StyledTypography data-qa-title variant="h3">
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
