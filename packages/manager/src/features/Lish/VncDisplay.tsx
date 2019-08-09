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

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
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
