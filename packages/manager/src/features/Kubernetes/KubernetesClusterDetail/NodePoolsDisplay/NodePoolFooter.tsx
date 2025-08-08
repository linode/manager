import { Box, Divider, Stack, Typography } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { TagCell } from 'src/components/TagCell/TagCell';
import { useUpdateNodePoolMutation } from 'src/queries/kubernetes';

import { NodePoolEncryptionStatus } from './NodePoolEncryptionStatus';
import { NodePoolTableFooter } from './NodeTable.styles';

import type {
  EncryptionStatus,
  KubeNodePoolResponse,
  KubernetesTier,
} from '@linode/api-v4';

export interface Props {
  clusterId: number;
  clusterTier: KubernetesTier;
  encryptionStatus: EncryptionStatus;
  isLkeClusterRestricted: boolean;
  poolId: number;
  poolVersion: KubeNodePoolResponse['k8s_version'];
  tags: string[];
}

export const NodePoolFooter = (props: Props) => {
  const {
    clusterTier,
    poolVersion,
    encryptionStatus,
    isLkeClusterRestricted,
    poolId,
    tags,
    clusterId,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateNodePool } = useUpdateNodePoolMutation(
    clusterId,
    poolId
  );

  const { isDiskEncryptionFeatureEnabled } =
    useIsDiskEncryptionFeatureEnabled();

  const updateTags = async (tags: string[]) => {
    updateNodePool({ tags }).catch((e) =>
      enqueueSnackbar(e[0].reason, {
        variant: 'error',
      })
    );
  };

  return (
    <NodePoolTableFooter>
      <Box>
        <Stack
          alignItems="center"
          columnGap={{ sm: 2, xs: 1.5 }}
          direction="row"
          divider={
            <Divider flexItem orientation="vertical" sx={{ height: '20px' }} />
          }
          flexWrap={{ sm: 'unset', xs: 'wrap' }}
          rowGap={1}
        >
          <Typography sx={{ textWrap: 'nowrap' }}>
            <b>Pool ID</b> <CopyTooltip copyableText text={String(poolId)} />
          </Typography>
          {clusterTier === 'enterprise' && poolVersion && (
            <Typography sx={{ textWrap: 'nowrap' }}>
              <b>Version</b> {poolVersion}
            </Typography>
          )}
          {isDiskEncryptionFeatureEnabled && (
            <NodePoolEncryptionStatus encryptionStatus={encryptionStatus} />
          )}
        </Stack>
      </Box>
      <TagCell
        disabled={isLkeClusterRestricted}
        tags={tags}
        updateTags={updateTags}
        view="inline"
      />
    </NodePoolTableFooter>
  );
};
