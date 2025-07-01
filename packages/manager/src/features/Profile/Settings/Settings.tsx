import { Stack } from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { MaskSensitiveData } from './MaskSensitiveData';
import { Notifications } from './Notifications';
import { PreferenceEditor } from './PreferenceEditor';
import { TableStriping } from './TableStriping';
import { Theme } from './Theme';
import { TypeToConfirm } from './TypeToConfirm';

export const ProfileSettings = () => {
  const navigate = useNavigate();
  const { preferenceEditor } = useSearch({ from: '/profile/settings' });

  const isPreferenceEditorOpen = !!preferenceEditor;

  const handleClosePreferenceEditor = () => {
    navigate({
      to: '/profile/settings',
      search: { preferenceEditor: undefined },
    });
  };

  return (
    <>
      <DocumentTitleSegment segment="My Settings" />
      <Stack spacing={2}>
        <Notifications />
        <Theme />
        <TypeToConfirm />
        <MaskSensitiveData />
        <TableStriping />
      </Stack>
      <PreferenceEditor
        onClose={handleClosePreferenceEditor}
        open={isPreferenceEditorOpen}
      />
    </>
  );
};
