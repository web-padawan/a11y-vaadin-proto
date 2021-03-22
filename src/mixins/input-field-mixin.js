import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { SlotTargetMixin } from './slot-target-mixin.js';
import { SlotMixin } from './slot-mixin.js';

const InputFieldMixinImplementation = (superclass) =>
  class InputFieldMixinClass extends SlotTargetMixin(SlotMixin(superclass)) {
    static get properties() {
      return {
        label: {
          type: String
        },

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
          native.setAttribute('type', this.type);
          return native;
        },
        label: () => {
          const label = document.createElement('label');
          label.textContent = this.label;
          return label;
        }
      };
    }

    get label() {
      return this.__label !== undefined ? this.__label : (this._labelNode && this._labelNode.textContent) || '';
    }

    set label(label) {
      this.__label = label;
      if (this._labelNode) {
        this._labelNode.textContent = label;
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
    get _labelNode() {
      return this._getDirectSlotChild('label');
    }

    /** @protected */
    get _inputNode() {
      return this._getDirectSlotChild('input');
    }

    /** @protected */
    get focusElement() {
      return this._inputNode;
    }

    /** @protected */
    get _slotTarget() {
      return this._labelNode;
    }

    constructor() {
      super();

      // Ensure every instance has unique ID
      const uniqueId = (InputFieldMixinClass._uniqueId = 1 + InputFieldMixinClass._uniqueId || 0);
      this._inputId = `${this.localName}-${uniqueId}`;

      this.__preventDuplicateLabelClick = this.__preventDuplicateLabelClick.bind(this);

      this.__labelChildObserver = new MutationObserver((record) => {
        record.forEach((mutation) => {
          if (mutation.type === 'childList') {
            this.__updateLabelAttribute();
          }
        });
      });
    }

    /** @protected */
    connectedCallback() {
      super.connectedCallback();

      this._enhanceLightDomA11y();
      if (this._labelNode) {
        this._labelNode.addEventListener('click', this.__preventDuplicateLabelClick);

        this.__labelChildObserver.observe(this._labelNode, { childList: true });

        this.__updateLabelAttribute();
      }
    }

    /** @protected */
    disconnectedCallback() {
      super.disconnectedCallback();

      if (this._labelNode) {
        this._labelNode.removeEventListener('click', this.__preventDuplicateLabelClick);

        this.__labelChildObserver.disconnect();
      }
    }

    /** @protected */
    _getDirectSlotChild(slotName) {
      return Array.from(this.children).find((el) => el.slot === slotName);
    }

    /** @protected */
    _enhanceLightDomA11y() {
      const id = this._inputId;
      const labelId = `label-${id}`;

      if (this._inputNode) {
        this._inputNode.id = id;
        this._inputNode.setAttribute('aria-labelledby', labelId);
      }

      if (this._labelNode) {
        this._labelNode.setAttribute('for', id);
        this._labelNode.id = labelId;
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

    /** @private */
    __updateLabelAttribute() {
      const labelPart = this._labelNode.assignedSlot.parentElement;
      if (this.__isChildNodesEmpty(this._labelNode.childNodes)) {
        labelPart.setAttribute('empty', '');
      } else {
        labelPart.removeAttribute('empty');
      }
    }

    /** @private */
    __isChildNodesEmpty(nodes) {
      // The assigned nodes considered to be empty if there is no slotted content or only one empty text node
      return (
        nodes.length === 0 ||
        (nodes.length == 1 && nodes[0].nodeType == Node.TEXT_NODE && nodes[0].textContent.trim() === '')
      );
    }
  };

export const InputFieldMixin = dedupingMixin(InputFieldMixinImplementation);
