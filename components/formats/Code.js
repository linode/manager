import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Highlight from 'react-highlight';
import ClipboardButton from 'react-clipboard.js';


const DEFAULT_CLIPBOARD_ICON = 'fa-clipboard';
const languageMap = {
  curl: 'bash',
};

export default class Code extends Component {
  constructor() {
    super();

    this.state = { clipboardIcon: DEFAULT_CLIPBOARD_ICON };
  }

  onClickCopy = () => {
    if (this.state.clipboardIcon === DEFAULT_CLIPBOARD_ICON) {
      this.setState({ clipboardIcon: 'fa-check' }, () => {
        setTimeout(() => {
          this.setState({ clipboardIcon: DEFAULT_CLIPBOARD_ICON });
        }, 2500);
      });
    }
  };

  render() {
    const { example, language, noclipboard } = this.props;
    const { clipboardIcon } = this.state;

    const lowerCaseLanguage = language.toLowerCase();
    const languageName = languageMap[lowerCaseLanguage] ?
      languageMap[lowerCaseLanguage] : lowerCaseLanguage;

    let clipboardButton;
    if (!noclipboard) {
      clipboardButton = (
        <ClipboardButton
          className="Code-clipboardButton"
          data-clipboard-text={example}
          onClick={this.onClickCopy}
        >
          <i className={`fa ${clipboardIcon}`}></i>
        </ClipboardButton>
      );
    }

    // TODO: replace this Highlight component... It's tiny and terrible.
    return (
      <div className="Code">
        <Highlight className={`language-${languageName} hljs`}>
          {example}
        </Highlight>
        {clipboardButton}
      </div>
    );
  }
}

Code.propTypes = {
  example: PropTypes.string,
  language: PropTypes.string,
  noclipboard: PropTypes.bool,
};

Code.defaultProps = {
  noclipboard: false,
  language: 'bash',
};
