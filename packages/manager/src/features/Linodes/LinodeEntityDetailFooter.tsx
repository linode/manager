import { useLinodeUpdateMutation, useProfile } from '@linode/queries';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

import {
  StyledBox,
  StyledLabelBox,
  StyledListItem,
  sxLastListItem,
  sxListItemFirstChild,
} from './LinodeEntityDetail.styles';

interface FooterProps {
  isLinodesGrantReadOnly: boolean;
  linodeCreated: string;
  linodeId: number;
  linodeLabel: string;
  linodePlan: null | string;
  linodeRegionDisplay: null | string;
  linodeTags: string[];
}

export const LinodeEntityDetailFooter = React.memo((props: FooterProps) => {
  const theme = useTheme();

  const { data: profile } = useProfile();

  const {
    isLinodesGrantReadOnly,
    linodeCreated,
    linodeId,
    linodeLabel,
    linodePlan,
    linodeRegionDisplay,
    linodeTags,
  } = props;

  const isReadOnlyAccountAccess = useRestrictedGlobalGrantCheck({
    globalGrantType: 'account_access',
    permittedGrantLevel: 'read_write',
  });

  const { mutateAsync: updateLinode } = useLinodeUpdateMutation(linodeId);

  const { enqueueSnackbar } = useSnackbar();

  const updateTags = React.useCallback(
    (tags: string[]) => {
      return updateLinode({ tags }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [updateLinode, enqueueSnackbar]
  );

  return (
    <Grid
      sx={{
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
        paddingY: 0,
      }}
      container
      direction="row"
      spacing={2}
    >
      <Grid
        size={{
          lg: 8,
          xs: 12,
        }}
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          padding: 0,

          [theme.breakpoints.down('lg')]: {
            padding: '8px',
          },

          [theme.breakpoints.down('md')]: {
            display: 'grid',
            gridTemplateColumns: '50% 2fr',
          },
        }}
      >
        <StyledBox>
          {linodePlan && (
            <StyledListItem
              sx={{
                ...sxListItemFirstChild,
                [theme.breakpoints.down('lg')]: {
                  paddingLeft: 0,
                },
              }}
            >
              <StyledLabelBox component="span">Plan: </StyledLabelBox>{' '}
              {linodePlan}
            </StyledListItem>
          )}
          {linodeRegionDisplay && (
            <StyledListItem>
              <StyledLabelBox component="span">Region:</StyledLabelBox>{' '}
              {linodeRegionDisplay}
            </StyledListItem>
          )}
        </StyledBox>
        <StyledBox>
          <StyledListItem sx={{ ...sxListItemFirstChild }}>
            <StyledLabelBox component="span">Linode ID:</StyledLabelBox>{' '}
            {linodeId}
          </StyledListItem>
          <StyledListItem
            sx={{
              ...sxLastListItem,
            }}
          >
            <StyledLabelBox component="span">Created:</StyledLabelBox>{' '}
            {formatDate(linodeCreated, {
              timezone: profile?.timezone,
            })}
          </StyledListItem>
        </StyledBox>
      </Grid>
      <Grid
        size={{
          lg: 4,
          xs: 12,
        }}
        sx={{
          [theme.breakpoints.down('lg')]: {
            display: 'flex',
            justifyContent: 'flex-start',
          },
        }}
      >
        <TagCell
          sx={{
            width: '100%',
          }}
          disabled={isLinodesGrantReadOnly || isReadOnlyAccountAccess}
          entityLabel={linodeLabel}
          tags={linodeTags}
          updateTags={updateTags}
          view="inline"
        />
      </Grid>
    </Grid>
  );
});
