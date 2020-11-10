import * as React from 'react';
import { worker } from '../mocks/testBrowser';

export const ServiceWorkerTool: React.FC<{}> = _ => {
  const _workerActive =
    localStorage.getItem('mock-service-worker-enabled') ?? 'disabled';
  const workerActive = _workerActive === 'enabled';

  React.useEffect(() => {
    if (workerActive) {
      worker.start();
    }
  }, [workerActive]);

  const handleToggleWorker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (!checked) {
      worker.stop();
    }
    localStorage.setItem(
      'mock-service-worker-enabled',
      e.target.checked ? 'enabled' : 'disabled'
    );
    window.location.reload();
  };

  return (
    <>
      <span>Mock Service Worker: {workerActive ? 'Enabled' : 'Disabled'}</span>
      <input
        type="checkbox"
        checked={workerActive}
        onChange={e => handleToggleWorker(e)}
      />
    </>
  );
};

export default ServiceWorkerTool;
