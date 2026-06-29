import {
  ActionsPanel,
  Box,
  Checkbox,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from '@linode/ui';
import EditIcon from '@mui/icons-material/Edit';
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
        <IconButton
          aria-label={`Edit ${label}`}
          onClick={onEditClick}
          size="small"
          sx={{ p: 0.25 }}
        >
          <EditIcon sx={{ fontSize: 16 }} />
        </IconButton>
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

      if (allModelIds.length > 0) {
        // If allowed_models is empty or ['*'], it means all models are allowed
        if (
          apiKey.allowed_models.length === 0 ||
          (apiKey.allowed_models.length === 1 &&
            apiKey.allowed_models[0] === '*')
        ) {
          setSelectedModels([...allModelIds]);
        } else {
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
    <Drawer onClose={onClose} open={open} title={`${apiKey.label} Details`}>
      <DetailRow
        editable={isEditable}
        isEditing={isEditingLabel}
        label="Name"
        onEditClick={() => setIsEditingLabel(true)}
      >
        <Box alignItems="center" display="flex" gap={1}>
          {isEditingLabel ? (
            <TextField
              hideLabel
              label="Name"
              onChange={(e) => {
                setEditLabel(e.target.value);
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
          <TextField
            hideLabel
            label="Description"
            multiline
            onChange={(e) => {
              setEditDescription(e.target.value);
              setHasChanges(true);
            }}
            rows={2}
            value={editDescription}
          />
        ) : (
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
            {apiKey.description || 'No description'}
          </Typography>
        )}
      </DetailRow>

      <DetailRow label="Usage 24h">
        <UsageSparkline data={apiKey.usage_24h ?? []} width={300} />
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedModels([...allModelIds]);
              } else {
                setSelectedModels([]);
              }
              setHasChanges(true);
            }}
            text="All"
          />
          {models.map((model) => (
            <Checkbox
              checked={selectedModels.includes(model.id)}
              disabled={!areModelsEditable}
              key={model.id}
              onChange={(e) => handleModelToggle(model.id, e.target.checked)}
              text={model.id}
            />
          ))}
        </Box>
      </DetailRow>

      <ActionsPanel
        primaryButtonProps={
          hasChanges
            ? {
                label: 'Save Changes',
                onClick: handleSave,
              }
            : undefined
        }
        secondaryButtonProps={{
          label: hasChanges ? 'Cancel' : 'Close',
          onClick: handleCancel,
        }}
      />
    </Drawer>
  );
};
