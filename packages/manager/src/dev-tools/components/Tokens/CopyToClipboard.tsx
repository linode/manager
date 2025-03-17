import * as React from 'react';
// import { CopyToClipboard } from 'react-copy-to-clipboard';

// import './copyToClipboard.css';

interface CopyToClipboardProps {
  /**
   * The text to copy to the clipboard
   */
  text: string;
}

export const CopyToClipboardIcon = ({ text }: CopyToClipboardProps) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const onCopy = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    // <CopyToClipboard text={text} onCopy={onCopy}>
    <span className="copy-to-clipboard">
      <svg
        height={16}
        version="1.1"
        viewBox="0 0 24 24"
        width={16}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
          <g fillRule="nonzero" id="cti">
            <path d="M5.50280381,4.62704038 L5.5,6.75 L5.5,17.2542087 C5.5,19.0491342 6.95507456,20.5042087 8.75,20.5042087 L17.3662868,20.5044622 C17.057338,21.3782241 16.2239751,22.0042087 15.2444057,22.0042087 L8.75,22.0042087 C6.12664744,22.0042087 4,19.8775613 4,17.2542087 L4,6.75 C4,5.76928848 4.62744523,4.93512464 5.50280381,4.62704038 Z M17.75,2 C18.9926407,2 20,3.00735931 20,4.25 L20,17.25 C20,18.4926407 18.9926407,19.5 17.75,19.5 L8.75,19.5 C7.50735931,19.5 6.5,18.4926407 6.5,17.25 L6.5,4.25 C6.5,3.00735931 7.50735931,2 8.75,2 L17.75,2 Z M17.75,3.5 L8.75,3.5 C8.33578644,3.5 8,3.83578644 8,4.25 L8,17.25 C8,17.6642136 8.33578644,18 8.75,18 L17.75,18 C18.1642136,18 18.5,17.6642136 18.5,17.25 L18.5,4.25 C18.5,3.83578644 18.1642136,3.5 17.75,3.5 Z" />
          </g>
        </g>
      </svg>
      {isCopied && <span className="copied">Copied to clipboard</span>}
    </span>
    // </CopyToClipboard>
  );
};
