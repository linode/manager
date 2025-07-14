import { useProfile } from '@linode/queries';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TagCell } from 'src/components/TagCell/TagCell';
import {
  StyledBox,
  StyledLabelBox,
  StyledListItem,
  sxLastListItem,
  sxListItemFirstChild,
} from 'src/features/Linodes/LinodeEntityDetail.styles';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { formatDate } from 'src/utilities/formatDate';
interface FooterProps {
  areClusterLinodesReadOnly: boolean;
  clusterCreated: string;
  clusterId: number;
  clusterLabel: string;
  clusterTags: string[];
  clusterUpdated: string;
}

export const KubeEntityDetailFooter = React.memo((props: FooterProps) => {
  const theme = useTheme();

  const { data: profile } = useProfile();
  const {
    areClusterLinodesReadOnly,
    clusterCreated,
    clusterId,
    clusterLabel,
    clusterTags,
    clusterUpdated,
  } = props;

  const { mutateAsync: updateKubernetesCluster } =
    useKubernetesClusterMutation(clusterId);

  const { enqueueSnackbar } = useSnackbar();

  const handleUpdateTags = React.useCallback(
    (newTags: string[]) => {
      return updateKubernetesCluster({
        tags: newTags,
      }).catch((e) =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error updating tags')[0].reason,
          {
            variant: 'error',
          }
        )
      );
    },
    [updateKubernetesCluster, enqueueSnackbar]
  );

  return (
    <Grid
      container
      data-qa-kube-entity-footer
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
        padding: 0,
      }}
    >
      <Grid
        size={{
          lg: 'auto',
          xs: 12,
        }}
        sx={{
          alignItems: 'center',
          display: 'flex',
          padding: 0,

          [theme.breakpoints.down('lg')]: {
            padding: '8px',
            paddingTop: 0,
          },

          [theme.breakpoints.down('md')]: {
            display: 'grid',
            gridTemplateColumns: '50% 2fr',
          },
        }}
      >
        <StyledBox>
          <StyledListItem sx={{ ...sxListItemFirstChild }}>
            <StyledLabelBox component="span">Cluster ID:</StyledLabelBox>{' '}
            {clusterId}
          </StyledListItem>
          <StyledListItem>
            <StyledLabelBox component="span">Created:</StyledLabelBox>{' '}
            {formatDate(clusterCreated, {
              timezone: profile?.timezone,
            })}
          </StyledListItem>
          <StyledListItem sx={{ ...sxLastListItem }}>
            <StyledLabelBox component="span">Updated:</StyledLabelBox>{' '}
            {formatDate(clusterUpdated, {
              timezone: profile?.timezone,
            })}
          </StyledListItem>
        </StyledBox>
      </Grid>
      <Grid
        size={{
          lg: 3.5,
          xs: 12,
        }}
        sx={{
          marginLeft: 'auto',

          [theme.breakpoints.down('lg')]: {
            display: 'flex',
            justifyContent: 'flex-start',
          },
        }}
      >
        <TagCell
          disabled={areClusterLinodesReadOnly}
          entityLabel={clusterLabel}
          sx={{
            width: '100%',
          }}
          tags={clusterTags}
          updateTags={handleUpdateTags}
          view="inline"
        />
      </Grid>
    </Grid>
  );
});
