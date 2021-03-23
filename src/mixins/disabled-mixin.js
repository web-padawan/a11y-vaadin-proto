import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';

export const DisabledMixinImplementation = (superclass) =>
  class DisabledMixinClass extends superclass {
    static get properties() {
      return {
        /**
         * If true, the user cannot interact with this element.
         */
        disabled: {
          type: Boolean,
          observer: '_disabledChanged',
          reflectToAttribute: true
        }
      };
    }

    /**
     * @param {boolean} disabled
     * @protected
     */
    _disabledChanged(disabled) {
      this._setAriaDisabled(disabled);
    }

    /**
     * @param {boolean} disabled
     * @protected
     */
    _setAriaDisabled(disabled) {
      if (disabled) {
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('aria-disabled');
      }
    }
  };

export const DisabledMixin = dedupingMixin(DisabledMixinImplementation);
