import { useImageShareGroupsQuery } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  Dialog,
  styled,
  Typography,
  ZeroStateSearchNarrowIcon,
} from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

interface ImageShareGroupsDialogProps {
  imageId: string | undefined;
  onClose: () => void;
  open: boolean;
  title: string;
}

export const ImageShareGroupsDialog = (props: ImageShareGroupsDialogProps) => {
  const { onClose, open, title, imageId } = props;

  const {
    data: sharegroups,
    isLoading,
    error,
  } = useImageShareGroupsQuery(imageId ?? '', {}, {}, !!imageId);

  const sharegroupCount = sharegroups?.data.length ?? 0;

  return (
    <Dialog
      closeIconPendoId="Images Library-View Share Groups Dialog-X Button"
      error={error}
      isFetching={isLoading}
      onClose={onClose}
      open={open}
      title={title}
    >
      {sharegroupCount === 0 && (
        <StyledEmptyStateContainer>
          <ZeroStateSearchNarrowIcon />
          <Typography variant="h3">
            This Image is not shared within any share groups.
          </Typography>
        </StyledEmptyStateContainer>
      )}
      {!error && sharegroupCount > 0 && (
        <>
          <Typography>
            This Image is shared within the following share groups:
          </Typography>
          <ul>
            {sharegroups?.data.map((sharegroup) => (
              <li key={sharegroup.id}>
                <Link to={`/images/share-groups/owned-groups/${sharegroup.id}`}>
                  {sharegroup.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <ActionsPanel
        secondaryButtonProps={{
          buttonType: 'outlined',
          label: 'Close',
          onClick: onClose,
        }}
      />
    </Dialog>
  );
};

const StyledEmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacingFunction(4),
  p: `${theme.spacingFunction(24)} ${theme.spacingFunction(32)}`,
  width: '100%',
}));
