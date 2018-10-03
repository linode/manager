import * as React from 'react';

import { MuiThemeProvider } from '@material-ui/core/styles';

import { dark, light } from 'src/themes';
import { theme as themeStorage } from 'src/utilities/storage';

import { init } from './events';

interface State {
  themeChoice: 'light' | 'dark';
  render: boolean;
}

const themes = { light, dark }

class LinodeThemeWrapper extends React.Component<{}, State> {
  state: State = {
    themeChoice: 'light',
    render: true,
  };

  componentDidMount() {
    if (themeStorage.get() === 'dark') {
      this.setState({
        themeChoice: 'dark'
      });
    }
    else {
      this.setState({
        themeChoice: 'light'
      });
    }

    this.forceUpdate();
  }

  toggleTheme = () => {
    if (this.state.themeChoice === 'light') {
      this.setState({ themeChoice: 'dark' });
      themeStorage.set('dark');
    } else {
      this.setState({ themeChoice: 'light' });
      themeStorage.set('light');
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
      () => { this.setState({ render: true }); init(); },
    );
  }

  render() {
    const { themeChoice, render } = this.state;
    const theme = themes[themeChoice];
    return (
      <React.Fragment>
        {render &&
          <MuiThemeProvider theme={theme}>
            {React.cloneElement(
              this.props.children as Linode.TodoAny,
              {
                toggleTheme: () => this.toggleTheme(),
              },
            )}
          </MuiThemeProvider>
        }
      </React.Fragment>
    );
  }
}

export default LinodeThemeWrapper;
