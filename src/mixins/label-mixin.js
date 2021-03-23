import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotMixin } from './slot-mixin.js';

const LabelMixinImplementation = (superclass) =>
  class LabelMixinClass extends SlotMixin(superclass) {
    static get properties() {
      return {
        label: {
          type: String
        }
      };
    }

    get slots() {
      return {
        ...super.slots,
        label: () => {
          const label = document.createElement('label');
          label.textContent = this.label;
          return label;
        }
      };
    }

    /** @protected */
    get _labelNode() {
      return this._getDirectSlotChild('label');
    }

    get label() {
      return this.__label !== undefined ? this.__label : (this._labelNode && this._labelNode.textContent) || '';
    }

    set label(label) {
      this.__label = label;
      if (this._labelNode) {
        this._labelNode.textContent = label;
      }
      // TODO: also handle DOM changes
      this._labelChanged(label);
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (LabelMixinClass._uniqueId = 1 + LabelMixinClass._uniqueId || 0);
      this._labelId = `label-${this.localName}-${uniqueId}`;
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._labelNode) {
        this._labelNode.id = this._labelId;
      }
    }

    /** @protected */
    _labelChanged(label) {
      this.toggleAttribute('has-label', Boolean(label));
    }
  };

export const LabelMixin = dedupingMixin(LabelMixinImplementation);
