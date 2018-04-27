import * as React from 'react';
import createMuiTheme, { ThemeOptions } from 'material-ui/styles/createMuiTheme';
import { MuiThemeProvider } from 'material-ui/styles';
import LinodeLightTheme from 'src/theme';
import LinodeDarkTheme from 'src/darkTheme';

interface Props { }

interface State {
  themeChoice: ThemeOptions;
}

const lightTheme = LinodeLightTheme;
const darkTheme = {
  ...LinodeLightTheme,
  ...LinodeDarkTheme,
};

class LinodeThemeWrapper extends React.Component<Props, State> {
  state = {
    themeChoice: lightTheme,
  };

  componentDidMount() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey && e.code === 'KeyD') {
        this.toggleTheme();
      }
    });
  }

  toggleTheme = () => {
    if (this.state.themeChoice === lightTheme) {
      this.setState({ themeChoice: darkTheme });
    } else {
      this.setState({ themeChoice: lightTheme });
    }
  }

  render() {
    const { themeChoice } = this.state;
    const theme = createMuiTheme(themeChoice as Linode.TodoAny);
    theme.shadows = theme.shadows.fill('none');
    return (
      <MuiThemeProvider theme={theme}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}

export default LinodeThemeWrapper;
