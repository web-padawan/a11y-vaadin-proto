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
          observer: '_invalidChanged',
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
          error.textContent = this.errorMessage;
          return error;
        }
      };
    }

    get errorMessage() {
      return this.__errorMessage !== undefined
        ? this.__errorMessage
        : (this._errorNode && this._errorNode.textContent) || '';
    }

    set errorMessage(error) {
      this.__errorMessage = error;
      if (this._errorNode) {
        this._errorNode.textContent = error;
      }
      this._toggleHasErrorMessage(error);
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

    /** @protected */
    _toggleHasErrorMessage() {
      this.toggleAttribute('has-error-message', Boolean(this.errorMessage));
    }

    /**
     * @param {boolean} invalid
     * @protected
     */
    _invalidChanged(invalid) {
      if (this._errorNode) {
        const hidden = Boolean(!invalid).toString();
        this._errorNode.setAttribute('aria-hidden', hidden);
      }
    }
  };

export const ValidateMixin = dedupingMixin(ValidateMixinImplementation);
