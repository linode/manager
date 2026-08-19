import {
  Button,
  Checkbox,
  Drawer,
  LoadingSpinner,
  TextArea,
  TextField,
} from '@akamai/cds-components/react';
import { Edit } from '@akamai/cds-icons/react';
import { useInferenceUsageQuery } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

import { useInferencePlatform } from '../InferencePlatformContext';
import { KeyTypeBadge } from './KeyTypeBadge';
import { StatusBadge } from './StatusBadge';
import { UsageSparkline } from './UsageSparkline';

import type { ApiKey } from '@linode/api-v4';

interface ApiKeyDetailsDrawerProps {
  apiKey: ApiKey | null;
  onClose: () => void;
  onSave?: (
    keyId: number,
    updates: {
      allowedModels: string[];
      description: string;
      label: string;
    }
  ) => void;
  open: boolean;
}

const DetailRow = ({
  children,
  editable,
  isEditing,
  label,
  onEditClick,
}: {
  children: React.ReactNode;
  editable?: boolean;
  isEditing?: boolean;
  label: string;
  onEditClick?: () => void;
}) => (
  <Box sx={{ mb: 3 }}>
    <Box alignItems="center" display="flex" gap={0.5} sx={{ mb: 0.5 }}>
      <Typography sx={(theme) => ({ font: theme.font.bold })} variant="body1">
        {label}
      </Typography>
      {editable && !isEditing && (
        <Button
          aria-label={`Edit ${label}`}
          onClick={onEditClick}
          variant="icon"
        >
          <Edit height={16} width={16} />
        </Button>
      )}
    </Box>
    <Box>{children}</Box>
  </Box>
);

