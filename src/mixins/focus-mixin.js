import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { DisabledMixin } from './disabled-mixin.js';

// We consider the keyboard to be active if the window has received a keydown
// event since the last mousedown event.
let keyboardActive = false;

// Listen for top-level keydown and mousedown events.
// Use capture phase so we detect events even if they're handled.
window.addEventListener(
  'keydown',
  () => {
    keyboardActive = true;
  },
  { capture: true }
);

window.addEventListener(
  'mousedown',
  () => {
    keyboardActive = false;
  },
  { capture: true }
);

export const FocusMixinImplementation = (superclass) =>
  class FocusMixinClass extends DisabledMixin(superclass) {
    /** @protected */
    ready() {
      this.addEventListener('focusin', (e) => {
        if (e.composedPath()[0] === this.focusElement) {
          this._setFocused(true);
        }
      });

      this.addEventListener('focusout', () => {
        this._setFocused(false);
      });

      // In super.ready() other 'focusin' and 'focusout' listeners might be
      // added, so we call it after our own ones to ensure they execute first.
      // Issue to watch out: when incorrect, <vaadin-combo-box> refocuses the
      // input field on iOS after “Done” is pressed.
      super.ready();
    }

    /** @protected */
    disconnectedCallback() {
      super.disconnectedCallback();

      // in non-Chrome browsers, blur does not fire on the element when it is disconnected.
      // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
      if (this.hasAttribute('focused')) {
        this._setFocused(false);
      }
    }

    /**
     * @param {boolean} focused
     * @protected
     */
    _setFocused(focused) {
      if (focused) {
        this.setAttribute('focused', '');
      } else {
        this.removeAttribute('focused');
      }

      // focus-ring is true when the element was focused from the keyboard.
      // Focus Ring [A11ycasts]: https://youtu.be/ilj2P5-5CjI
      if (focused && keyboardActive) {
        this.setAttribute('focus-ring', '');
      } else {
        this.removeAttribute('focus-ring');
      }
    }

    /**
     * Any element extending this mixin is required to implement this getter.
     * It returns the actual focusable element in the component.
     * @return {Element | null | undefined}
     */
    get focusElement() {
      console.warn(`Please implement the 'focusElement' property in <${this.localName}>`);
      return this;
    }

    /** @protected */
    _focus() {
      if (!this.focusElement || this._isShiftTabbing) {
        return;
      }

      this.focusElement.focus();
      this._setFocused(true);
    }

    focus() {
      if (!this.focusElement || this.disabled) {
        return;
      }

      this.focusElement.focus();
      this._setFocused(true);
    }

    blur() {
      if (!this.focusElement) {
        return;
      }
      this.focusElement.blur();
      this._setFocused(false);
    }

    /**
     * @param {boolean} disabled
     * @protected
     */
    _disabledChanged(disabled) {
      super._disabledChanged(disabled);

      this.focusElement.disabled = disabled;
      if (disabled) {
        this.blur();
      }
    }

    click() {
      if (!this.disabled) {
        this.focusElement.click();
      }
    }
  };

export const FocusMixin = dedupingMixin(FocusMixinImplementation);
