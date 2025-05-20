import { useStackScriptQuery } from '@linode/queries';
import { Box, IconButton, Notice, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import Info from 'src/assets/icons/info.svg';
import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';
import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';

import { getMarketplaceAppLabel } from '../../Marketplace/utilities';
import { UserDefinedFieldInput } from './UserDefinedFieldInput';
import { separateUDFsByRequiredStatus } from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

interface Props {
  /**
   * Opens the Marketplace App details drawer for a given StackScript
   *
   * This is optional because we use this components for regular StackScripts too
   * and they don't have details drawers
   */
  onOpenDetailsDrawer?: (stackscriptId: number) => void;
}

export const UserDefinedFields = ({ onOpenDetailsDrawer }: Props) => {
  const { control, formState } = useFormContext<CreateLinodeRequest>();

  const [stackscriptId, stackscriptData] = useWatch({
    control,
    name: ['stackscript_id', 'stackscript_data'],
  });

  const hasStackscriptSelected =
    stackscriptId !== null && stackscriptId !== undefined;

  const { data: stackscript } = useStackScriptQuery(
    stackscriptId ?? -1,
    hasStackscriptSelected
  );

  const userDefinedFields = stackscript?.user_defined_fields;

  const [requiredUDFs, optionalUDFs] =
    separateUDFsByRequiredStatus(userDefinedFields);

  const clusterSize = stackscriptData?.['cluster_size'];

  const isCluster = clusterSize !== null && clusterSize !== undefined;

  const marketplaceAppInfo =
    stackscriptId !== null && stackscriptId !== undefined
      ? oneClickApps[stackscriptId]
      : undefined;

  if (!stackscript || userDefinedFields?.length === 0) {
    return null;
  }

  return (
    <Paper>
      <Stack spacing={2}>
        {marketplaceAppInfo ? (
          <Stack alignItems="center" direction="row" gap={2}>
            <img
              alt={`${stackscript.label} logo`}
              height={60}
              src={`/assets/${marketplaceAppInfo.logo_url}`}
            />
            <Typography variant="h2">
              {getMarketplaceAppLabel(stackscript.label)} Setup
            </Typography>
            <IconButton
              aria-label={`View details for ${getMarketplaceAppLabel(
                stackscript.label
              )}`}
              onClick={() => onOpenDetailsDrawer?.(stackscriptId!)}
              size="large"
            >
              <Info />
            </IconButton>
          </Stack>
        ) : (
          <Typography variant="h2">{stackscript.label} Setup</Typography>
        )}
        {formState.errors.stackscript_data && (
          <Notice
            text={formState.errors.stackscript_data.message as string}
            variant="error"
          />
        )}
        {isCluster && (
          <Notice
            text={`You are creating a cluster with ${clusterSize} nodes.`}
            variant="success"
          />
        )}
        <Stack spacing={2}>
          {requiredUDFs.map((field) => (
            <UserDefinedFieldInput key={field.name} userDefinedField={field} />
          ))}
        </Stack>
        <Box>
          {optionalUDFs.length !== 0 && (
            <ShowMoreExpansion defaultExpanded name="Advanced Options">
              <Stack spacing={1}>
                <Typography py={1}>
                  These fields are additional configuration options and are not
                  required for creation.
                </Typography>
                <Stack spacing={2}>
                  {optionalUDFs.map((field) => (
                    <UserDefinedFieldInput
                      key={field.name}
                      userDefinedField={field}
                    />
                  ))}
                </Stack>
              </Stack>
            </ShowMoreExpansion>
          )}
        </Box>
      </Stack>
    </Paper>
  );
};
