import React, { Component } from "react";
import { Motion, spring, presets } from "react-motion";
import PropTypes from "prop-types";
import Observer from "react-intersection-observer";
import { css } from "emotion";
import { createPortal } from "react-dom";
import {
  isDirectionBottom,
  isDirectionTop,
  isDirectionLeft,
  isDirectionRight,
  isClientSide
} from "./helpers";
export default class Drawer extends Component {
  static defaultProps = {
    onOpen: () => {},
    onDrag: () => {},
    inViewportChange: () => {},
    onRequestClose: () => {},
    getContainerRef: () => {},
    getModalRef: () => {},
    direction: "bottom",
    parentElement: document.body,
    allowClose: true,
    dontApplyListeners: false,
    containerElementClass: ""  };
  state = {
    open: this.props.open,
    thumb: 0,
    start: 0,
    position: 0,
    touching: false,
    listenersAttached: false
  };
  componentDidMount() {
    this.selectedCheckboxes = new Set();
    if (this.props.direction === "y")
      console.warning(
        "Direction prop is now takes up or down, y is no longer supported!"
      );
    if (this.props.direction === "x")
      console.warning(
        "Direction prop is now takes left or right, x is no longer supported!"
      );}

  componentDidUpdate(prevProps, nextState) {
    // in the process of closing the drawer
    if (!this.props.open && prevProps.open) {
      this.removeListeners();
      setTimeout(() => {
        this.setState(() => {
          return {
            open: false
          };
        });
      }, 300);
    }
    if (this.drawer) {this.getNegativeScroll(this.drawer);}
    // in the process of opening the drawer
    if (this.props.open && !prevProps.open) {
      this.props.onOpen();
      this.setState(() => {
        return {
          open: true
        };});}}
  componentWillUnmount() {
    this.removeListeners();
  }
  attachListeners = drawer => {
    const { dontApplyListeners, getModalRef, direction } = this.props;
    const { listenersAttached } = this.state;
    if (!drawer || listenersAttached || dontApplyListeners) return;
    this.drawer = drawer;
    getModalRef(drawer);
    this.drawer.addEventListener("touchend", this.release);
    this.drawer.addEventListener("touchmove", this.drag);
    this.drawer.addEventListener("touchstart", this.tap);
    let position = 0;
    if (isDirectionRight(direction)) {
      position = drawer.scrollWidth;
    }

    this.setState({ listenersAttached: true, position }, () => {
      setTimeout(() => {
        this.drawer.style.display = "none";
        void this.drawer.offsetHeight;
        this.drawer.style.display = "";
      }, 300);  });};

  removeListeners = () => {
    if (!this.drawer) return;
    this.drawer.removeEventListener("touchend", this.release);
    this.drawer.removeEventListener("touchmove", this.drag);
    this.drawer.removeEventListener("touchstart", this.tap);
    this.setState({ listenersAttached: false });
  };
  drag = event => {
    const { direction } = this.props;
    const { thumb, start, position } = this.state;
    const { pageY, pageX } = event.touches[0];

    const movingPosition =
      isDirectionBottom(direction) || isDirectionTop(direction) ? pageY : pageX;
    const delta = movingPosition - thumb;
    const newPosition = isDirectionBottom(direction)
      ? position + delta
      : position - delta;
    if (newPosition > 0 && this.ALLOW_DRAWER_TRANSFORM) {
      event.preventDefault();
      this.props.onDrag({ newPosition });
      this.MOVING_POSITION = movingPosition;
      this.NEW_POSITION = newPosition;

      let positionThreshold = 0;
      if (isDirectionRight(direction)) {
        positionThreshold = this.drawer.scrollWidth;
      }
      if (newPosition < positionThreshold ) {
        this.props.notifyWillClose(true);
      } else {
        this.props.notifyWillClose(false);
      }
      if (this.NEGATIVE_SCROLL < newPosition) {
        this.setState(() => {
          return {
            thumb: movingPosition,
            position:
              positionThreshold > 0
                ? Math.min(newPosition, positionThreshold)
                : newPosition
          };});}}};

