import { styled } from '@mui/material/styles';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';

interface AutoEnrollProps {
  enabled: boolean;
  error?: string;
  toggle: () => void;
}

export const AutoEnroll = (props: AutoEnrollProps) => {
  const { enabled, error, toggle } = props;

  return (
    <StyledPaper>
      {error && <Notice error text={error} />}
      <StyledFormControlLabel
        label={
          <StyledDiv>
            <StyledTypography>
              Auto Enroll All New Linodes in Backups
            </StyledTypography>
            <Typography variant="body1">
              Enroll all future Linodes in backups. Your account will be billed
              the additional hourly rate noted on the{' '}
              <Link
                data-qa-backups-price
                to="https://www.linode.com/products/backups/"
              >
                Backups pricing page
              </Link>
            </Typography>
          </StyledDiv>
        }
        control={<Toggle checked={enabled} onChange={toggle} />}
      />
    </StyledPaper>
  );
};

const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  backgroundColor: theme.bg.offWhite,
  padding: theme.spacing(1),
}));

const StyledFormControlLabel = styled(FormControlLabel, {
  label: 'StyledFormControlLabel',
})(({ theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  marginBottom: theme.spacing(1),
  marginLeft: 0,
}));

const StyledDiv = styled('div', {
  label: 'StyledDiv',
})(({ theme }) => ({
  marginTop: theme.spacing(1.5),
}));

const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  fontSize: 17,
  marginBottom: theme.spacing(1),
}));
