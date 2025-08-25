import { Dialog } from '@linode/ui';
import { grantsFactory, profileFactory } from '@linode/utilities';
import * as React from 'react';

import { extraMockPresets } from 'src/mocks/presets';
import {
  setCustomGrantsData,
  setCustomProfileData,
} from 'src/mocks/presets/extra/account/customProfileAndGrants';

import { saveCustomGrantsData, saveCustomProfileData } from '../utils';
import { JsonTextArea } from './JsonTextArea';

import type { Grants, Profile } from '@linode/api-v4';

const profilePreset = extraMockPresets.find(
  (p) => p.id === 'profile-grants:custom'
);

interface ExtraPresetProfileProps {
  customGrantsData: Grants | null | undefined;
  customProfileData: null | Profile | undefined;
  handlers: string[];
  onFormChangeGrants?: (data: Grants | null | undefined) => void;
  onFormChangeProfile?: (data: null | Profile | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}

export const ExtraPresetProfileAndGrants = ({
  customGrantsData,
  customProfileData,
  handlers,
  onFormChangeGrants,
  onFormChangeProfile,
  onTogglePreset,
}: ExtraPresetProfileProps) => {
  const isEnabled = handlers.includes('profile-grants:custom');
  const [profileFormData, setProfileFormData] = React.useState<Profile>(() => ({
    ...profileFactory.build({
      restricted: false,
    }),
    ...customProfileData,
  }));
  const [grantsFormData, setGrantsFormData] = React.useState<Grants>(() => ({
    ...grantsFactory.build(),
    ...customGrantsData,
  }));
  const [isEditingCustomProfile, setIsEditingCustomProfile] =
    React.useState(false);

  const handleProfileInputChange = (
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
    const newProfileFormData = {
      ...profileFormData,
      [name]: newValue,
    };

    setProfileFormData(newProfileFormData);

    if (isEnabled) {
      onFormChangeProfile?.(newProfileFormData);
    }
  };

  const handleGrantsInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    try {
      const newGrantsFormData = {
        ...grantsFormData,
        [name]: value,
      };
      setGrantsFormData(newGrantsFormData);

      if (isEnabled) {
        onFormChangeGrants?.(newGrantsFormData);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse JSON from input value:', value, err);
    }
  };

  const handleTogglePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      saveCustomProfileData(null);
      saveCustomGrantsData(null);
    } else {
      saveCustomProfileData(profileFormData);
      saveCustomGrantsData(grantsFormData);
    }
    onTogglePreset(e, 'profile-grants:custom');
  };

  React.useEffect(() => {
    if (!isEnabled) {
      setProfileFormData({
        ...profileFactory.build(),
      });
      setCustomProfileData(null);
      setGrantsFormData({
        ...grantsFactory.build(),
      });
      setCustomGrantsData(null);
    } else if (isEnabled) {
      if (customProfileData) {
        setProfileFormData((prev) => ({
          ...prev,
          ...customProfileData,
        }));
        setCustomProfileData(customProfileData);
      }
      if (customGrantsData) {
        setGrantsFormData((prev) => ({
          ...prev,
          ...customGrantsData,
        }));
        setCustomGrantsData(customGrantsData);
      }
    }
  }, [isEnabled, customProfileData, customGrantsData]);

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
          title="Edit Custom Profile and Grants"
        >
          <form
            className="dev-tools__modal-form"
            onSubmit={() => setIsEditingCustomProfile(false)}
          >
            <h3>Profile</h3>
            <FieldWrapper>
              <label>
                Username
                <input
                  name="username"
                  onChange={handleProfileInputChange}
                  type="text"
                  value={profileFormData.username}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Email
                <input
                  name="email"
                  onChange={handleProfileInputChange}
                  type="email"
                  value={profileFormData.email}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Verified Phone Number
                <input
                  name="verified_phone_number"
                  onChange={handleProfileInputChange}
                  type="text"
                  value={profileFormData.verified_phone_number || ''}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Email Notifications
                <div className="dev-tools__modal-form__field__radio-group">
                  <input
                    checked={profileFormData.email_notifications}
                    id="email_notifications_true"
                    name="email_notifications"
                    onChange={handleProfileInputChange}
                    radioGroup="email_notifications"
                    type="radio"
                    value="true"
                  />
                  <label htmlFor="email_notifications_true">Yes</label>
                  <input
                    checked={!profileFormData.email_notifications}
                    id="email_notifications_false"
                    name="email_notifications"
                    onChange={handleProfileInputChange}
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
                  className="dt-select"
                  name="user_type"
                  onChange={handleProfileInputChange}
                  value={profileFormData.user_type}
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
                  onChange={handleProfileInputChange}
                  type="text"
                  value={profileFormData.timezone}
                />
              </label>
            </FieldWrapper>
            <FieldWrapper>
              <label>
                Restricted
                <div className="dev-tools__modal-form__field__radio-group">
                  <input
                    checked={profileFormData.restricted}
                    id="restricted_true"
                    name="restricted"
                    onChange={handleProfileInputChange}
                    type="radio"
                    value="true"
                  />
                  <label htmlFor="restricted_true">Yes</label>
                  <input
                    checked={!profileFormData.restricted}
                    id="restricted_false"
                    name="restricted"
                    onChange={handleProfileInputChange}
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
                  className="dt-select"
                  name="authentication_type"
                  onChange={handleProfileInputChange}
                  value={profileFormData.authentication_type}
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
                    checked={profileFormData.two_factor_auth}
                    id="two_factor_auth_true"
                    name="two_factor_auth"
                    onChange={handleProfileInputChange}
                    type="radio"
                    value="true"
                  />
                  <label htmlFor="two_factor_auth_true">Yes</label>
                  <input
                    checked={!profileFormData.two_factor_auth}
                    id="two_factor_auth_false"
                    name="two_factor_auth"
                    onChange={handleProfileInputChange}
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
                onChange={handleProfileInputChange}
                value={profileFormData.referrals}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                height={80}
                label="Authorized Keys (one per line)"
                name="authorized_keys"
                onChange={handleProfileInputChange}
                value={profileFormData.authorized_keys}
              />
            </FieldWrapper>
            <hr />
            <h3>Grants</h3>
            <FieldWrapper>
              <JsonTextArea
                label="Global Grants"
                name="global"
                onChange={handleGrantsInputChange}
                value={grantsFormData.global}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Database Grants"
                name="database"
                onChange={handleGrantsInputChange}
                value={grantsFormData.database}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Domain Grants"
                name="domain"
                onChange={handleGrantsInputChange}
                value={grantsFormData.domain}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Firewall Grants"
                name="firewall"
                onChange={handleGrantsInputChange}
                value={grantsFormData.firewall}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Image Grants"
                name="image"
                onChange={handleGrantsInputChange}
                value={grantsFormData.image}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Linode Grants"
                name="linode"
                onChange={handleGrantsInputChange}
                value={grantsFormData.linode}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="LKE Grants"
                name="lkecluster"
                onChange={handleGrantsInputChange}
                value={grantsFormData.lkecluster}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Longview Grants"
                name="longview"
                onChange={handleGrantsInputChange}
                value={grantsFormData.longview}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Nodebalancer Grants"
                name="nodebalancer"
                onChange={handleGrantsInputChange}
                value={grantsFormData.nodebalancer}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="StackScript Grants"
                name="stackscript"
                onChange={handleGrantsInputChange}
                value={grantsFormData.stackscript}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="Volume Grants"
                name="volume"
                onChange={handleGrantsInputChange}
                value={grantsFormData.volume}
              />
            </FieldWrapper>
            <FieldWrapper>
              <JsonTextArea
                label="VPC Grants"
                name="vpc"
                onChange={handleGrantsInputChange}
                value={grantsFormData.vpc}
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
