import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { InputFieldMixin } from './input-field-mixin.js';

const TextFieldMixinImplementation = (superclass) =>
  class TextFieldMixinClass extends InputFieldMixin(superclass) {
    static get properties() {
      return {
        /**
         * Maximum number of characters (in Unicode code points) that the user can enter.
         */
        maxlength: {
          type: Number
        },

        /**
         * Minimum number of characters (in Unicode code points) that the user can enter.
         */
        minlength: {
          type: Number
        },

        /**
         * A regular expression that the value is checked against.
         * The pattern must match the entire value, not just some subset.
         */
        pattern: {
          type: String
        },

        /**
         * When set to true, user is prevented from typing a value that
         * conflicts with the given `pattern`.
         * @attr {boolean} prevent-invalid-input
         */
        preventInvalidInput: {
          type: Boolean
        }
      };
    }

    static get hostProps() {
      return [...super.hostProps, 'pattern', 'maxlength', 'minlength'];
    }

    ready() {
      super.ready();

      this._createConstraintsObserver();
    }

    /** @protected */
    _createConstraintsObserver() {
      // This complex observer needs to be added dynamically here (instead of defining it above in the `get observers()`)
      // so that it runs after complex observers of inheriting classes. Otherwise e.g. `_stepOrMinChanged()` observer of
      // vaadin-number-field would run after this and the `min` and `step` properties would not yet be propagated to
      // the `inputElement` when this runs.
      this._createMethodObserver('_constraintsChanged(required, minlength, maxlength, pattern)');
    }

    /**
     * @param {boolean | undefined} required
     * @param {number | undefined} minlength
     * @param {number | undefined} maxlength
     * @param {string | undefined} maxlength
     * @protected
     */
    _constraintsChanged(required, minlength, maxlength, pattern) {
      if (!this.invalid) {
        return;
      }

      if (!required && !minlength && !maxlength && !pattern) {
        this.invalid = false;
      } else {
        this.validate();
      }
    }

    /**
     * @param {Event} e
     * @protected
     */
    _onInput(e) {
      if (this.preventInvalidInput) {
        const input = this.inputElement;
        if (input.value.length > 0 && !this.checkValidity()) {
          input.value = this.value || '';
          // add input-prevented attribute for 200ms
          this.setAttribute('input-prevented', '');
          this._inputDebouncer = Debouncer.debounce(this._inputDebouncer, timeOut.after(200), () => {
            this.removeAttribute('input-prevented');
          });
          return;
        }
      }

      super._onInput(e);
    }

    /**
     * Returns true if the current input value satisfies all constraints (if any)
     * @return {boolean}
     */
    checkValidity() {
      // Note (Yuriy): `__forceCheckValidity` is used in containing components (i.e. `vaadin-date-picker`) in order
      // to force the checkValidity instead of returning the previous invalid state.
      if (this.required || this.pattern || this.maxlength || this.minlength || this.__forceCheckValidity) {
        return this.inputElement.checkValidity();
      } else {
        return !this.invalid;
      }
    }
  };

/**
 * Mixin for using by text-field components, but not number-field.
 * See issues below for some context on why we split those:
 * https://github.com/vaadin/vaadin-text-field/issues/370
 * https://github.com/vaadin/vaadin-text-field/issues/356
 */
export const TextFieldMixin = dedupingMixin(TextFieldMixinImplementation);
