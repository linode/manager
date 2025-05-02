import { Stack } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { EnableTableStriping } from './EnableTableStriping';
import { MaskSensitiveData } from './MaskSensitiveData';
import { Notifications } from './Notifications';
import { PreferenceEditor } from './PreferenceEditor';
import { Theme } from './Theme';
import { TypeToConfirm } from './TypeToConfirm';

export const ProfileSettings = () => {
  const location = useLocation();
  const history = useHistory();

  const queryParams = new URLSearchParams(location.search);

  const isPreferenceEditorOpen = queryParams.has('preferenceEditor');

  const handleClosePreferenceEditor = () => {
    queryParams.delete('preferenceEditor');
    history.replace({ search: queryParams.toString() });
  };

  return (
    <>
      <DocumentTitleSegment segment="My Settings" />
      <Stack spacing={2}>
        <Notifications />
        <Theme />
        <TypeToConfirm />
        <MaskSensitiveData />
        <EnableTableStriping />
      </Stack>
      <PreferenceEditor
        onClose={handleClosePreferenceEditor}
        open={isPreferenceEditorOpen}
      />
    </>
  );
};

export const SettingsLazyRoute = createLazyRoute('/profile/settings')({
  component: ProfileSettings,
});
