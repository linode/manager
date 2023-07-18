import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import ExternalLink from 'src/components/ExternalLink';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';

export const PopularPosts = () => {
  const theme = useTheme();

  const withSeparator = {
    borderLeft: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      borderLeft: 'none',
      marginTop: theme.spacing(4),
      paddingLeft: 0,
    },
  };

  const renderPopularDocs = () => {
    return (
      <React.Fragment>
        <StyledPostDiv>
          <StyledExternalLink
            absoluteIcon
            link="https://www.linode.com/docs/getting-started/"
            text="Getting Started with Linode"
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            absoluteIcon
            link="https://www.linode.com/docs/security/securing-your-server/"
            text="How to Secure Your Server"
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            absoluteIcon
            link="https://www.linode.com/docs/troubleshooting/troubleshooting/"
            text="Troubleshooting"
          />
        </StyledPostDiv>
      </React.Fragment>
    );
  };

  const renderPopularForumPosts = () => {
    return (
      <React.Fragment>
        <StyledPostDiv>
          <StyledExternalLink
            absoluteIcon
            link="https://www.linode.com/community/questions/323/my-linode-is-unreachable-after-maintenance"
            text="My Linode is unreachable after maintenance"
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            absoluteIcon
            link="https://www.linode.com/community/questions/232/why-is-my-website-so-slow"
            text="Why is my website so slow?"
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            absoluteIcon
            link="https://www.linode.com/community/questions/19082/i-just-created-my-first-linode-and-i-cant-send-emails-why"
            text="Ports 25, 465, and 587 blocked?"
          />
        </StyledPostDiv>
      </React.Fragment>
    );
  };

  return (
    <Paper sx={{ margin: `${theme.spacing(6)} 0` }} variant="outlined">
      <Grid container>
        <Grid data-qa-documentation-link sm={6} xs={12}>
          <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h3">
            Most Popular Documentation:
          </Typography>
          {renderPopularDocs()}
        </Grid>
        <Grid data-qa-community-link sm={6} sx={withSeparator} xs={12}>
          <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h3">
            Most Popular Community Posts:
          </Typography>
          {renderPopularForumPosts()}
        </Grid>
      </Grid>
    </Paper>
  );
};

const StyledPostDiv = styled('div', {
  label: 'StyledPostItem',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  ...theme.typography.body1,
}));

const StyledExternalLink = styled(ExternalLink, {
  label: 'StyledExternalLink',
})(({ theme }) => ({
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
  },
  color: theme.textColors.linkActiveLight,
}));
