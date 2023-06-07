import React, { ComponentClass } from 'react';
import { useHistory } from 'react-router-dom';
import {
  ListItemIcon,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

interface Props {
  title: string;
  description: string;
  link: string;
  Icon: ComponentClass<any, any>;
  handleClose: () => void;
}

export const AddNewMenuItem = (props: Props) => {
  const { title, description, Icon, link, handleClose } = props;
  const theme = useTheme();
  const history = useHistory();

  return (
    <MenuItem
      key={link}
      onClick={() => {
        history.push(link);
        handleClose();
      }}
      sx={{ paddingY: 1.5 }}
    >
      <ListItemIcon>
        <Icon width={20} height={20} color={theme.palette.text.primary} />
      </ListItemIcon>
      <Stack>
        <Typography variant="h3" color={theme.textColors.linkActiveLight}>
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </Stack>
    </MenuItem>
  );
};
