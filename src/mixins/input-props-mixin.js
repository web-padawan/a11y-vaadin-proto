import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { InputAriaMixin } from './input-aria-mixin.js';
import { ValidateMixin } from './validate-mixin.js';
import { SlotStylesMixin } from './slot-styles-mixin.js';

const InputPropsMixinImplementation = (superclass) =>
  class InputPropsMixinClass extends SlotStylesMixin(ValidateMixin(InputAriaMixin(superclass))) {
    static get properties() {
      return {
        /**
         * Set to true to display the clear icon which clears the input.
         * @attr {boolean} clear-button-visible
         * @type {boolean}
         */
        clearButtonVisible: {
          type: Boolean,
          reflectToAttribute: true,
          value: false
        },

        /**
         * A hint to the user of what can be entered in the control.
         */
        placeholder: {
          type: String
        },

        /**
         * This attribute indicates that the user cannot modify the value of the control.
         */
        readonly: {
          type: Boolean,
          reflectToAttribute: true
        }
      };
    }

    static get hostProps() {
      return ['name', 'placeholder', 'disabled', 'readonly', 'required', 'invalid'];
    }

    get slotStyles() {
      return {
        ...super.slotStyles,
        input: `
          input::placeholder,
          textarea::placeholder {
            color: inherit;
            transition: opacity 0.175s 0.1s;
            opacity: 0.5;
          }

          [readonly] > input::placeholder,
          [readonly] > textarea::placeholder,
          [disabled] > input::placeholder,
          [disabled] > textarea::placeholder {
            opacity: 0;
          }
        `
      };
    }

    /** @protected */
    get _clearOnEsc() {
      return true;
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._inputNode) {
        this._validateSlottedValue(this._inputNode);

        // Propagate initially defined properties to the slotted input
        this._propagateHostAttributes(this.constructor.hostProps.map((attr) => this[attr]));
      }
    }

    /** @protected */
    ready() {
      super.ready();

      this._clearElement = this.$.clearButton;

      this.addEventListener('keydown', (e) => this._handleKeyDown(e));

      // create observer dynamically to allow subclasses to override hostProps
      this._createMethodObserver(`_hostPropsChanged(${this.constructor.hostProps.join(', ')})`);
    }

    /**
     * @param {Event} event
     * @protected
     */
    _handleKeyDown(event) {
      if (event.key === 'Escape' && this.clearButtonVisible && this._clearOnEsc) {
        const dispatchChange = !!this.value;
        this.clear();
        dispatchChange && this.inputElement.dispatchEvent(new Event('change'));
      }
    }

    /** @private */
    _hostPropsChanged(...attributesValues) {
      this._propagateHostAttributes(attributesValues);
    }

    /** @private */
    _propagateHostAttributes(attributesValues) {
      const input = this._inputNode;
      const attributeNames = this.constructor.hostProps;

      attributeNames.forEach((attr, index) => {
        if (attr === 'invalid') {
          this._setOrToggleAttribute('aria-invalid', this.invalid ? 'true' : false, input);
        } else {
          this._setOrToggleAttribute(attr, attributesValues[index], input);
        }
      });
    }

    /** @private */
    _validateSlottedValue(slotted) {
      if (slotted.value !== this.value) {
        console.warn(`Please define value on the <${this.localName}> component!`);
        slotted.value = '';
      }
    }

    /** @protected */
    _setOrToggleAttribute(name, value, node) {
      if (!name || !node) {
        return;
      }

      if (value) {
        node.setAttribute(name, typeof value === 'boolean' ? '' : value);
      } else {
        node.removeAttribute(name);
      }
    }
  };

export const InputPropsMixin = dedupingMixin(InputPropsMixinImplementation);
