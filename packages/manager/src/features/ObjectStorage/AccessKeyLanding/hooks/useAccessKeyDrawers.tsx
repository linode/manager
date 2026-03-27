import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';

type AccessKeyDrawerType =
  | 'access-key-hostnames'
  | 'access-key-permissions'
  | 'create-access-key'
  | 'edit-access-key';

const ACCESS_KEYS_BASE_URL = '/object-storage/access-keys';

interface AccessKeyDrawerState {
  accessKeyId?: number;
  type: AccessKeyDrawerType;
}

export const useAccessKeyDrawers = () => {
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });
  const { accessKeyId } = useParams({ strict: false });

  function getDrawer(): AccessKeyDrawerState | null {
    switch (routeId) {
      case `${ACCESS_KEYS_BASE_URL}/$accessKeyId/edit`:
        return { accessKeyId, type: 'edit-access-key' };
      case `${ACCESS_KEYS_BASE_URL}/$accessKeyId/hostnames`:
        return { accessKeyId, type: 'access-key-hostnames' };
      case `${ACCESS_KEYS_BASE_URL}/$accessKeyId/permissions`:
        return { accessKeyId, type: 'access-key-permissions' };
      case `${ACCESS_KEYS_BASE_URL}/create`:
        return { type: 'create-access-key' };
      default:
        return null;
    }
  }

  function openDrawer(drawer: AccessKeyDrawerType, accessKeyId?: number) {
    switch (drawer) {
      case 'access-key-hostnames':
        navigate({
          to: `${ACCESS_KEYS_BASE_URL}/${accessKeyId}/hostnames`,
        });
        break;
      case 'access-key-permissions':
        navigate({
          to: `${ACCESS_KEYS_BASE_URL}/${accessKeyId}/permissions`,
        });
        break;
      case 'create-access-key':
        navigate({ to: `${ACCESS_KEYS_BASE_URL}/create` });
        break;
      case 'edit-access-key':
        navigate({
          to: `${ACCESS_KEYS_BASE_URL}/${accessKeyId}/edit`,
        });
        break;
    }
  }

  function closeDrawer() {
    navigate({ to: ACCESS_KEYS_BASE_URL });
  }

  return {
    drawer: useMemo(() => getDrawer(), [routeId]),
    openDrawer,
    closeDrawer,
  };
};