  release = event => {
    const { direction } = this.props;
    this.setState(() => {
      return {
        touching: false
      };
    });

    if (1) {
      this.hideDrawer();
    } else {
      let newPosition = 0;
      if (isDirectionRight(direction)) {
        newPosition = this.drawer.scrollWidth;
      }
      this.setState(() => {
        return {
          position: newPosition
        };});}};

  getNegativeScroll = element => {
    const { direction } = this.props;
    const size = this.getElementSize();
    if (isDirectionBottom(direction) || isDirectionTop(direction)) {
      this.NEGATIVE_SCROLL =
        size - element.scrollHeight - this.MAX_NEGATIVE_SCROLL;
    } else {
      this.NEGATIVE_SCROLL =
        size - element.scrollWidth - this.MAX_NEGATIVE_SCROLL;
    }
  };

  hideDrawer = () => {
    const { allowClose, onRequestClose, direction } = this.props;
    let defaultPosition = 0;
    if (isDirectionRight(direction)) {
      defaultPosition = this.drawer.scrollWidth;
    }
    if (allowClose === false) {
      return this.setState(() => {
        return {
          position: defaultPosition,
          thumb: 0,
          touching: false
        };
      });
    }

    this.setState(() => {
      return {
        position: defaultPosition,
        touching: false
      };
    });
    this.removeListeners();
    onRequestClose();
  };

  getDrawerTransform = value => {
    const { direction } = this.props;
    if (isDirectionBottom(direction)) {
      return { transform: `translate3d(0, ${value}px, 0)` };
    } else if (isDirectionTop(direction)) {
      return { transform: `translate3d(0, -${value}px, 0)` };
    } else if (isDirectionLeft(direction)) {
      return { transform: `translate3d(-${value}px, 0, 0)` };
    } else if (isDirectionRight(direction)) {
      return { transform: `translate3d(${value}px, 0, 0)` };
    }};

  getElementSize = () => {
    if (isClientSide()) {
      return isDirectionBottom(this.props.direction) ||
        isDirectionTop(this.props.direction)
        ? window.innerHeight
        : window.innerWidth;}
  };

  getPosition(hiddenPosition) {
    const { position } = this.state;
    const { direction } = this.props;

    if (isDirectionRight(direction)) {
      return hiddenPosition - position;
    } else {
      return position;
    }
  }

  preventDefault = event => event.preventDefault();
  stopPropagation = event => event.stopPropagation();

  render() {
    const {
      containerElementClass,
      dontApplyListeners,
      id,
      getContainerRef,
      getModalRef,
      direction
    } = this.props;

    const open = this.state.open && this.props.open;
    if ((!this.state.open && !this.props.open) || !isClientSide()) {
      return null;
    }
    const { touching } = this.state;
    const animationSpring = touching
      ? { damping: 20, stiffness: 300 }
      : presets.stiff;

    const hiddenPosition = this.getElementSize();
    const position = this.getPosition(hiddenPosition);
    let containerStyle = {
      backgroundColor: `rgba(55, 56, 56, ${open ? 0.6 : 0})`
    };
    if (isDirectionRight(direction)) {
      containerStyle = {
        ...containerStyle,
        overflowX: "hidden"
      };
    }

    return createPortal(
      <Motion
        style={{
          translate: spring(open ? position : hiddenPosition, animationSpring)
        }}
        defaultStyle={{
          translate: hiddenPosition
        }}
      >
        {({ translate }) => {
          return (
            <div
              id={id}
              style={containerStyle}
              onClick={this.hideDrawer}
              className={`${Container} ${containerElementClass} `}
              ref={getContainerRef}
            >
              <Observer
                className={HaveWeScrolled}
                onChange={this.inViewportChange}
              />
              <div
                onClick={this.stopPropagation}
                style={this.getDrawerTransform(translate)}
                ref={this.attachListeners}
                className={this.props.modalElementClass || ""}>
                {this.props.children}
              </div>
            </div>
          );
        }}
      </Motion>,
      this.props.parentElement
    );
  }
}

const Container = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  flex-shrink: 0;
  align-items: center;

  z-index: 11;
  transition: background-color 0.2s linear;

  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const HaveWeScrolled = css`
  position: absolute;
  top: 0;
  height: 1px;
  width: 100%;
`;
