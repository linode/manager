import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material';
import { ListItemButton } from '@mui/material';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Link } from 'src/components/Link';
import { ListItem } from 'src/components/ListItem';
import { Typography } from 'src/components/Typography';

import type { LinodeListItemProps } from './CheckedLinodeListItem';

/**
 * A removable list item for a Linode
 */
export const RemovableLinodeListItem = (props: LinodeListItemProps) => {
  const { linode, onClickListItem, ...listItemProps } = props;

  return (
    <ListItem
      {...listItemProps}
      secondaryAction={
        <IconButton onClick={() => onClickListItem(linode)} sx={{ padding: 0 }}>
          <Close />
        </IconButton>
      }
      key={linode.id}
      sx={{ padding: 0 }}
    >
      {/* TODO: unsure of the exact user flow, but based on the mockup, seems like each linode listed
      should have a link back to its detail page. Will change later if needed */}
      <ListItemButton sx={{ minHeight: '40px', padding: 0 }}>
        <StyledLink
          style={{ textDecoration: 'none' }}
          to={`/linodes/${linode.id}`}
        >
          <Typography
            sx={(theme) => ({ color: theme.textColors.linkActiveLight })}
            variant="body1"
          >
            {linode.label}
          </Typography>
        </StyledLink>
      </ListItemButton>
    </ListItem>
  );
};

const StyledLink = styled(Link, { label: 'StyledLink' })(({ theme }) => ({
  height: '100%',
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  width: '100%',
}));
