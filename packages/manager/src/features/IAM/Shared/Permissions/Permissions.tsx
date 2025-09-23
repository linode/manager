import { LinkButton, Typography } from '@linode/ui';
import { debounce } from '@mui/material';
import { Grid } from '@mui/material';
import * as React from 'react';

import { useCalculateHiddenItems } from '../../hooks/useCalculateHiddenItems';
import {
  StyledBox,
  StyledClampedContent,
  StyledContainer,
  StyledPermissionItem,
  StyledTitle,
} from './Permissions.style';

import type { PermissionType } from '@linode/api-v4/lib/iam/types';

type Props = {
  noPermissionsMessage?: string;
  permissions: PermissionType[];
};

export const Permissions = React.memo(({ permissions }: Props) => {
  const [showAll, setShowAll] = React.useState(false);

  const { calculateHiddenItems, containerRef, itemRefs, numHiddenItems } =
    useCalculateHiddenItems(permissions, showAll);

  const handleResize = React.useMemo(
    () => debounce(() => calculateHiddenItems(), 100),
    [calculateHiddenItems]
  );

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return (
    <Grid container data-testid="parent" direction="column">
      <StyledTitle>Permissions</StyledTitle>
      {!permissions.length ? (
        <Typography>
          This role doesn’t include permissions. Refer to the role description
          to understand what access is granted by this role.
        </Typography>
      ) : (
        <StyledContainer data-testid="container">
          <StyledClampedContent ref={containerRef} showAll={showAll}>
            {permissions.map((permission: PermissionType, index: number) => (
              <StyledPermissionItem
                data-testid="permission"
                key={permission}
                ref={(el: HTMLSpanElement) => {
                  itemRefs.current[index] = el;
                }}
              >
                {permission}
              </StyledPermissionItem>
            ))}
          </StyledClampedContent>

          {(numHiddenItems > 0 || showAll) && (
            <StyledBox>
              <LinkButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAll(!showAll);
                }}
                type="button"
              >
                {showAll ? 'Hide' : `Expand (+${numHiddenItems})`}
              </LinkButton>
            </StyledBox>
          )}
        </StyledContainer>
      )}
    </Grid>
  );
});
