import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ButtonsMixin } from './menu-bar-buttons-mixin.js';
import { SlotMixin } from './mixins/slot-mixin.js';
import { InteractionsMixin } from './menu-bar-interactions-mixin.js';
import '@vaadin/vaadin-menu-bar/src/vaadin-menu-bar-submenu.js';
import './v-menu-bar-button.js';

class VMenuBar extends ButtonsMixin(InteractionsMixin(SlotMixin(ThemableMixin(PolymerElement)))) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        :host([hidden]) {
          display: none !important;
        }

        [part='container'] {
          position: relative;
          display: flex;
          width: 100%;
          flex-wrap: nowrap;
          overflow: hidden;
          padding: 2px;
        }

        ::slotted([vaadin-menu-bar-button]) {
          flex-shrink: 0;
        }

        ::slotted([slot='overflow']) {
          margin-right: 0;
        }

        ::slotted([slot='overflow'])::before {
          display: block;
          content: '\\00B7\\00B7\\00B7';
          font-size: inherit;
          line-height: inherit;
        }
      </style>

      <div part="container">
        <slot></slot>
        <span hidden$="[[!_hasOverflow]]">
          <slot name="overflow"></slot>
        </span>
      </div>
      <vaadin-menu-bar-submenu is-root=""></vaadin-menu-bar-submenu>
    `;
  }

  static get is() {
    return 'vaadin-menu-bar';
  }

  static get properties() {
    return {
      items: {
        type: Array,
        value: () => []
      }
    };
  }

  get slots() {
    return {
      ...super.slots,
      overflow: () => {
        const overflow = document.createElement('vaadin-menu-bar-button');
        return overflow;
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    if (this._overflow) {
      const native = this._overflow.$.button;
      native.setAttribute('role', 'menuitem');
      native.setAttribute('aria-haspopup', 'true');
      native.setAttribute('aria-expanded', 'false');
    }
  }
}

customElements.define(VMenuBar.is, VMenuBar);

export { VMenuBar };
