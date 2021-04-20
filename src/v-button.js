import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { addListener } from '@polymer/polymer/lib/utils/gestures.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { DelegateFocusMixin } from './mixins/delegate-focus-mixin.js';

class VButton extends DelegateFocusMixin(ThemableMixin(GestureEventListeners(PolymerElement))) {
  static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
          position: relative;
          outline: none;
          white-space: nowrap;
        }
        :host([hidden]) {
          display: none !important;
        }
      </style>
      <button id="button" type="button" part="button">
        <span part="prefix"><slot name="prefix"></slot></span>
        <span><slot></slot></span>
        <span part="suffix"><slot name="suffix"></slot></span>
      </button>
    `;
  }

  static get is() {
    return 'v-button';
  }

  /** @protected */
  ready() {
    super.ready();

    this._addActiveListeners();
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();

    // `active` state is preserved when the element is disconnected between keydown and keyup events.
    // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
    this.toggleAttribute('active', false);
  }

  /** @private */
  _addActiveListeners() {
    addListener(this, 'down', () => !this.disabled && this.setAttribute('active', ''));
    addListener(this, 'up', () => this.removeAttribute('active'));
    this.addEventListener(
      'keydown',
      (e) => !this.disabled && [13, 32].indexOf(e.keyCode) >= 0 && this.setAttribute('active', '')
    );
    this.addEventListener('keyup', () => this.removeAttribute('active'));
    this.addEventListener('blur', () => this.removeAttribute('active'));
  }

  /**
   * @protected
   * @return {Element}
   */
  get focusElement() {
    return this.$.button;
  }
}

customElements.define(VButton.is, VButton);

export { VButton };
