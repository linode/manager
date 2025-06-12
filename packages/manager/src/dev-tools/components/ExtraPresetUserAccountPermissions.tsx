import { Dialog } from '@linode/ui';
import * as React from 'react';

import { userAccountPermissionsFactory } from 'src/factories/userAccountPermissions';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomUserAccountPermissionsData } from 'src/mocks/presets/extra/userPermissions/customUserAccountPermissions';

import { saveCustomUserAccountPermissionsData } from '../utils';
import { JsonTextArea } from './JsonTextArea';

import type { PermissionType } from '@linode/api-v4';

const customUserAccountPermissionsPreset = extraMockPresets.find(
  (p) => p.id === 'userAccountPermissions:custom'
);

interface ExtraPresetUserAccountPermissionsProps {
  customUserAccountPermissionsData: null | PermissionType[] | undefined;
  handlers: string[];
  onFormChange?: (data: null | PermissionType[] | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetUserAccountPermissions = ({
  customUserAccountPermissionsData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetUserAccountPermissionsProps) => {
  const isEnabled = handlers.includes('userAccountPermissions:custom');
  const [formData, setFormData] = React.useState<PermissionType[]>(() => {
    const permissions = [...userAccountPermissionsFactory];
    const customPermissions = customUserAccountPermissionsData || [];
    return [...permissions, ...customPermissions];
  });
  const [isEditingCustomUserPermissions, setIsEditingCustomUserPermissions] =
    React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    try {
      const newFormData = value;

      if (!Array.isArray(newFormData)) {
        throw new Error('Expected an array');
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
      saveCustomUserAccountPermissionsData(null);
    } else {
      saveCustomUserAccountPermissionsData(formData);
    }
    onTogglePreset(e, 'userAccountPermissions:custom');
  };

  React.useEffect(() => {
    if (!isEnabled) {
      setFormData([...userAccountPermissionsFactory]);
      setCustomUserAccountPermissionsData(null);
    } else if (isEnabled && customUserAccountPermissionsData) {
      setFormData([...customUserAccountPermissionsData]);
      setCustomUserAccountPermissionsData([
        ...customUserAccountPermissionsData,
      ]);
    }
  }, [isEnabled, customUserAccountPermissionsData]);

  if (!customUserAccountPermissionsPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator has-button">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <label
            title={
              customUserAccountPermissionsPreset.desc ||
              customUserAccountPermissionsPreset.label
            }
          >
            <input
              checked={isEnabled}
              onChange={handleTogglePreset}
              type="checkbox"
            />
            {customUserAccountPermissionsPreset.label}
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
          title="Edit Custom User Account Permissions"
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
