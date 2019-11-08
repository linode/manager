import { RFB } from 'novnc-node';
import { omit } from 'ramda';
import * as React from 'react';

/* This is react-vnc-display from the following repo with minimal modifications
 * Ported here because the published node module included the `class` keyword,
 * which could not be minified by our build system.
 * https://github.com/mozilla-frontend-infra/react-vnc-display
 */

interface Props {
  url: string;
  onUpdateState?: (rfb: any, newState: string) => void;
  style?: any;
  encrypt?: boolean;
  wsProtocols?: string[];
  trueColor?: boolean;
  localCursor?: boolean;
  connectTimeout?: number;
  disconnectTimeout?: number;
  scale?: number;
  width?: number;
  height?: number;
  onResize?: (width: number, height: number) => void;
}

class VncDisplay extends React.PureComponent<Props> {
  static defaultProps: Props = {
    style: {},
    encrypt: false,
    wsProtocols: ['binary'],
    trueColor: true,
    localCursor: true,
    connectTimeout: 5,
    disconnectTimeout: 5,
    scale: 1,
    width: 1280,
    height: 720,
    url: ''
  };

  rfb: any;
  canvas: HTMLCanvasElement;
  sizeInterval: number;

  componentDidMount() {
    const { onResize } = this.props;
    this.connect();

    let lastWidth = 0;
    let lastHeight = 0;
    if (onResize) {
      this.sizeInterval = window.setInterval(() => {
        const width = +(this.canvas.getAttribute('width') || 1024);
        const height = +(this.canvas.getAttribute('height') || 768);
        if (onResize && (width !== lastWidth || height !== lastHeight)) {
          lastWidth = width;
          lastHeight = height;
          onResize(width, height);
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    this.disconnect();
    window.clearInterval(this.sizeInterval);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!this.rfb) {
      return;
    }

    if (nextProps.scale !== this.props.scale) {
      this.rfb.get_display().set_scale(nextProps.scale || 1);
      this.rfb.get_mouse().set_scale(nextProps.scale || 1);
    }
  }

  disconnect = () => {
    if (!this.rfb) {
      return;
    }

    this.rfb.disconnect();
    this.rfb = null;
  };

  connect = () => {
    this.disconnect();

    if (!this.canvas) {
      return;
    }

    const options = Object.assign(
      omit(['name', 'connectTimeout', 'url', 'width', 'height'], this.props),
      {
        encrypt: this.props.url.startsWith('wss:') || this.props.encrypt,
        target: this.canvas
      }
    );

    this.rfb = new RFB(options);
    this.rfb.connect(this.props.url);
    document.addEventListener('paste', this.handlePaste);
  };

  handleMouseEnter = () => {
    if (!this.rfb) {
      return;
    }

    (document.activeElement as HTMLElement).blur();
    this.rfb.get_keyboard().grab();
    this.rfb.get_mouse().grab();
  };

  handleMouseLeave = () => {
    if (!this.rfb) {
      return;
    }

    this.rfb.get_keyboard().ungrab();
    this.rfb.get_mouse().ungrab();
  };

  handlePaste = (event: ClipboardEvent) => {
    event.preventDefault();
    if (!this.rfb) {
      return;
    }
    if (event.clipboardData === null) {
      return;
    }
    if (event.clipboardData.getData('text') === null) {
      return;
    }
    this.rfb.get_keyboard().ungrab();
    this.rfb.get_mouse().ungrab();
    this.rfb.get_keyboard().ungrab();
    const text = event.clipboardData.getData('text');
    const pasteNextCharacter = (contentArray: string[]) => {
      const character = contentArray.shift();
      if (typeof character === 'undefined') {
        return;
      }
      const code = character.charCodeAt(0);
      const needs_shift = character.match(/[A-Z!@#$%^&*()_+{}:\"<>?~|]/);

      if (character.match(/\n/)) {
        this.rfb.sendKey(0xff0d, 1);
        this.rfb.sendKey(0xff0d, 0);
      } else {
        if (needs_shift) {
          this.rfb.sendKey(0xffe1, 1);
        }
        this.rfb.sendKey(code, 1);
        this.rfb.sendKey(code, 0);
        if (needs_shift) {
          this.rfb.sendKey(0xffe1, 0);
        }
      }

      if (contentArray.length > 0) {
        setTimeout(() => {
          pasteNextCharacter(contentArray);
        }, 10);
      }
    };
    pasteNextCharacter(text.split(''));
  };

  getCanvas = (el: HTMLCanvasElement) => {
    this.canvas = el;
  };

  render() {
    return (
      <canvas
        style={this.props.style}
        ref={this.getCanvas}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      />
    );
  }
}

export default VncDisplay;
