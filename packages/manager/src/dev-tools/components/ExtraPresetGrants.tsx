import { Dialog } from '@linode/ui';
import { grantsFactory } from '@linode/utilities';
import * as React from 'react';

import { extraMockPresets } from 'src/mocks/presets';

import { saveCustomGrantsData } from '../utils';
import { JsonTextArea } from './JsonTextArea';

import type { Grants } from '@linode/api-v4';

const customGrantsPreset = extraMockPresets.find(
  (p) => p.id === 'grants:custom'
);

interface ExtraPresetGrantsProps {
  customGrantsData: Grants | null | undefined;
  handlers: string[];
  onFormChange?: (data: Grants | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetGrants = ({
  customGrantsData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetGrantsProps) => {
  const isEnabled = handlers.includes('grants:custom');
  const [formData, setFormData] = React.useState<Grants>(() => ({
    ...grantsFactory.build(),
    ...customGrantsData,
  }));

  const handleInputChange = () => {};
  const [isEditingCustomGrants, setIsEditingCustomGrants] =
    React.useState(false);

  const handleTogglePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      saveCustomGrantsData(null);
    } else {
      saveCustomGrantsData(formData);
    }
    onTogglePreset(e, 'grants:custom');
  };

  if (!customGrantsPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator has-button">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <label title={customGrantsPreset.desc || customGrantsPreset.label}>
            <input
              checked={isEnabled}
              onChange={handleTogglePreset}
              type="checkbox"
            />
            {customGrantsPreset.label}
          </label>
        </div>
        {isEnabled && (
          <div>
            <button
              className="dev-tools-button small"
              onClick={() => setIsEditingCustomGrants(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>
      {isEnabled && isEditingCustomGrants && (
        <Dialog
          onClose={() => setIsEditingCustomGrants(false)}
          open={isEditingCustomGrants}
          title="Edit Custom User Account Permissions"
        >
          <form
            className="dev-tools__modal-form"
            onSubmit={(e) => {
              e.preventDefault();
              setIsEditingCustomGrants(false);
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