export const ApiKeyDetailsDrawer = ({
  apiKey,
  onClose,
  onSave,
  open,
}: ApiKeyDetailsDrawerProps) => {
  const { models } = useInferencePlatform();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Editable fields for user keys
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Edit mode states
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Fetch usage data for this specific API key
  const { data: usageData, isLoading: isUsageLoading } = useInferenceUsageQuery(
    {
      api_key_id: apiKey?.id,
      granularity: 'hour',
      group_by: 'api-key',
      include_breakdown: false,
      include_time_series: true,
    },
    open && apiKey !== null
  );

  // Transform usage data to sparkline format (hourly totals for last 24h)
  // Always returns 24 data points, padding with zeros for missing hours
  const usageSparklineData = useMemo(() => {
    // Generate 24 hourly buckets for the last 24 hours
    const now = new Date();
    const buckets: number[] = new Array(24).fill(0);

    if (!usageData?.time_series || usageData.time_series.length === 0) {
      return buckets; // Return 24 zeros if no data
    }

    // Map data to the correct hour slots, summing tokens for same-bucket entries
    for (const entry of usageData.time_series) {
      const hoursAgo = Math.floor(
        (now.getTime() - new Date(entry.bucket).getTime()) / (1000 * 60 * 60)
      );
      const index = 23 - hoursAgo;
      if (index >= 0 && index < 24) {
        buckets[index] += entry.total_tokens;
      }
    }

    return buckets;
  }, [usageData?.time_series]);

  // Memoize model IDs to prevent unnecessary re-renders
  const allModelIds = useMemo(() => models.map((model) => model.id), [models]);

  const isUserKey = apiKey?.key_type === 'user';
  const isDisabled =
    apiKey?.status === 'expired' || apiKey?.status === 'revoked';
  const isEditable = isUserKey && !isDisabled;

  // For current implementation we are not allowing to edit models, but we want to keep the logic in place to allow editing models in the future.
  // Check if all models are allowed (either empty array or ['*'])
  // const isAllModelsAllowed =
  //   apiKey?.allowed_models.length === 0 ||
  //   (apiKey?.allowed_models.length === 1 && apiKey?.allowed_models[0] === '*');

  const isAllModelsAllowed = true;
  // Models are not editable if key is disabled OR if all models are allowed
  const areModelsEditable = !isDisabled && !isAllModelsAllowed;

  // Reset selected models and editable fields when the drawer opens with a new key
  useEffect(() => {
    if (apiKey && open) {
      // Reset editable fields
      setEditLabel(apiKey.label);
      setEditDescription(apiKey.description || '');

      // Reset edit modes
      setIsEditingLabel(false);
      setIsEditingDescription(false);

      // Set selected models based on allowed_models
      if (allModelIds.length > 0) {
        // If allowed_models is empty or ['*'], it means all models are allowed
        if (
          apiKey.allowed_models.length === 0 ||
          (apiKey.allowed_models.length === 1 &&
            apiKey.allowed_models[0] === '*')
        ) {
          setSelectedModels([...allModelIds]);
        } else {
          // Show only the specific allowed models as checked
          setSelectedModels(apiKey.allowed_models);
        }
      }
      setHasChanges(false);
    }
  }, [apiKey, open, allModelIds]);

  const handleModelToggle = (model: string, checked: boolean) => {
    const newModels = checked
      ? [...selectedModels, model]
      : selectedModels.filter((m) => m !== model);
    setSelectedModels(newModels);
    setHasChanges(true);
  };

  // Check if all models are selected
  const areAllModelsSelected =
    allModelIds.length > 0 && selectedModels.length === allModelIds.length;

  const handleSave = () => {
    if (apiKey && onSave) {
      // If all models are selected, send ['*'] to indicate all models
      const modelsToSave = areAllModelsSelected ? ['*'] : selectedModels;
      onSave(apiKey.id, {
        allowedModels: modelsToSave,
        description: editDescription,
        label: editLabel,
      });
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!apiKey) {
    return null;
  }

  return (
    <Drawer aria-label={apiKey.label} onClose={onClose} open={open}>
      <div slot="header">{apiKey.label}</div>
      <div slot="body">
        <DetailRow
          editable={isEditable}
          isEditing={isEditingLabel}
          label="Name"
          onEditClick={() => setIsEditingLabel(true)}
        >
          <Box alignItems="center" display="flex" gap={1}>
            {isEditingLabel ? (
              <TextField
                onChange={(e) => {
                  setEditLabel(String(e.detail));
                  setHasChanges(true);
                }}
                value={editLabel}
              />
            ) : (
              <Typography>{apiKey.label}</Typography>
            )}
            {apiKey.key_type === 'playground' && (
              <KeyTypeBadge keyType={apiKey.key_type} />
            )}
          </Box>
        </DetailRow>

        <DetailRow label="ID">
          <Typography>{apiKey.id}</Typography>
        </DetailRow>

        <DetailRow
          editable={isEditable}
          isEditing={isEditingDescription}
          label="Description"
          onEditClick={() => setIsEditingDescription(true)}
        >
          {isEditingDescription ? (
            <TextArea
              onChange={(e) => {
                setEditDescription(String(e.detail));
                setHasChanges(true);
              }}
              rows={2}
              style={{ width: '100%' }}
              value={editDescription}
            />
          ) : (
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {apiKey.description || 'No description'}
            </Typography>
          )}
        </DetailRow>

        <DetailRow label="Usage 24h">
          {isUsageLoading ? (
            <Box alignItems="center" display="flex" height={40}>
              <LoadingSpinner size="small" />
            </Box>
          ) : (
            <UsageSparkline data={usageSparklineData} width={300} />
          )}
        </DetailRow>

        <DetailRow label="Key Prefix">
          <Typography>{apiKey.key_prefix}...</Typography>
        </DetailRow>

        <DetailRow label="Status">
          <StatusBadge status={apiKey.status} />
        </DetailRow>

        <DetailRow label="Created">
          <DateTimeDisplay displayTime value={apiKey.created} />
        </DetailRow>

        <DetailRow label="Updated">
          <DateTimeDisplay displayTime value={apiKey.updated} />
        </DetailRow>

        <DetailRow label="Allowed models">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Checkbox
              checked={
                allModelIds.length > 0 &&
                selectedModels.length === allModelIds.length
              }
              disabled={!areModelsEditable || allModelIds.length === 0}
              indeterminate={
                selectedModels.length > 0 &&
                selectedModels.length < allModelIds.length
              }
              onChange={() => {
                if (selectedModels.length === allModelIds.length) {
                  setSelectedModels([]);
                } else {
                  setSelectedModels([...allModelIds]);
                }
                setHasChanges(true);
              }}
            >
              All
            </Checkbox>
            {models.map((model) => (
              <Checkbox
                checked={selectedModels.includes(model.id)}
                disabled={!areModelsEditable}
                key={model.id}
                onChange={() =>
                  handleModelToggle(
                    model.id,
                    !selectedModels.includes(model.id)
                  )
                }
              >
                {model.id}
              </Checkbox>
            ))}
          </Box>
        </DetailRow>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            mt: 3,
          }}
        >
          <Button onClick={handleCancel} variant="secondary">
            {hasChanges ? 'Cancel' : 'Close'}
          </Button>
          {hasChanges && (
            <Button onClick={handleSave} variant="primary">
              Save Changes
            </Button>
          )}
        </Box>
      </div>
    </Drawer>
  );
};
