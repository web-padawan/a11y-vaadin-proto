import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotMixin } from './slot-mixin.js';

const ValidateMixinImplementation = (superclass) =>
  class ValidateMixinClass extends SlotMixin(superclass) {
    static get properties() {
      return {
        /**
         * This property is set to true when the value is invalid.
         * @type {boolean}
         */
        invalid: {
          type: Boolean,
          reflectToAttribute: true,
          notify: true,
          value: false
        },

        /**
         * Specifies that the user must fill in a value.
         */
        required: {
          type: Boolean,
          reflectToAttribute: true
        },

        /**
         * Error to show when the input value is invalid.
         * @attr {string} error-message
         * @type {string}
         */
        errorMessage: {
          type: String
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        'error-message': () => {
          const error = document.createElement('div');
          error.setAttribute('aria-live', 'assertive');
          return error;
        }
      };
    }

    static get observers() {
      return ['_updateErrorMessage(invalid, errorMessage)'];
    }

    /** @protected */
    get _errorNode() {
      return this._getDirectSlotChild('error-message');
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (ValidateMixinClass._uniqueId = 1 + ValidateMixinClass._uniqueId || 0);
      this._errorId = `error-${this.localName}-${uniqueId}`;
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._errorNode) {
        this._errorNode.id = this._errorId;
      }
    }

    /**
     * Returns true if `value` is valid.
     *
     * @return {boolean} True if the value is valid.
     */
    validate() {
      return !(this.invalid = !this.checkValidity());
    }

    /**
     * Returns true if the current input value satisfies all constraints (if any)
     * @return {boolean}
     */
    checkValidity() {
      return !this.required || !!this.value;
    }

    /**
     * @param {boolean} invalid
     * @protected
     */
    _updateErrorMessage(invalid, errorMessage) {
      if (this._errorNode) {
        const hasError = Boolean(invalid && errorMessage);
        this._errorNode.textContent = hasError ? errorMessage : '';
        this.toggleAttribute('has-error-message', hasError);
      }
    }
  };

export const ValidateMixin = dedupingMixin(ValidateMixinImplementation);
