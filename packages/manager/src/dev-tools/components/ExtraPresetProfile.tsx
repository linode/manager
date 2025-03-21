import { Dialog } from '@linode/ui';
import * as React from 'react';

import { profileFactory } from 'src/factories';
import { extraMockPresets } from 'src/mocks/presets';
import { setCustomProfileData } from 'src/mocks/presets/extra/account/customProfile';

import { saveCustomProfileData } from '../utils';
import { JsonTextArea } from './JsonTextArea';

import type { Profile } from '@linode/api-v4';

const profilePreset = extraMockPresets.find((p) => p.id === 'profile:custom');

interface ExtraPresetProfileProps {
  customProfileData: Profile | null | undefined;
  handlers: string[];
  onFormChange?: (data: Profile | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetProfile = ({
  customProfileData,
  handlers,
  onFormChange,
  onTogglePreset,
}: ExtraPresetProfileProps) => {
  const isEnabled = handlers.includes('profile:custom');
  const [formData, setFormData] = React.useState<Profile>(() => ({
    ...profileFactory.build({
      restricted: false,
    }),
    ...customProfileData,
  }));
  const [isEditingCustomProfile, setIsEditingCustomProfile] = React.useState(
    false
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    // radios
    const { name, value } = e.target;
    const isRadioToggleField = [
      'email_notifications',
      'restricted',
      'two_factor_auth',
    ].includes(name);

    const newValue = isRadioToggleField ? value === 'true' : value;
    const newFormData = {
      ...formData,
      [name]: newValue,
    };

    setFormData(newFormData);

    if (isEnabled) {
      onFormChange?.(newFormData);
    }
  };

  const handleTogglePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      saveCustomProfileData(null);
    } else {
      saveCustomProfileData(formData);
    }
    onTogglePreset(e, 'profile:custom');
  };

  React.useEffect(() => {
    if (!isEnabled) {
      setFormData({
        ...profileFactory.build(),
      });
      setCustomProfileData(null);
    } else if (isEnabled && customProfileData) {
      setFormData((prev) => ({
        ...prev,
        ...customProfileData,
      }));
      setCustomProfileData(customProfileData);
    }
  }, [isEnabled, customProfileData]);

  if (!profilePreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator has-button">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <label title={profilePreset.desc || profilePreset.label}>
            <input
              checked={isEnabled}
              onChange={handleTogglePreset}
              type="checkbox"
            />
            {profilePreset.label}
          </label>
        </div>
        {isEnabled && (
          <div>
            <button
              className="dev-tools-button small"
              onClick={() => setIsEditingCustomProfile(true)}
            >
              edit
            </button>
          </div>
        )}
      </div>
      {isEnabled && isEditingCustomProfile && (
        <Dialog
          onClose={() => setIsEditingCustomProfile(false)}
          open={isEditingCustomProfile}
          title="Edit Custom Profile"
        >
          <form
            className="dev-tools__modal-form"
            onSubmit={() => setIsEditingCustomProfile(false)}
          >
            <FieldWrapper>
              <label>
                Username
                <input
                  name="username"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.username}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Email
                <input
                  name="email"
                  onChange={handleInputChange}
                  type="email"
                  value={formData.email}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Verified Phone Number
                <input
                  name="verified_phone_number"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.verified_phone_number || ''}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Email Notifications
                <div className="dev-tools__modal-form__field__radio-group">
                  <input
                    checked={formData.email_notifications}
                    id="email_notifications_true"
                    name="email_notifications"
                    onChange={handleInputChange}
                    radioGroup="email_notifications"
                    type="radio"
                    value="true"
                  />
                  <label htmlFor="email_notifications_true">Yes</label>
                  <input
                    checked={!formData.email_notifications}
                    id="email_notifications_false"
                    name="email_notifications"
                    onChange={handleInputChange}
                    radioGroup="email_notifications"
                    type="radio"
                    value="false"
                  />
                  <label htmlFor="email_notifications_false">No</label>
                </div>
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                User Type
                <select
                  name="user_type"
                  onChange={handleInputChange}
                  value={formData.user_type}
                >
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="proxy">Proxy</option>
                  <option value="default">Default</option>
                </select>
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Timezone
                <input
                  name="timezone"
                  onChange={handleInputChange}
                  type="text"
                  value={formData.timezone}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Restricted
                <div className="dev-tools__modal-form__field__radio-group">
                  <input
                    checked={formData.restricted}
                    id="restricted_true"
                    name="restricted"
                    onChange={handleInputChange}
                    type="radio"
                    value="true"
                  />
                  <label htmlFor="restricted_true">Yes</label>
                  <input
                    checked={!formData.restricted}
                    id="restricted_false"
                    name="restricted"
                    onChange={handleInputChange}
                    type="radio"
                    value="false"
                  />
                  <label htmlFor="restricted_false">No</label>
                </div>
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Authentication Type
                <select
                  name="authentication_type"
                  onChange={handleInputChange}
                  value={formData.authentication_type}
                >
                  <option value="password">Password</option>
                  <option value="github">GitHub</option>
                  <option value="google">Google</option>
                </select>
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Two Factor Auth
                <div className="dev-tools__modal-form__field__radio-group">
                  <input
                    checked={formData.two_factor_auth}
                    id="two_factor_auth_true"
                    name="two_factor_auth"
                    onChange={handleInputChange}
                    type="radio"
                    value="true"
                  />
                  <label htmlFor="two_factor_auth_true">Yes</label>
                  <input
                    checked={!formData.two_factor_auth}
                    id="two_factor_auth_false"
                    name="two_factor_auth"
                    onChange={handleInputChange}
                    type="radio"
                    value="false"
                  />
                  <label htmlFor="two_factor_auth_false">No</label>
                </div>
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                height={150}
                label="Referrals"
                name="referrals"
                onChange={handleInputChange}
                value={formData.referrals}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                height={80}
                label="Authorized Keys (one per line)"
                name="authorized_keys"
                onChange={handleInputChange}
                value={formData.authorized_keys}
              />
            </FieldWrapper>
            <button className="dev-tools-button button" type="submit">
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
