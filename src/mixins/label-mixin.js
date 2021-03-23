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
      this._toggleHasLabel(label);
    }

    /** @protected */
    _toggleHasLabel() {
      this.toggleAttribute('has-label', Boolean(this.label));
    }
  };

export const LabelMixin = dedupingMixin(LabelMixinImplementation);
