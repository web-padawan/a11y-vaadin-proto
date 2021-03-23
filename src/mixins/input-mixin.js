import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { DelegateFocusMixin } from './delegate-focus-mixin.js';
import { LabelMixin } from './label-mixin.js';

const InputMixinImplementation = (superclass) =>
  class InputMixinClass extends DelegateFocusMixin(LabelMixin(superclass)) {
    static get properties() {
      return {
        value: {
          type: String
        },

        type: {
          type: String,
          readOnly: true,
          observer: '__typeChanged'
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        input: () => {
          const native = document.createElement('input');
          const value = this.getAttribute('value');
          if (value) {
            native.setAttribute('value', value);
          }
          const name = this.getAttribute('name');
          if (name) {
            native.setAttribute('name', name);
          }
          native.setAttribute('type', this.type);
          return native;
        }
      };
    }

    get name() {
      return (this._inputNode && this._inputNode.name) || this.__name || '';
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

    /** @protected */
    get _inputNode() {
      return this._getDirectSlotChild('input');
    }

    /** @protected */
    get focusElement() {
      return this._inputNode;
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (InputMixinClass._uniqueId = 1 + InputMixinClass._uniqueId || 0);
      this._inputId = `${this.localName}-${uniqueId}`;

      this.__preventDuplicateLabelClick = this.__preventDuplicateLabelClick.bind(this);
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      this._enhanceLightDomA11y();
      if (this._labelNode) {
        this._labelNode.addEventListener('click', this.__preventDuplicateLabelClick);
      }
    }

    /** @protected */
    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._labelNode) {
        this._labelNode.removeEventListener('click', this.__preventDuplicateLabelClick);
      }
    }

    /** @protected */
    _enhanceLightDomA11y() {
      if (this._inputNode) {
        this._inputNode.id = this._inputId;
        this._inputNode.setAttribute('aria-labelledby', this._labelId);
      }

      if (this._labelNode) {
        this._labelNode.setAttribute('for', this._inputId);
      }
    }

    /**
     * The native platform fires an event for both the click on the label, and also
     * the subsequent click on the native input element caused by label click.
     * This results in two click events arriving at the host, but we only want one.
     * This method prevents the duplicate click and ensures the correct isTrusted event
     * with the correct event.target arrives at the host.
     * @private
     */
    __preventDuplicateLabelClick() {
      const __inputClickHandler = (e) => {
        e.stopImmediatePropagation();
        this._inputNode.removeEventListener('click', __inputClickHandler);
      };
      this._inputNode.addEventListener('click', __inputClickHandler);
    }

    /** @private */
    __typeChanged(type) {
      if (type && this._inputNode) {
        this._inputNode.setAttribute('type', type);
      }
    }
  };

export const InputMixin = dedupingMixin(InputMixinImplementation);
