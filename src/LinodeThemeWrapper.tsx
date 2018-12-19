import * as React from 'react';
import { MuiThemeProvider } from 'src/components/core/styles';
import { dark, light } from 'src/themes';
import { theme as themeStorage } from 'src/utilities/storage';

interface State {
  themeChoice: 'light' | 'dark';
}
type RenderChildren = (toggle: () => void) => React.ReactNode;
interface Props {
  children: RenderChildren | React.ReactNode;
}

const themes = { light, dark }

class LinodeThemeWrapper extends React.Component<Props, State> {
  state: State = {
    themeChoice: 'light',
  };

  componentDidUpdate() {
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 500)
  }

  componentDidMount() {
    if (themeStorage.get() === 'dark') {
      return this.setState({ themeChoice: 'dark' });
    }

    return this.setState({ themeChoice: 'light' });
  }

  toggleTheme = () => {
    document.body.classList.add('no-transition');
    if (this.state.themeChoice === 'light') {
      this.setState({ themeChoice: 'dark' });
      themeStorage.set('dark');
    } else {
      this.setState({ themeChoice: 'light' });
      themeStorage.set('light');
    }
  }

  render() {
    const { children } = this.props;
    const { themeChoice } = this.state;
    const theme = themes[themeChoice];

    return (
      <MuiThemeProvider theme={theme}>
        {isRenderChildren(children) ? children(this.toggleTheme) : children}
      </MuiThemeProvider>
    );
  }
}
const isRenderChildren = (c: RenderChildren | React.ReactNode): c is RenderChildren => {
  return typeof c === 'function';
};

export default LinodeThemeWrapper;
