import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';

export class VInputContainer extends ThemableMixin(PolymerElement) {
  static get is() {
    return 'vaadin-input-container';
  }

  static get template() {
    return html`
      <style>
        :host {
          display: inline-flex;
          outline: none;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Reset the native input styles */
        ::slotted([slot='input']) {
          -webkit-appearance: none;
          -moz-appearance: none;
          outline: none;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 0;
          min-width: 0;
          font: inherit;
          font-size: 1em;
          line-height: normal;
          color: inherit;
          background-color: transparent;
          /* Disable default invalid style in Firefox */
          box-shadow: none;
        }

        ::slotted(*) {
          flex: none;
        }

        ::slotted([slot='input']) {
          flex: auto;
          white-space: nowrap;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }

        ::slotted(textarea) {
          resize: none;
        }
      </style>
      <slot name="prefix"></slot>
      <slot name="input"></slot>
      <slot name="suffix"></slot>
    `;
  }

  static get properties() {
    return {
      /**
       * If true, the user cannot interact with this element.
       */
      disabled: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * This attribute indicates that the user cannot modify the value of the control.
       */
      readonly: {
        type: Boolean,
        reflectToAttribute: true
      }
    };
  }
}

customElements.define(VInputContainer.is, VInputContainer);
