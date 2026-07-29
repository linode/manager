import * as React from 'react';

import { extraMockPresets } from 'src/mocks/presets';
import {
  DEFAULT_TFA_OPTIONAL_USERNAMES,
  defaultTfaEnforcementMockData,
} from 'src/mocks/presets/extra/account/tfaEnforcement';

import type { TfaEnforcementMockData } from 'src/mocks/presets/extra/account/tfaEnforcement';

const tfaEnforcementPreset = extraMockPresets.find(
  (preset) => preset.id === 'account:tfa-enforcement'
);

interface ExtraPresetTfaEnforcementProps {
  handlers: string[];
  onFormChange?: (data: null | TfaEnforcementMockData | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
  tfaEnforcementData?: null | TfaEnforcementMockData;
}

const isEnforceForAllUsers = (data: TfaEnforcementMockData) =>
  data.tfaOptionalUsers.length === 0;

const buildMockData = ({
  enforceForAllUsers,
  profileSecurityQuestionsConfigured,
  profileTwoFactorAuth,
  tfaEnforced,
}: {
  enforceForAllUsers: boolean;
  profileSecurityQuestionsConfigured: boolean;
  profileTwoFactorAuth: boolean;
  tfaEnforced: boolean;
}): TfaEnforcementMockData => ({
  profileSecurityQuestionsConfigured,
  profileTwoFactorAuth,
  tfaEnforced,
  tfaOptionalUsers: enforceForAllUsers
    ? []
    : [...DEFAULT_TFA_OPTIONAL_USERNAMES],
});

export const ExtraPresetTfaEnforcement = ({
  handlers,
  onFormChange,
  onTogglePreset,
  tfaEnforcementData,
}: ExtraPresetTfaEnforcementProps) => {
  const isEnabled = handlers.includes('account:tfa-enforcement');
  const stagedData = tfaEnforcementData ?? defaultTfaEnforcementMockData;
  const [tfaEnforced, setTfaEnforced] = React.useState(stagedData.tfaEnforced);
  const [enforceForAllUsers, setEnforceForAllUsers] = React.useState(() =>
    isEnforceForAllUsers(stagedData)
  );
  const [profileTwoFactorAuth, setProfileTwoFactorAuth] = React.useState(
    stagedData.profileTwoFactorAuth
  );
  const [
    profileSecurityQuestionsConfigured,
    setProfileSecurityQuestionsConfigured,
  ] = React.useState(stagedData.profileSecurityQuestionsConfigured);

  React.useEffect(() => {
    const data = isEnabled
      ? (tfaEnforcementData ?? defaultTfaEnforcementMockData)
      : defaultTfaEnforcementMockData;

    setTfaEnforced(data.tfaEnforced);
    setEnforceForAllUsers(isEnforceForAllUsers(data));
    setProfileTwoFactorAuth(data.profileTwoFactorAuth);
    setProfileSecurityQuestionsConfigured(
      data.profileSecurityQuestionsConfigured
    );
  }, [isEnabled, tfaEnforcementData]);

  const getCurrentMockData = (
    overrides: Partial<{
      enforceForAllUsers: boolean;
      profileSecurityQuestionsConfigured: boolean;
      profileTwoFactorAuth: boolean;
      tfaEnforced: boolean;
    }> = {}
  ) =>
    buildMockData({
      enforceForAllUsers: overrides.enforceForAllUsers ?? enforceForAllUsers,
      profileSecurityQuestionsConfigured:
        overrides.profileSecurityQuestionsConfigured ??
        profileSecurityQuestionsConfigured,
      profileTwoFactorAuth:
        overrides.profileTwoFactorAuth ?? profileTwoFactorAuth,
      tfaEnforced: overrides.tfaEnforced ?? tfaEnforced,
    });

  const stageMockData = (data: TfaEnforcementMockData) => {
    onFormChange?.(data);
  };

  const handleTogglePreset = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      stageMockData(tfaEnforcementData ?? getCurrentMockData());
    }

