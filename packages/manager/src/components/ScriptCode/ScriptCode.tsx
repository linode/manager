import { styled } from '@mui/material/styles';
import * as React from 'react';

interface ScriptCodeProps {
  script: string;
}

export const ScriptCode = (props: ScriptCodeProps) => {
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

const StyledContainer = styled('div', { label: 'StyledContainer' })(
  ({ theme }) => ({
    border: `1px solid ${theme.color.grey2}`,
    maxWidth: '100%',
    overflow: 'auto',
  })
);

const StyledTable = styled('table', { label: 'StyledTable' })(({ theme }) => ({
  backgroundColor: theme.color.white,
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  width: '100%',
}));

const StyledPre = styled('pre', { label: 'StyledPre' })(({ theme }) => ({
  color: theme.color.headline,
  fontSize: '1em',
  margin: 0,
  whiteSpace: 'pre-wrap',
  width: '100%',
}));

const StyledNumberCell = styled('td', { label: 'StyledNumberCell' })(
  ({ theme }) => ({
    backgroundColor: theme.color.grey2,
    color: theme.color.headline,
    fontSize: 14,
    paddingBottom: `calc(${theme.spacing(1)} / 4)`,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    paddingTop: `calc(${theme.spacing(1)} / 4)`,
    textAlign: 'center',
    userSelect: 'none',
    width: 35,
  })
);

const StyledCodeCell = styled('td', { label: 'StyledCodeCell' })(
  ({ theme }) => ({
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  })
);
