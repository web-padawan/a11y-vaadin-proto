import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ButtonsMixin } from './menu-bar-buttons-mixin.js';
import { InteractionsMixin } from './menu-bar-interactions-mixin.js';
import '@vaadin/vaadin-menu-bar/src/vaadin-menu-bar-submenu.js';
import './v-menu-bar-button.js';

class VMenuBar extends ButtonsMixin(InteractionsMixin(ThemableMixin(PolymerElement))) {
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

        [part$='button'] {
          flex-shrink: 0;
        }

        [part='overflow-button'] {
          margin-right: 0;
        }

        .dots::before {
          display: block;
          content: '\\00B7\\00B7\\00B7';
          font-size: inherit;
          line-height: inherit;
        }
      </style>
      <div part="container">
        <vaadin-menu-bar-button part="overflow-button" hidden$="[[!_hasOverflow]]">
          <div class="dots"></div>
        </vaadin-menu-bar-button>
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
}

customElements.define(VMenuBar.is, VMenuBar);

export { VMenuBar };
