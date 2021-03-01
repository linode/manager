import * as React from 'react';
import { worker } from '../mocks/testBrowser';

export const ServiceWorkerTool: React.FC<{}> = (_) => {
  const _workerActive =
    localStorage.getItem('devTools/mock-service-worker-enabled') ?? 'disabled';
  const workerActive = _workerActive === 'enabled';

  React.useEffect(() => {
    if (workerActive) {
      worker.start();
    } else {
      worker.stop();
    }
  }, [workerActive]);

  const handleToggleWorker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    localStorage.setItem(
      'devTools/mock-service-worker-enabled',
      checked ? 'enabled' : 'disabled'
    );
    window.location.reload();
  };

  return (
    <>
      <span style={{ marginRight: 8 }}>
        <span style={{ marginRight: 8 }}>Mock Service Worker:</span>
        {workerActive ? 'Enabled' : 'Disabled'}
      </span>
      <input
        type="checkbox"
        checked={workerActive}
        onChange={(e) => handleToggleWorker(e)}
        style={{ margin: 0 }}
      />
    </>
  );
};

export default ServiceWorkerTool;
