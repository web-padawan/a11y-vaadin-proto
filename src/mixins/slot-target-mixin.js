import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

const SlotTargetMixinImplementation = (superclass) =>
  class SlotTargetMixinClass extends superclass {
    constructor() {
      super();
      this._handleNoopSlotChange = this._handleNoopSlotChange.bind(this);
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      if (this._noopSlot) {
        this._noopSlot.addEventListener('slotchange', this._handleNoopSlotChange);
      }

      if (this._slotTarget && this.__textContent) {
        this._slotTarget.textContent = this.__textContent;
        this.__textContent = undefined;
      }

      if (this._slotTarget && this.__innerHTML) {
        this._slotTarget.innerHTML = this.__innerHTML;
        this.__innerHTML = undefined;
      }
    }

    /** @protected */
    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._noopSlot) {
        this._noopSlot.removeEventListener('slotchange', this._handleNoopSlotChange);
      }
    }

    get _noopSlot() {
      console.warn(`Please implement the '_noopSlot' property in <${this.localName}>`);
      return null;
    }

    get _slotTarget() {
      console.warn(`Please implement the '_slotTarget' property in <${this.localName}>`);
      return null;
    }

    /** @private */
    _handleNoopSlotChange() {
      const nodes = this._noopSlot.assignedNodes({ flatten: true });

      if (nodes.length && this._slotTarget) {
        for (let i = 0; i < nodes.length; i++) {
          this._slotTarget.appendChild(nodes[i]);
        }
      }
    }

    set textContent(textContent) {
      if (this._slotTarget) {
        this._slotTarget.textContent = textContent;
      } else {
        this.__textContent = textContent;
      }
    }

    get textContent() {
      return this._slotTarget ? this._slotTarget.textContent : this.__textContent || '';
    }

    set innerHTML(html) {
      if (this._slotTarget) {
        this._slotTarget.innerHTML = html;
      } else {
        this.__innerHTML = html;
      }
    }

    get innerHTML() {
      return this._slotTarget ? this._slotTarget.__innerHTML : this.__innerHTML || '';
    }
  };

/**
 * Mixin that moves any nodes added to a default slot to a target node.
 */
export const SlotTargetMixin = dedupingMixin(SlotTargetMixinImplementation);
