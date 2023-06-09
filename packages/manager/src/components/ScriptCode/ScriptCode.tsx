import { styled } from '@mui/material/styles';
import * as React from 'react';

interface Props {
  script: string;
}

export const ScriptCode = (props: Props) => {
  const { script } = props;

  return (
    <StyledContainer>
      <StyledTable>
        <tbody data-qa-script-code>
          {script.split('\n').map((line, counter) => (
            <tr key={'scriptCodeLine' + counter}>
              <StyledNumberCell>{counter + 1}</StyledNumberCell>
              <StyledCodeCell>
                <StyledPre data-qa-script>{line}</StyledPre>
              </StyledCodeCell>
            </tr>
          ))}
          {/* Empty row at the end */}
          <tr>
            <StyledNumberCell>&nbsp;</StyledNumberCell>
            <StyledCodeCell />
          </tr>
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};

const StyledContainer = styled('div')(({ theme }) => ({
  maxWidth: '100%',
  overflow: 'auto',
  border: `1px solid ${theme.color.grey2}`,
}));

const StyledTable = styled('table')(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.color.white,
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
}));

const StyledPre = styled('pre')(({ theme }) => ({
  fontSize: '1em',
  margin: 0,
  color: theme.color.headline,
  whiteSpace: 'pre-wrap',
  width: '100%',
}));

const StyledNumberCell = styled('td')(({ theme }) => ({
  backgroundColor: theme.color.grey2,
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  paddingTop: `calc(${theme.spacing(1)} / 4)`,
  paddingBottom: `calc(${theme.spacing(1)} / 4)`,
  fontSize: 14,
  textAlign: 'center',
  color: theme.color.headline,
  userSelect: 'none',
  width: 35,
}));

const StyledCodeCell = styled('td')(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
}));
