import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: '100%',
    overflow: 'auto',
    border: `1px solid ${theme.color.grey2}`,
  },
  table: {
    width: '100%',
    backgroundColor: theme.color.white,
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  numberCell: {
    backgroundColor: theme.color.grey2,
    paddingLeft: theme.spacing(1) / 2,
    paddingRight: theme.spacing(1) / 2,
    paddingTop: theme.spacing(1) / 4,
    paddingBottom: theme.spacing(1) / 4,
    fontSize: 14,
    textAlign: 'center',
    color: theme.color.headline,
    userSelect: 'none',
    width: 35,
  },
  codeCell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  code: {
    fontSize: '1em',
    margin: 0,
    color: theme.color.headline,
    whiteSpace: 'pre-wrap',
    width: '100%',
  },
}));

export interface Props {
  script: string;
}

type PropsWithStyles = Props;

export const ScriptCode: React.FC<PropsWithStyles> = (props) => {
  const classes = useStyles();

  const { script } = props;

  return (
    <div className={classes.container}>
      <table className={classes.table}>
        <tbody data-qa-script-code>
          {script.split('\n').map((line, counter) => (
            <tr key={'scriptCodeLine' + counter}>
              <td className={classes.numberCell}>{counter + 1}</td>
              <td className={classes.codeCell}>
                <pre className={classes.code} data-qa-script>
                  {line}
                </pre>
              </td>
            </tr>
          ))}
          {/* Empty row at the end */}
          <tr>
            <td className={classes.numberCell}>&nbsp;</td>
            <td className={classes.codeCell} />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScriptCode;
