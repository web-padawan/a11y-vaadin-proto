import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { InputFieldMixin } from './input-field-mixin.js';

const IntegerFieldMixinImplementation = (superclass) =>
  class IntegerFieldMixinClass extends InputFieldMixin(superclass) {
    static get properties() {
      return {
        /**
         * A pattern matched against individual characters the user inputs.
         * When set, the field will prevent:
         * - `keyDown` events if the entered key doesn't match `/^_enabledCharPattern$/`
         * - `paste` events if the pasted text doesn't match `/^_enabledCharPattern*$/`
         * - `drop` events if the dropped text doesn't match `/^_enabledCharPattern*$/`
         *
         * For example, to enable entering only numbers and minus signs,
         * `_enabledCharPattern = "[\\d-]"`
         * @protected
         */
        _enabledCharPattern: {
          type: String,
          observer: '_enabledCharPatternChanged'
        }
      };
    }

    constructor() {
      super();

      this._boundOnPaste = this._onPaste.bind(this);
      this._boundOnDrop = this._onDrop.bind(this);
      this._boundOnBeforeInput = this._onBeforeInput.bind(this);
    }

    /**
     * @param {HTMLElement} node
     * @protected
     */
    _addInputListeners(node) {
      super._addInputListeners(node);

      node.addEventListener('paste', this._boundOnPaste);
      node.addEventListener('drop', this._boundOnDrop);
      node.addEventListener('beforeinput', this._boundOnBeforeInput);
    }

    /**
     * @param {HTMLElement} node
     * @protected
     */
    _removeInputListeners(node) {
      super._removeInputListeners(node);

      node.removeEventListener('blur', this._boundOnBlur);
      node.removeEventListener('focus', this._boundOnFocus);
      node.removeEventListener('paste', this._boundOnPaste);
      node.removeEventListener('drop', this._boundOnDrop);
      node.removeEventListener('beforeinput', this._boundOnBeforeInput);
    }

    /**
     * @param {!KeyboardEvent} e
     * @protected
     */
    _handleKeyDown(e) {
      super._handleKeyDown(e);

      if (this._enabledCharPattern && !this.__shouldAcceptKey(e)) {
        e.preventDefault();
      }
    }

    /** @private */
    __shouldAcceptKey(event) {
      return (
        event.metaKey ||
        event.ctrlKey ||
        !event.key || // allow typing anything if event.key is not supported
        event.key.length !== 1 || // allow "Backspace", "ArrowLeft" etc.
        this.__enabledCharRegExp.test(event.key)
      );
    }

    /** @private */
    _onPaste(e) {
      if (this._enabledCharPattern) {
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        if (!this.__enabledTextRegExp.test(pastedText)) {
          e.preventDefault();
        }
      }
    }

    /** @private */
    _onDrop(e) {
      if (this._enabledCharPattern) {
        const draggedText = e.dataTransfer.getData('text');
        if (!this.__enabledTextRegExp.test(draggedText)) {
          e.preventDefault();
        }
      }
    }

    /** @private */
    _onBeforeInput(e) {
      // The `beforeinput` event covers all the cases for `_enabledCharPattern`: keyboard, pasting and dropping,
      // but it is still experimental technology so we can't rely on it. It's used here just as an additional check,
      // because it seems to be the only way to detect and prevent specific keys on mobile devices. See issue #429.
      if (this._enabledCharPattern && e.data && !this.__enabledTextRegExp.test(e.data)) {
        e.preventDefault();
      }
    }

    /** @private */
    __enabledCharPatternChanged(charPattern) {
      if (charPattern) {
        this.__enabledCharRegExp = new RegExp('^' + charPattern + '$');
        this.__enabledTextRegExp = new RegExp('^' + charPattern + '*$');
      }
    }
  };

/**
 * Mixin for using by integer-field and BigDecimalField.
 * https://github.com/vaadin/vaadin-text-field/pull/424
 */
export const IntegerFieldMixin = dedupingMixin(IntegerFieldMixinImplementation);
