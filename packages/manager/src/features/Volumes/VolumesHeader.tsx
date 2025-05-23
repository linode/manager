import {
  CircleProgress,
  IconButton,
  InputAdornment,
  TextField,
} from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

interface Params {
  isFetching: boolean;
  searchQueryKey?: string;
}

export const VolumesHeader = ({ isFetching, searchQueryKey }: Params) => {
  const navigate = useNavigate();

  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_volumes',
  });

  const resetSearch = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        query: undefined,
      }),
      to: '/volumes',
    });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: e.target.value || undefined,
      }),
      to: '/volumes',
    });
  };

  return (
    <>
      <DocumentTitleSegment segment="Volumes" />
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Volumes',
          removeCrumbX: 1,
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Volumes',
          }),
        }}
        disabledCreateButton={isRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/block-storage"
        entity="Volume"
        onButtonClick={() => navigate({ to: '/volumes/create' })}
        spacingBottom={16}
        title="Volumes"
      />

      <TextField
        hideLabel
        InputProps={{
          endAdornment: searchQueryKey && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress size="sm" />}

              <IconButton
                aria-label="Clear"
                data-testid="clear-volumes-search"
                onClick={resetSearch}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        label="Search"
        onChange={debounce(400, (e) => {
          onSearch(e);
        })}
        placeholder="Search Volumes"
        sx={{ mb: 2 }}
        value={searchQueryKey ?? ''}
      />
    </>
  );
};
