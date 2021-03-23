import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { LabelMixin } from './label-mixin.js';
import { SlotTargetMixin } from './slot-target-mixin.js';

const SlotLabelMixinImplementation = (superclass) =>
  class SlotLabelMixinClass extends SlotTargetMixin(LabelMixin(superclass)) {
    /** @protected */
    get _slotTarget() {
      return this._labelNode;
    }

    /** @private */
    __isChildNodesEmpty(nodes) {
      // The assigned nodes considered to be empty if there is no slotted content or only one empty text node
      return (
        nodes.length === 0 ||
        (nodes.length == 1 && nodes[0].nodeType == Node.TEXT_NODE && nodes[0].textContent.trim() === '')
      );
    }

    /** @protected */
    _slotTargetChanged() {
      const labelPart = this._labelNode.assignedSlot.parentElement;
      if (this.__isChildNodesEmpty(this._labelNode.childNodes)) {
        labelPart.setAttribute('empty', '');
      } else {
        labelPart.removeAttribute('empty');
      }

      this._labelChanged(this.label);
    }
  };

export const SlotLabelMixin = dedupingMixin(SlotLabelMixinImplementation);
