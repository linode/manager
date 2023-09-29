import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import React from 'react';

export const MatchTypeInfo = () => {
  const types = [
    {
      description: 'Match is on a network path.',
      title: 'Path',
    },
    {
      description:
        'Match is based on both the name of the query and the single URL query value to match on.',
      title: 'Query String',
    },
    {
      description:
        'Match is based on both the name of a HTTP header and its value.',
      title: 'HTTP Header',
    },
    {
      description: 'Match is on the request method.',
      title: 'Method',
    },
  ];

  return (
    <List>
      {types.map(({ description, title }) => (
        <ListItem key={title} sx={{ paddingX: 0, paddingY: 0.5 }}>
          <ListItemText
            primary={title}
            primaryTypographyProps={{ fontSize: '14px', fontWeight: 'bold' }}
            secondary={description}
            secondaryTypographyProps={{ fontSize: '14px' }}
          />
        </ListItem>
      ))}
    </List>
  );
};
