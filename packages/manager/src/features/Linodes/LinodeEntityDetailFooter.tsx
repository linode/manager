import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useLinodeUpdateMutation } from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile/profile';
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
        flex: 1,
        padding: 0,
      }}
      alignItems="center"
      container
      direction="row"
      justifyContent="space-between"
      spacing={2}
    >
      <Grid
        sx={{
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
        alignItems="flex-start"
        lg={8}
        xs={12}
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
        sx={{
          [theme.breakpoints.down('lg')]: {
            display: 'flex',
            justifyContent: 'flex-start',
          },
        }}
        lg={4}
        xs={12}
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
