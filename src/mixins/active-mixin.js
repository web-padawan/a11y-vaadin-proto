import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { DisabledMixin } from './disabled-mixin.js';

const ActiveMixinImplementation = (superclass) =>
  class ActiveMixinClass extends DisabledMixin(GestureEventListeners(superclass)) {
    get activeKeys() {
      return [32];
    }

    /** @protected */
    ready() {
      super.ready();

      this._addEventListenerToNode(this, 'down', () => {
        if (!this.disabled) {
          this.setAttribute('active', '');
        }
      });

      this._addEventListenerToNode(this, 'up', () => {
        this.removeAttribute('active');
      });

      // KEYDOWN
      this.addEventListener('keydown', (e) => {
        if (!this.disabled && this.activeKeys.includes(e.keyCode)) {
          this.setAttribute('active', '');
        }
      });

      // KEYUP
      this.addEventListener('keyup', (e) => {
        if (!this.disabled && this.activeKeys.includes(e.keyCode)) {
          this.removeAttribute('active');
        }
      });
    }
  };

export const ActiveMixin = dedupingMixin(ActiveMixinImplementation);
