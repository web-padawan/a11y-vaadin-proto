import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { InputAriaMixin } from './input-aria-mixin.js';
import { ValidateMixin } from './validate-mixin.js';
import { SlotStylesMixin } from './slot-styles-mixin.js';

const InputFieldMixinImplementation = (superclass) =>
  class InputFieldMixinClass extends SlotStylesMixin(ValidateMixin(InputAriaMixin(superclass))) {
    static get properties() {
      return {
        /**
         * Whether the value of the control can be automatically completed by the browser.
         * List of available options at:
         * https://developer.mozilla.org/en/docs/Web/HTML/Element/input#attr-autocomplete
         */
        autocomplete: {
          type: String
        },

        /**
         * This is a property supported by Safari that is used to control whether
         * autocorrection should be enabled when the user is entering/editing the text.
         * Possible values are:
         * on: Enable autocorrection.
         * off: Disable autocorrection.
         * @type {!TextFieldAutoCorrect | undefined}
         */
        autocorrect: {
          type: String
        },

        /**
         * This is a property supported by Safari and Chrome that is used to control whether
         * autocapitalization should be enabled when the user is entering/editing the text.
         * Possible values are:
         * characters: Characters capitalization.
         * words: Words capitalization.
         * sentences: Sentences capitalization.
         * none: No capitalization.
         * @type {!TextFieldAutoCapitalize | undefined}
         */
        autocapitalize: {
          type: String
        },

        /**
         * Specify that the value should be automatically selected when the field gains focus.
         * @type {boolean}
         */
        autoselect: {
          type: Boolean,
          value: false
        },

        /**
         * The initial value of the control.
         * It can be used for two-way data binding.
         * @type {string}
         */
        value: {
          type: String,
          value: '',
          observer: '_valueChanged',
          notify: true
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
      return [
        'autofocus',
        'autocapitalize',
        'autocomplete',
        'autocorrect',
        'name',
        'placeholder',
        'disabled',
        'readonly',
        'required'
      ];
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

    /**
     * @return {HTMLElement | undefined}}
     * @protected
     */
    get inputElement() {
      return this._inputNode;
    }

    constructor() {
      super();

      this._boundOnInput = this._onInput.bind(this);
      this._boundOnBlur = this._onBlur.bind(this);
      this._boundOnFocus = this._onFocus.bind(this);
    }

    connectedCallback() {
      super.connectedCallback();

      if (this._inputNode) {
        this._addInputListeners(this._inputNode);

        this._validateSlottedValue(this._inputNode);

        if (this.value) {
          this._inputNode.value = this.value;
          this.validate();
        }

        // Propagate initially defined properties to the slotted input
        this._propagateHostAttributes(this.constructor.hostProps.map((attr) => this[attr]));
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._inputNode) {
        this._removeInputListeners(this._inputNode);
      }
    }

    ready() {
      super.ready();

      this.addEventListener('keydown', (e) => this._onKeyDown(e));

      // create observer dynamically to allow subclasses to override hostProps
      this._createMethodObserver(`_hostPropsChanged(${this.constructor.hostProps.join(', ')})`);

      // TODO: clear button
    }

    clear() {
      this.value = '';
    }

    /**
     * Returns true if the current input value satisfies all constraints (if any)
     * @return {boolean}
     */
    checkValidity() {
      // Note (Yuriy): `__forceCheckValidity` is used in containing components (i.e. `vaadin-date-picker`) in order
      // to force the checkValidity instead of returning the previous invalid state.
      if (this.required || this.__forceCheckValidity) {
        return this.inputElement.checkValidity();
      } else {
        return !this.invalid;
      }
    }

    /** @private */
    _hostPropsChanged(...attributesValues) {
      this._propagateHostAttributes(attributesValues);
    }

    /** @private */
    _propagateHostAttributes(attributesValues) {
      const input = this.inputElement;
      const attributeNames = this.constructor.hostProps;

      attributeNames.forEach((attr, index) => {
        this._setOrToggleAttribute(attr, attributesValues[index], input);
      });
    }

    /** @private */
    _validateSlottedValue(slotted) {
      if (slotted.value !== this.value) {
        console.warn(`Please define value on the <${this.localName}> component!`);
        slotted.value = '';
      }
    }

    /** @private */
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

    /**
     * @param {HTMLElement} node
     * @protected
     */
    _addInputListeners(node) {
      node.addEventListener('input', this._boundOnInput);
      // TODO: should we use native change event?
      // node.addEventListener('change', this._boundOnChange);
      node.addEventListener('blur', this._boundOnBlur);
      node.addEventListener('focus', this._boundOnFocus);
    }

    /**
     * @param {HTMLElement} node
     * @protected
     */
    _removeInputListeners(node) {
      node.removeEventListener('input', this._boundOnInput);
      // TODO: should we use native change event?
      // node.removeEventListener('change', this._boundOnChange);
      node.removeEventListener('blur', this._boundOnBlur);
      node.removeEventListener('focus', this._boundOnFocus);
    }

    /** @private */
    _onFocus() {
      if (this.autoselect) {
        this.inputElement.select();
        // iOS 9 workaround: https://stackoverflow.com/a/7436574
        setTimeout(() => {
          try {
            this.inputElement.setSelectionRange(0, 9999);
          } catch (e) {
            // The workaround may cause errors on different input types.
            // Needs to be suppressed. See https://github.com/vaadin/flow/issues/6070
          }
        });
      }
    }

    /** @private */
    _onBlur() {
      this.validate();
    }

    /**
     * @param {!KeyboardEvent} e
     * @protected
     */
    _onKeyDown(e) {
      if (e.key === 'Escape' && this.clearButtonVisible) {
        const dispatchChange = !!this.value;
        this.clear();
        dispatchChange && this.inputElement.dispatchEvent(new Event('change'));
      }

      if (this._enabledCharPattern && !this.__shouldAcceptKey(e)) {
        e.preventDefault();
      }
    }

    /**
     * @param {Event} e
     * @protected
     */
    _onInput(e) {
      if (!e.__fromClearButton) {
        this.__userInput = true;
      }

      this.value = e.target.value;
      this.__userInput = false;
    }

    /**
     * @param {unknown} newVal
     * @param {unknown} oldVal
     * @protected
     */
    _valueChanged(newVal, oldVal) {
      // setting initial value to empty string, skip validation
      if (newVal === '' && oldVal === undefined) {
        return;
      }

      if (newVal !== '' && newVal != null) {
        this.setAttribute('has-value', '');
      } else {
        this.removeAttribute('has-value');
      }

      if (this.__userInput || !this.inputElement) {
        return;
      } else if (newVal !== undefined) {
        this.inputElement.value = newVal;
      } else {
        this.value = this.inputElement.value = '';
      }

      if (this.invalid) {
        this.validate();
      }
    }

    /**
     * @param {boolean} invalid
     * @protected
     */
    _invalidChanged(invalid) {
      super._invalidChanged(invalid);

      this._setOrToggleAttribute('aria-invalid', invalid ? 'true' : false, this._inputNode);
    }
  };

export const InputFieldMixin = dedupingMixin(InputFieldMixinImplementation);
