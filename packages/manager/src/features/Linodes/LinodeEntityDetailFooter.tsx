import { useLinodeUpdateMutation, useProfile } from '@linode/queries';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';

import { usePermissions } from '../IAM/hooks/usePermissions';
import {
  StyledBox,
  StyledLabelBox,
  StyledListItem,
  sxLastListItem,
  sxListItemFirstChild,
} from './LinodeEntityDetail.styles';

interface FooterProps {
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
    linodeCreated,
    linodeId,
    linodeLabel,
    linodePlan,
    linodeRegionDisplay,
    linodeTags,
  } = props;

  const { data: permissions } = usePermissions('account', ['is_account_admin']);

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
      container
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
        paddingY: 0,
      }}
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
          // A restricted user can technically add tags to a Linode if they have read-write permission on the Linode,
          // but for the sake of the user experience, we choose to disable the "Add a tag" button in the UI because
          // restricted users can't see account tags using GET /v4/tags
          disabled={!permissions.is_account_admin}
          entityLabel={linodeLabel}
          sx={{
            width: '100%',
          }}
          tags={linodeTags}
          updateTags={updateTags}
          view="inline"
        />
      </Grid>
    </Grid>
  );
});
