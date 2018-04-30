import * as React from 'react';
import createMuiTheme, { ThemeOptions } from 'material-ui/styles/createMuiTheme';
import { MuiThemeProvider } from 'material-ui/styles';

import LinodeLightTheme from 'src/theme';
import LinodeDarkTheme from 'src/darkTheme';

interface Props {
}

interface State {
  themeChoice: ThemeOptions;
  render: boolean;
}

const lightTheme = LinodeLightTheme;
const darkTheme = {
  ...LinodeLightTheme,
  ...LinodeDarkTheme,
};

class LinodeThemeWrapper extends React.Component<Props, State> {
  state = {
    themeChoice: lightTheme,
    render: true,
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

    /**
     * This re-renders the "themed" children upon theme change.
     * It's a workaround for some theme styles not being applied
     * upon switching the theme. Perhaps when we fully type our
     * theme using module augmentation, then we can remove this.
     * For now, it's fine, because switching the theme is rare.
     */
    this.setState(
      { render: false },
      () => { this.setState({ render: true }); },
    );
  }

  render() {
    const { themeChoice, render } = this.state;
    const theme = createMuiTheme(themeChoice as Linode.TodoAny);
    theme.shadows = theme.shadows.fill('none');
    return (
      <MuiThemeProvider theme={theme}>
        {render &&
          React.cloneElement(
            this.props.children as Linode.TodoAny,
            { toggleTheme: () => this.toggleTheme() },
          )
        }
      </MuiThemeProvider>
    );
  }
}

export default LinodeThemeWrapper;
