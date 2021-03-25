import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { InputMixin } from './input-mixin.js';

const CheckedMixinImplementation = (superclass) =>
  class CheckedMixinClass extends InputMixin(superclass) {
    static get properties() {
      return {
        /**
         * True if the element is checked.
         * @type {boolean}
         */
        checked: {
          type: Boolean,
          value: false,
          notify: true,
          observer: '_checkedChanged',
          reflectToAttribute: true
        },

        /**
         * Name of the element.
         */
        name: String,

        /**
         * Value of the element.
         */
        value: String
      };
    }

    get name() {
      return this.checked ? (this._inputNode && this._inputNode.name) || this.__name || '' : '';
    }

    set name(value) {
      if (this._inputNode) {
        this._inputNode.name = value;
        this.__name = undefined;
      } else {
        this.__name = value;
      }
    }

    get value() {
      return (this._inputNode && this._inputNode.value) || this.__value || '';
    }

    set value(value) {
      if (this._inputNode) {
        this._inputNode.value = value;
        this.__value = undefined;
      } else {
        this.__value = value;
      }
    }

    constructor() {
      super();
      this._handleClick = this._handleClick.bind(this);
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      this.addEventListener('click', this._handleClick);
    }

    /** @protected */
    disconnectedCallback() {
      super.disconnectedCallback();

      this.removeEventListener('click', this._handleClick);
    }

    /** @private */
    _checkedChanged(checked) {
      if (checked && this._inputNode) {
        this._inputNode.checked = checked;
      }
    }

    /** @private */
    __interactionsAllowed(e) {
      if (this.disabled) {
        return false;
      }

      if (e.target.localName === 'a') {
        return false;
      }

      return true;
    }

    /** @private */
    _handleClick(e) {
      if (this.__interactionsAllowed(e)) {
        this._toggleChecked();
      } else {
        e.preventDefault();
      }
    }

    /** @protected */
    _toggleChecked() {
      this.checked = !this.checked;
      this._toggleAriaChecked();
    }

    /** @protected */
    _toggleAriaChecked() {
      this.setAttribute('aria-checked', Boolean(this.checked));
    }
  };

export const CheckedMixin = dedupingMixin(CheckedMixinImplementation);
