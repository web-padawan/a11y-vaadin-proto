import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { FocusMixin } from './focus-mixin.js';
import { DisabledMixin } from './disabled-mixin.js';

export const DelegateFocusMixinImplementation = (superclass) =>
  class DelegateFocusMixinClass extends FocusMixin(DisabledMixin(superclass)) {
    /**
     * Any element extending this mixin is required to implement this getter.
     * It returns the actual focusable element in the component.
     * @return {Element | null | undefined}
     */
    get focusElement() {
      console.warn(`Please implement the 'focusElement' property in <${this.localName}>`);
      return this;
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
     * @param {Event} e
     * @return {boolean}
     * @protected
     */
    _shouldSetFocus(e) {
      return e.composedPath()[0] === this.focusElement;
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

export const DelegateFocusMixin = dedupingMixin(DelegateFocusMixinImplementation);
