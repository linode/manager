import { useMatch, useNavigate } from '@tanstack/react-router';

type AccessKeyDrawers =
  | 'access-key-hostnames'
  | 'access-key-permissions'
  | 'create-access-key'
  | 'edit-access-key';

const ACCESS_KEYS_BASE_URL = '/object-storage/access-keys';

export const useAccessKeyDrawers = () => {
  const navigate = useNavigate();
  const { routeId } = useMatch({ strict: false });

  function getDrawer(): AccessKeyDrawers | null {
    switch (routeId) {
      case `${ACCESS_KEYS_BASE_URL}/$accessKeyId/edit`:
        return 'edit-access-key';
      case `${ACCESS_KEYS_BASE_URL}/$accessKeyId/hostnames`:
        return 'access-key-hostnames';
      case `${ACCESS_KEYS_BASE_URL}/$accessKeyId/permissions`:
        return 'access-key-permissions';
      case `${ACCESS_KEYS_BASE_URL}/create`:
        return 'create-access-key';
      default:
        return null;
    }
  }

  function openDrawer(drawer: AccessKeyDrawers, accessKeyId?: number) {
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
    drawer: getDrawer(),
    openDrawer,
    closeDrawer,
  };
};
