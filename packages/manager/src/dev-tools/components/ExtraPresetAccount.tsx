import { accountCapabilities } from '@linode/api-v4';
import { Dialog } from '@linode/ui';
import * as React from 'react';

import { accountFactory } from 'src/factories';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomAccountData } from 'src/mocks/presets/extra/account/customAccount';

import { saveCustomAccountData } from '../utils';
import { JsonTextArea } from './JsonTextArea';

import type { Account, AccountCapability } from '@linode/api-v4';

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
  const [isEditingCustomAccount, setIsEditingCustomAccount] = React.useState(
    false
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'capabilities' && e.target instanceof HTMLSelectElement) {
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (option) => option.value as AccountCapability
      );
      const newFormData = {
        ...formData,
        [name]: selectedOptions,
      };
      setFormData(newFormData);

      if (isEnabled) {
        onFormChange?.(newFormData);
      }
      return;
    }

    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);

    if (isEnabled) {
      onFormChange?.(newFormData);
    }
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
      setFormData({
        ...accountFactory.build(),
      });
    } else if (isEnabled && customAccountData) {
      setFormData((prev) => ({
        ...prev,
        ...customAccountData,
      }));
      setCustomAccountData(customAccountData);
    }
  }, [isEnabled, customAccountData]);

  if (!customAccountPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator has-button">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
          <div>
            <button
              className="small"
              onClick={() => setIsEditingCustomAccount(true)}
            >
              edit
            </button>
          </div>
        )}
      </div>
      {isEnabled && isEditingCustomAccount && (
        <Dialog
          onClose={() => setIsEditingCustomAccount(false)}
          open={isEditingCustomAccount}
          title="Edit Custom Account"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsEditingCustomAccount(false);
            }}
            className="dev-tools__modal-form"
          >
            <FieldWrapper>
              <label>
                First Name
                <input
                  name="first_name"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.first_name}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Last Name
                <input
                  name="last_name"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.last_name}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Email
                <input
                  name="email"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.email}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Capabilities
                <select
                  multiple
                  name="capabilities"
                  onChange={handleInputChange}
                  value={formData.capabilities}
                >
                  {accountCapabilities.map((capability) => (
                    <option
                      defaultValue={capability}
                      key={capability}
                      value={capability}
                    >
                      {capability}
                    </option>
                  ))}
                </select>
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Company
                <input
                  name="company"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.company}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Address 1
                <input
                  name="address_1"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.address_1}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Address 2
                <input
                  name="address_2"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.address_2}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                City
                <input
                  name="city"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.city}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                State
                <input
                  name="state"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.state}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Zip
                <input
                  name="zip"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.zip}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Country
                <input
                  name="country"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.country}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Phone
                <input
                  name="phone"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.phone}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                height={80}
                label="Credit Card"
                name="credit_card"
                onChange={handleInputChange}
                value={formData.credit_card}
              />
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Active Since
                <input
                  name="active_since"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.active_since}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Active Promotions"
                name="active_promotions"
                onChange={handleInputChange}
                value={formData.active_promotions}
              />
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Tax ID
                <input
                  name="tax_id"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.tax_id}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Billing Source
                <select
                  name="billing_source"
                  onChange={handleInputChange}
                  value={formData.billing_source}
                >
                  <option value="linode">Linode</option>
                  <option value="akamai">Akamai</option>
                </select>
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Balance
                <input
                  name="balance"
                  onChange={handleInputChange}
                  type="number"
                  value={formData.balance}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Balance Uninvoiced
                <input
                  name="balance_uninvoiced"
                  onChange={handleInputChange}
                  type="number"
                  value={formData.balance_uninvoiced}
                />
              </label>
            </FieldWrapper>
            <button className="button" type="submit">
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