    onTogglePreset(e, 'account:tfa-enforcement');
  };

  const handleTfaEnforcedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTfaEnforced = e.target.checked;
    setTfaEnforced(nextTfaEnforced);

    if (!isEnabled) {
      return;
    }

    stageMockData(
      getCurrentMockData({
        enforceForAllUsers: nextTfaEnforced ? enforceForAllUsers : false,
        tfaEnforced: nextTfaEnforced,
      })
    );
  };

  const handleEnforceForAllUsersChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextEnforceForAllUsers = e.target.checked;
    setEnforceForAllUsers(nextEnforceForAllUsers);

    if (!isEnabled || !tfaEnforced) {
      return;
    }

    stageMockData(
      getCurrentMockData({ enforceForAllUsers: nextEnforceForAllUsers })
    );
  };

  const handleProfileTwoFactorAuthChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextProfileTwoFactorAuth = e.target.checked;
    setProfileTwoFactorAuth(nextProfileTwoFactorAuth);

    if (!isEnabled) {
      return;
    }

    stageMockData(
      getCurrentMockData({ profileTwoFactorAuth: nextProfileTwoFactorAuth })
    );
  };

  const handleProfileSecurityQuestionsConfiguredChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextProfileSecurityQuestionsConfigured = e.target.checked;
    setProfileSecurityQuestionsConfigured(
      nextProfileSecurityQuestionsConfigured
    );

    if (!isEnabled) {
      return;
    }

    stageMockData(
      getCurrentMockData({
        profileSecurityQuestionsConfigured:
          nextProfileSecurityQuestionsConfigured,
      })
    );
  };

  if (!tfaEnforcementPreset) {
    return null;
  }

  return (
    <li className="dev-tools__list-box__separator">
      <label title={tfaEnforcementPreset.desc || tfaEnforcementPreset.label}>
        <input
          checked={isEnabled}
          onChange={handleTogglePreset}
          type="checkbox"
        />
        {tfaEnforcementPreset.label}
      </label>
      {isEnabled && (
        <div style={{ marginLeft: 16, marginTop: 8 }}>
          <label style={{ display: 'block' }}>
            <input
              checked={tfaEnforced}
              onChange={handleTfaEnforcedChange}
              type="checkbox"
            />
            2FA enforced{' '}
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              (account settings / profile)
            </span>
          </label>
          <label
            style={{ display: 'block', marginTop: 4 }}
            title={
              tfaEnforced
                ? 'When checked, tfa-optional-users is empty (everyone enforced). When unchecked, user-0 is exempt.'
                : 'Only applies when account-level enforcement is enabled.'
            }
          >
            <input
              checked={enforceForAllUsers}
              disabled={!tfaEnforced}
              onChange={handleEnforceForAllUsersChange}
              type="checkbox"
            />
            Enforce 2FA for all users{' '}
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              (tfa-optional-users)
            </span>
          </label>
          <label
            style={{ display: 'block', marginTop: 4 }}
            title="When checked, GET /profile returns two_factor_auth: true (2FA already configured on the logged-in user)."
          >
            <input
              checked={profileTwoFactorAuth}
              onChange={handleProfileTwoFactorAuthChange}
              type="checkbox"
            />
            Profile 2FA configured{' '}
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              (profile two_factor_auth)
            </span>
          </label>
          <label
            style={{ display: 'block', marginTop: 4 }}
            title="When checked, GET /profile/security-questions returns 3 answered questions so the 2FA toggle is available."
          >
            <input
              checked={profileSecurityQuestionsConfigured}
              onChange={handleProfileSecurityQuestionsConfiguredChange}
              type="checkbox"
            />
            Security questions configured{' '}
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              (profile/security-questions)
            </span>
          </label>
        </div>
      )}
    </li>
  );
};
