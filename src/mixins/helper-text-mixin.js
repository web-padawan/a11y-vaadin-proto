import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotMixin } from './slot-mixin.js';

const HelperTextMixinImplementation = (superclass) =>
  class HelperTextMixinClass extends SlotMixin(superclass) {
    static get properties() {
      return {
        helperText: {
          type: String
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        helper: () => {
          const helper = document.createElement('div');
          helper.textContent = this.helperText || this.getAttribute('helper-text');
          return helper;
        }
      };
    }

    /** @protected */
    get _helperNode() {
      return this._getDirectSlotChild('helper');
    }

    get helperText() {
      return this.__helperText !== undefined
        ? this.__helperText
        : (this._helperNode && this._helperNode.textContent) || '';
    }

    set helperText(helper) {
      this.__helperText = helper;
      if (this._helperNode) {
        this._helperNode.textContent = helper;
      }
      // TODO: also handle DOM changes
      this._helperChanged(helper);
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (HelperTextMixinClass._uniqueId = 1 + HelperTextMixinClass._uniqueId || 0);
      this._helperId = `helper-${this.localName}-${uniqueId}`;
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._helperNode) {
        this._helperNode.id = this._helperId;
      }
    }

    /** @protected */
    _helperChanged(helper) {
      const hasHelper = Boolean(helper);
      this.toggleAttribute('has-helper', hasHelper);

      if (this._helperNode) {
        this._helperNode.setAttribute('aria-hidden', hasHelper.toString());
      }
    }
  };

export const HelperTextMixin = dedupingMixin(HelperTextMixinImplementation);
