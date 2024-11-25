import { Box } from '@linode/ui';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomAccountData } from 'src/mocks/presets/extra/account/customAccount';

import { saveCustomAccountData } from '../utils';

import type { Account } from '@linode/api-v4';

const customAccountPreset = extraMockPresets.find(
  (p) => p.id === 'account:custom'
);

interface ExtraPresetAccountProps {
  customAccountData: Account | null | undefined;
  handlers: string[];
  onFormChange?: (data: Account | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetAccount = ({
  customAccountData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetAccountProps) => {
  const isEnabled = handlers.includes('account:custom');
  const [formData, setFormData] = React.useState<Account>(() => ({
    ...accountFactory.build(),
    ...customAccountData,
  }));

  React.useEffect(() => {
    if (customAccountData && isEnabled) {
      setFormData((prev) => ({
        ...prev,
        ...customAccountData,
      }));
    } else {
      setFormData({
        ...accountFactory.build(),
      });
    }
  }, [customAccountData, isEnabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    onFormChange?.(newFormData);
  };

  const handleTogglePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      saveCustomAccountData(null);
    } else {
      saveCustomAccountData(formData);
    }
    onTogglePreset(e, 'account:custom');
  };

  React.useEffect(() => {
    if (!isEnabled) {
      setCustomAccountData(null);
    } else if (isEnabled && customAccountData) {
      setCustomAccountData(customAccountData);
    }
  }, [isEnabled, customAccountData]);

  if (!customAccountPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator">
      <div>
        <label title={customAccountPreset.desc || customAccountPreset.label}>
          <input
            checked={isEnabled}
            onChange={handleTogglePreset}
            type="checkbox"
          />
          {customAccountPreset.label}
        </label>
      </div>
      {isEnabled && (
        <Box marginTop={2}>
          Changes will take effect after clicking "Apply" in the footer
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(2, 1fr)',
            }}
            marginTop={2}
          >
            <label>
              Company
              <input
                name="company"
                onChange={handleInputChange}
                type="text"
                value={formData.company}
              />
            </label>
            <label>
              Email
              <input
                name="email"
                onChange={handleInputChange}
                type="text"
                value={formData.email}
              />
            </label>
            <label>
              First Name
              <input
                name="first_name"
                onChange={handleInputChange}
                type="text"
                value={formData.first_name}
              />
            </label>
            <label>
              Last Name
              <input
                name="last_name"
                onChange={handleInputChange}
                type="text"
                value={formData.last_name}
              />
            </label>
            <label>
              Address 1
              <input
                name="address_1"
                onChange={handleInputChange}
                type="text"
                value={formData.address_1}
              />
            </label>
            <label>
              Address 2
              <input
                name="address_2"
                onChange={handleInputChange}
                type="text"
                value={formData.address_2}
              />
            </label>
            <label>
              City
              <input
                name="city"
                onChange={handleInputChange}
                type="text"
                value={formData.city}
              />
            </label>
            <label>
              State
              <input
                name="state"
                onChange={handleInputChange}
                type="text"
                value={formData.state}
              />
            </label>
            <label>
              Zip
              <input
                name="zip"
                onChange={handleInputChange}
                type="text"
                value={formData.zip}
              />
            </label>
            <label>
              Country
              <input
                name="country"
                onChange={handleInputChange}
                type="text"
                value={formData.country}
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                onChange={handleInputChange}
                type="text"
                value={formData.phone}
              />
            </label>
            <label>
              Tax ID
              <input
                name="tax_id"
                onChange={handleInputChange}
                type="text"
                value={formData.tax_id}
              />
            </label>
            <label>
              Balance
              <input
                name="balance"
                onChange={handleInputChange}
                type="number"
                value={formData.balance}
              />
            </label>
          </Box>
        </Box>
      )}
    </li>
  );
};
