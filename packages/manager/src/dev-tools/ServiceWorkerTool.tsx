import * as React from 'react';

const LOCAL_STORAGE_KEY = 'msw';

export const isMSWEnabled =
  localStorage.getItem(LOCAL_STORAGE_KEY) === 'enabled';

export const setMSWEnabled = (enabled: boolean) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, enabled ? 'enabled' : 'disabled');
  window.location.reload();
};

export const ServiceWorkerTool = () => {
  return (
    <>
      <span style={{ marginRight: 8 }}>
        <span style={{ marginRight: 8 }}>Mock Service Worker:</span>
        {isMSWEnabled ? 'Enabled' : 'Disabled'}
      </span>
      <input
        checked={isMSWEnabled}
        onChange={(e) => setMSWEnabled(e.target.checked)}
        style={{ margin: 0 }}
        type="checkbox"
      />
    </>
  );
};
