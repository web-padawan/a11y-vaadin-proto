import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { DelegateFocusMixin } from './delegate-focus-mixin.js';

const InputMixinImplementation = (superclass) =>
  class InputMixinClass extends DelegateFocusMixin(superclass) {
    static get properties() {
      return {
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

    /** @protected */
    get _inputNode() {
      return this._getDirectSlotChild('input');
    }

    /** @protected */
    get focusElement() {
      return this._inputNode;
    }

    /** @private */
    __typeChanged(type) {
      if (type && this._inputNode) {
        this._inputNode.setAttribute('type', type);
      }
    }
  };

export const InputMixin = dedupingMixin(InputMixinImplementation);
