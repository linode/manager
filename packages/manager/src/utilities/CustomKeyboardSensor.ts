// Customizing `KeyboardSensor` from `dnd-kit` to meet our requirements:
// - Prevent scrolling while using keyboard keys (for both normal and smaller window sizes).
//   * This resolves the issue of keystrokes not being recognized or having no effect on smaller screens.
// - Add a focus style to the draggable element while it is being dragged.
// - Clear the focus style when the draggable element is dropped.

import { KeyboardCode, defaultCoordinates } from '@dnd-kit/core';
import {
  add as getAdjustedCoordinates,
  subtract as getCoordinatesDelta,
  getOwnerDocument,
  getWindow,
  isKeyboardEvent,
} from '@dnd-kit/utilities';

import type {
  Activators,
  KeyboardCodes,
  KeyboardCoordinateGetter,
  KeyboardSensorOptions,
  KeyboardSensorProps,
  SensorInstance,
} from '@dnd-kit/core';
import type { Coordinates } from '@dnd-kit/utilities';

class Listeners {
  private listeners: [
    string,
    EventListenerOrEventListenerObject,
    AddEventListenerOptions | boolean | undefined
  ][] = [];

  public removeAll = () => {
    this.listeners.forEach((listener) =>
      this.target?.removeEventListener(...listener)
    );
  };

  constructor(private target: EventTarget | null) {}

  public add<T extends Event>(
    eventName: string,
    handler: (event: T) => void,
    options?: AddEventListenerOptions | boolean
  ) {
    // eslint-disable-next-line scanjs-rules/call_addEventListener
    this.target?.addEventListener(eventName, handler as EventListener, options);
    this.listeners.push([eventName, handler as EventListener, options]);
  }
}

const defaultKeyboardCodes: KeyboardCodes = {
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter],
  start: [KeyboardCode.Space, KeyboardCode.Enter],
};

const defaultKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates }
) => {
  switch (event.code) {
    case KeyboardCode.Right:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x + 25,
      };
    case KeyboardCode.Left:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x - 25,
      };
    case KeyboardCode.Down:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y + 25,
      };
    case KeyboardCode.Up:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y - 25,
      };
  }

  return undefined;
};

enum EventName {
  Click = 'click',
  ContextMenu = 'contextmenu',
  DragStart = 'dragstart',
  Keydown = 'keydown',
  Resize = 'resize',
  SelectionChange = 'selectionchange',
  VisibilityChange = 'visibilitychange',
}

export class CustomKeyboardSensor implements SensorInstance {
  static activators: Activators<KeyboardSensorOptions> = [
    {
      eventName: 'onKeyDown' as const,
      handler: (
        event: React.KeyboardEvent,
        { keyboardCodes = defaultKeyboardCodes, onActivation },
        { active }
      ) => {
        const { code } = event.nativeEvent;

        if (keyboardCodes.start.includes(code)) {
          const activator = active.activatorNode.current;

          if (activator && event.target !== activator) {
            return false;
          }

          event.preventDefault();
          onActivation?.({ event: event.nativeEvent });

          return true;
        }

        return false;
      },
    },
  ];
  private listeners: Listeners;
  private referenceCoordinates: Coordinates | undefined;
  private windowListeners: Listeners;

  public autoScrollEnabled = false;

  constructor(private props: KeyboardSensorProps) {
    const {
      event: { target },
    } = props;

    this.props = props;
    this.listeners = new Listeners(getOwnerDocument(target));
    this.windowListeners = new Listeners(getWindow(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);

    this.attach();
  }

  private attach() {
    this.handleStart();

    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);

    // Add a focus style to the draggable element while it is being dragged.
    const activator = this.props.activeNode.node.current;
    if (activator) {
      activator.style.outline = '1px dashed grey';
    }

    setTimeout(() => {
      this.listeners.add(EventName.Keydown, this.handleKeyDown);
    });
  }

  private detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();

    // Clear the focus style when the draggable element is dropped.
    const dropTarget = this.props.activeNode.node.current;
    if (dropTarget) {
      dropTarget.style.outline = 'none';
    }
  }

  private handleCancel(event: Event) {
    const { onCancel } = this.props;

    event.preventDefault();
    this.detach();
    onCancel();
  }

  private handleEnd(event: Event) {
    const { onEnd } = this.props;

    event.preventDefault();
    this.detach();
    onEnd();
  }

  private handleKeyDown(event: Event) {
    if (isKeyboardEvent(event)) {
      const { active, context, options } = this.props;
      const {
        coordinateGetter = defaultKeyboardCoordinateGetter,
        keyboardCodes = defaultKeyboardCodes,
      } = options;
      const { code } = event;

      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }

      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }

      const { collisionRect } = context.current;
      const currentCoordinates = collisionRect
        ? { x: collisionRect.left, y: collisionRect.top }
        : defaultCoordinates;

      if (!this.referenceCoordinates) {
        this.referenceCoordinates = currentCoordinates;
      }

      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates,
      });

      if (newCoordinates) {
        const scrollDelta = {
          x: 0,
          y: 0,
        };

        this.handleMove(
          event,
          getAdjustedCoordinates(
            getCoordinatesDelta(newCoordinates, this.referenceCoordinates),
            scrollDelta
          )
        );
      }
    }
  }

  private handleMove(event: Event, coordinates: Coordinates) {
    const { onMove } = this.props;

    event.preventDefault();
    onMove(coordinates);
  }

  private handleStart() {
    const { onStart } = this.props;

    onStart(defaultCoordinates);
  }
}
