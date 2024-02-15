// useLinodeActionVisibility.ts
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

interface UseLinodeActionVisibilityProps {
  inListView?: boolean;
  linodeId: number;
}

export const useLinodeActionVisibility = ({
  inListView,
  linodeId,
}: UseLinodeActionVisibilityProps) => {
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const isVisible = inListView || matchesSmDown;

  const isLinodeReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: linodeId,
  });

  return { isLinodeReadOnly, isVisible };
};
