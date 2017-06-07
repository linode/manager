import React, { Component, PropTypes } from 'react';
import Highlight from 'react-highlight';
import ClipboardButton from 'react-clipboard.js';


const DEFAULT_CLIPBOARD_ICON = 'fa-clipboard';
const languageMap = {
  curl: 'bash'
};

export default class Example extends Component {

  constructor() {
    super();

    this.onClickCopy = this.onClickCopy.bind(this);

    this.state = { clipboardIcon: DEFAULT_CLIPBOARD_ICON };
  }

  onClickCopy() {
    if (this.state.clipboardIcon === DEFAULT_CLIPBOARD_ICON) {
      this.setState({ clipboardIcon: 'fa-check' }, () => {
        setTimeout(() => {
          this.setState({ clipboardIcon: DEFAULT_CLIPBOARD_ICON });
        }, 2500)
      });
    }
  }

  render() {
    const { example, name, noclipboard } = this.props;
    const { clipboardIcon } = this.state;

    const lowerCaseName = name.toLowerCase();
    const language = languageMap[lowerCaseName] ? languageMap[lowerCaseName] : lowerCaseName;

    let clipboardButton;
    if (!noclipboard) {
      clipboardButton = (
        <ClipboardButton className="Example-clipboardButton" data-clipboard-text={example} onClick={this.onClickCopy}>
          <i className={`fa ${clipboardIcon}`}></i>
        </ClipboardButton>
      );
    }

    return (
      <div className="Example">
        <Highlight className={`language-${language}`}>
          {example}
        </Highlight>
        {clipboardButton}
      </div>
    );
  }
};

Example.propTypes = {
  noclipboard: PropTypes.bool
};

Example.defaultProps = {
  noclipboard: false
};
