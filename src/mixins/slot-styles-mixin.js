import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

const SlotStylesMixinImplementation = (superclass) =>
  class SlotStylesMixinClass extends superclass {
    get slotStyles() {
      return {};
    }

    constructor() {
      super();
      this._appliedStyles = new WeakMap();
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      this._applySlotStyles();
    }

    /** @private */
    _applySlotStyles() {
      const rootNode = this.getRootNode();
      const root = rootNode === document ? document.head : rootNode;

      if (!this._appliedStyles.has(root)) {
        // Ignore labels of nested components, if any
        const style = document.createElement('style');
        style.setAttribute('data-name', this.localName);

        Object.keys(this.slotStyles).forEach((styleName) => {
          style.textContent += this.slotStyles[styleName];
        });

        root.appendChild(style);

        this._appliedStyles.set(root, true);
      }
    }
  };

/**
 * Mixin to apply styles for slotted input pseudo elements:
 * - ::placeholder
 * - ::webkit-outer-spin-button
 * - ::webkit-inner-spin-button
 */
export const SlotStylesMixin = dedupingMixin(SlotStylesMixinImplementation);
