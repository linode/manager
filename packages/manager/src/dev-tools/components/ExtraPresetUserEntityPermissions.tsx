import { Dialog } from '@linode/ui';
import * as React from 'react';

import { userEntityPermissionsFactory } from 'src/factories/userEntityPermissions';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomUserEntityPermissionsData } from 'src/mocks/presets/extra/userPermissions/customUserEntityPermissions';

import { saveCustomUserEntityPermissionsData } from '../utils';
import { JsonTextArea } from './JsonTextArea';

import type { PermissionType } from '@linode/api-v4';

const customUserEntityPermissionsPreset = extraMockPresets.find(
  (p) => p.id === 'userEntityPermissions:custom'
);

interface ExtraPresetUserEntityPermissionsProps {
  customUserEntityPermissionsData: null | PermissionType[] | undefined;
  handlers: string[];
  onFormChange?: (data: null | PermissionType[] | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetUserEntityPermissions = ({
  customUserEntityPermissionsData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetUserEntityPermissionsProps) => {
  const isEnabled = handlers.includes('userEntityPermissions:custom');
  const [formData, setFormData] = React.useState<PermissionType[]>(() => {
    const permissions = [...userEntityPermissionsFactory];
    const customPermissions = customUserEntityPermissionsData || [];
    return [...permissions, ...customPermissions];
  });
  const [isEditingCustomUserPermissions, setIsEditingCustomUserPermissions] =
    React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    try {
      const newFormData = value;

      if (!Array.isArray(newFormData)) {
        throw new Error('Expected an array of strings');
      }

      setFormData([...newFormData]);

      if (isEnabled) {
        onFormChange?.(newFormData);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse JSON from input value:', value, err);
    }
  };

  const handleTogglePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      saveCustomUserEntityPermissionsData(null);
    } else {
      saveCustomUserEntityPermissionsData(formData);
    }
    onTogglePreset(e, 'userEntityPermissions:custom');
  };

  React.useEffect(() => {
    if (!isEnabled) {
      setFormData([...userEntityPermissionsFactory]);
      setCustomUserEntityPermissionsData(null);
    } else if (isEnabled && customUserEntityPermissionsData) {
      setFormData([...customUserEntityPermissionsData]);
      setCustomUserEntityPermissionsData([...customUserEntityPermissionsData]);
    }
  }, [isEnabled, customUserEntityPermissionsData]);

  if (!customUserEntityPermissionsPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator has-button">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <label
            title={
              customUserEntityPermissionsPreset.desc ||
              customUserEntityPermissionsPreset.label
            }
          >
            <input
              checked={isEnabled}
              onChange={handleTogglePreset}
              type="checkbox"
            />
            {customUserEntityPermissionsPreset.label}
          </label>
        </div>
        {isEnabled && (
          <div>
            <button
              className="dev-tools-button small"
              onClick={() => setIsEditingCustomUserPermissions(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>
      {isEnabled && isEditingCustomUserPermissions && (
        <Dialog
          onClose={() => setIsEditingCustomUserPermissions(false)}
          open={isEditingCustomUserPermissions}
          title="Edit Custom User Entity Permissions"
        >
          <form
            className="dev-tools__modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              setIsEditingCustomUserPermissions(false);
            }}
          >
            <FieldWrapper>
              <JsonTextArea
                label="User Permissions"
                name="user_permissions"
                onChange={handleInputChange}
                value={formData}
              />
            </FieldWrapper>
            <button className="dev-tools-button" type="submit">
              Save
            </button>
          </form>
        </Dialog>
      )}
    </li>
  );
};

const FieldWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="dev-tools__modal-form__field">{children}</div>;
};
