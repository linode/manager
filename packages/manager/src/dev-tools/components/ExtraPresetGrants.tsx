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
          title="Edit Custom Grants"
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
                label="Global Grants"
                name="global_grants"
                onChange={handleInputChange}
                value={formData.global}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Database Grants"
                name="database_grants"
                onChange={handleInputChange}
                value={formData.database}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Domain Grants"
                name="domain_grants"
                onChange={handleInputChange}
                value={formData.domain}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Firewall Grants"
                name="firewall_grants"
                onChange={handleInputChange}
                value={formData.firewall}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Image Grants"
                name="image_grants"
                onChange={handleInputChange}
                value={formData.image}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Linode Grants"
                name="linode_grants"
                onChange={handleInputChange}
                value={formData.linode}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="LKE Grants"
                name="lke_grants"
                onChange={handleInputChange}
                value={formData.lkecluster}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Longview Grants"
                name="longview_grants"
                onChange={handleInputChange}
                value={formData.longview}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Nodebalancer Grants"
                name="nodebalancer_grants"
                onChange={handleInputChange}
                value={formData.nodebalancer}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="StackScript Grants"
                name="stackscript_grants"
                onChange={handleInputChange}
                value={formData.stackscript}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Volume Grants"
                name="volume_grants"
                onChange={handleInputChange}
                value={formData.volume}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="VPC Grants"
                name="vpc_grants"
                onChange={handleInputChange}
                value={formData.vpc}
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