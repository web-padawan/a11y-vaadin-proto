import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

const SlotMixinImplementation = (superclass) =>
  class SlotMixinClass extends superclass {
    get slots() {
      return {};
    }

    constructor() {
      super();
      this.__privateSlots = new Set(null);
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();
      this._connectSlotMixin();
    }

    /** @private */
    _connectSlotMixin() {
      if (!this.__isConnectedSlotMixin) {
        Object.keys(this.slots).forEach((slotName) => {
          if (!this.querySelector(`[slot=${slotName}]`)) {
            const slotFactory = this.slots[slotName];
            const slotContent = slotFactory();
            if (slotContent instanceof Element) {
              slotContent.setAttribute('slot', slotName);
              this.appendChild(slotContent);
              this.__privateSlots.add(slotName);
            }
          }
        });
        this.__isConnectedSlotMixin = true;
      }
    }

    /** @protected */
    _getDirectSlotChild(slotName) {
      return Array.from(this.children).find((el) => el.slot === slotName);
    }

    /**
     * @param {string} slotName Name of the slot
     * @return {boolean} true if given slot name was created by SlotMixin
     */
    _isPrivateSlot(slotName) {
      return this.__privateSlots.has(slotName);
    }
  };

export const SlotMixin = dedupingMixin(SlotMixinImplementation);
