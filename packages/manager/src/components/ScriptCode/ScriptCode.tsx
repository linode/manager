import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type CSSClasses =
  | 'root'
  | 'container'
  | 'table'
  | 'row'
  | 'numberCell'
  | 'codeCell'
  | 'code';

const styles: StyleRulesCallback<CSSClasses> = theme => {
  return {
    root: {},
    container: {
      maxWidth: '100%',
      overflow: 'auto',
      border: `1px solid ${theme.color.grey2}`
    },
    table: {
      width: '100%',
      backgroundColor: theme.color.white,
      borderCollapse: 'collapse',
      tableLayout: 'fixed'
    },
    row: {},
    numberCell: {
      backgroundColor: theme.color.grey2,
      paddingLeft: theme.spacing.unit / 2,
      paddingRight: theme.spacing.unit / 2,
      paddingTop: theme.spacing.unit / 4,
      paddingBottom: theme.spacing.unit / 4,
      fontSize: 14,
      textAlign: 'center',
      color: theme.color.headline,
      userSelect: 'none',
      width: 35
    },
    codeCell: {
      paddingLeft: theme.spacing.unit,
      paddingRight: theme.spacing.unit
    },
    code: {
      fontSize: '1em',
      margin: 0,
      color: theme.color.headline,
      whiteSpace: 'pre-wrap',
      width: '100%'
    }
  };
};

export interface Props {
  script: string;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

export class ScriptCode extends React.Component<PropsWithStyles, {}> {
  render() {
    const { classes, script } = this.props;

    return (
      <div className={classes.container}>
        <table className={classes.table}>
          <tbody data-qa-script-code>
            {script.split('\n').map((line, counter) => (
              <tr className={classes.row} key={'scriptCodeLine' + counter}>
                <td className={classes.numberCell}>{counter + 1}</td>
                <td className={classes.codeCell}>
                  <pre className={classes.code} data-qa-script>
                    {line}
                  </pre>
                </td>
              </tr>
            ))}
            {/* Empty row at the end */}
            <tr className={classes.row}>
              <td className={classes.numberCell}>&nbsp;</td>
              <td className={classes.codeCell} />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(ScriptCode);
