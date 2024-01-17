import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

export const MatchTypeInfo = () => {
  const types = [
    {
      description:
        'Match is based on both the name of a HTTP header and its value.',
      title: 'HTTP Header',
    },
    {
      description: 'Match is on the request method.',
      title: 'HTTP Method',
    },
    {
      description: 'Match is on a network path.',
      title: 'Path',
    },
    {
      description:
        'Match is based on both the name of the query and the single URL query value to match on.',
      title: 'Query String',
    },
  ];

  return (
    <List>
      {types.map(({ description, title }) => (
        <ListItem key={title} sx={{ paddingX: 0.5 }}>
          <ListItemText
            primaryTypographyProps={{
              sx: (theme) => ({
                fontFamily: theme.font.bold,
                fontSize: '14px',
              }),
            }}
            primary={title}
            secondary={description}
            secondaryTypographyProps={{ fontSize: '14px' }}
          />
        </ListItem>
      ))}
    </List>
  );
};
