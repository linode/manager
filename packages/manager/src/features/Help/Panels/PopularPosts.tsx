import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';

export const PopularPosts = () => {
  const theme = useTheme();

  const withSeparator = {
    borderLeft: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      borderLeft: 'none',
      paddingLeft: 0,
      marginTop: theme.spacing(4),
    },
  };

  const renderPopularDocs = () => {
    return (
      <React.Fragment>
        <StyledPostDiv>
          <StyledExternalLink
            link="https://www.linode.com/docs/getting-started/"
            text="Getting Started with Linode"
            absoluteIcon
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            link="https://www.linode.com/docs/security/securing-your-server/"
            text="How to Secure Your Server"
            absoluteIcon
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            link="https://www.linode.com/docs/troubleshooting/troubleshooting/"
            text="Troubleshooting"
            absoluteIcon
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
            link="https://www.linode.com/community/questions/323/my-linode-is-unreachable-after-maintenance"
            text="My Linode is unreachable after maintenance"
            absoluteIcon
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            link="https://www.linode.com/community/questions/232/why-is-my-website-so-slow"
            text="Why is my website so slow?"
            absoluteIcon
          />
        </StyledPostDiv>
        <StyledPostDiv>
          <StyledExternalLink
            link="https://www.linode.com/community/questions/19082/i-just-created-my-first-linode-and-i-cant-send-emails-why"
            text="Ports 25, 465, and 587 blocked?"
            absoluteIcon
          />
        </StyledPostDiv>
      </React.Fragment>
    );
  };

  return (
    <Paper sx={{ margin: `${theme.spacing(6)} 0` }} variant="outlined">
      <Grid container>
        <Grid xs={12} sm={6} data-qa-documentation-link>
          <Typography variant="h3" sx={{ marginBottom: theme.spacing(2) }}>
            Most Popular Documentation:
          </Typography>
          {renderPopularDocs()}
        </Grid>
        <Grid xs={12} sm={6} sx={withSeparator} data-qa-community-link>
          <Typography variant="h3" sx={{ marginBottom: theme.spacing(2) }}>
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

const StyledExternalLink = styled(ExternalLink)(({ theme }) => ({
  color: theme.textColors.linkActiveLight,
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
  },
}));
