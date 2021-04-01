import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/sizing.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/style.js';
import '@vaadin/vaadin-lumo-styles/font-icons.js';
import '@vaadin/vaadin-lumo-styles/mixins/menu-overlay.js';
import '@vaadin/vaadin-lumo-styles/mixins/field-button.js';
import '@vaadin/vaadin-item/theme/lumo/vaadin-item.js';
import '@vaadin/vaadin-list-box/theme/lumo/vaadin-list-box.js';
import './text-field.js';

registerStyles(
  'v-select',
  css`
    [part='input-field'] ::slotted(button[slot='input']) {
      text-align: left;
    }

    :host(:not([has-value])) [part='input-field'] ::slotted(button[slot='input']) {
      color: inherit;
      transition: opacity 0.175s 0.1s;
      opacity: 0.5;
    }

    [part='toggle-button']::before {
      content: var(--lumo-icons-dropdown);
    }

    /* Highlight the toggle button when hovering over the entire component */
    :host(:hover:not([readonly]):not([disabled])) [part='toggle-button'] {
      color: var(--lumo-contrast-80pct);
    }
  `,
  { moduleId: 'lumo-select', include: ['lumo-text-field'] }
);

registerStyles(
  'v-select-overlay',
  css`
    :host {
      --_lumo-item-selected-icon-display: block;
    }

    :host([bottom-aligned]) {
      justify-content: flex-end;
    }

    [part~='overlay'] {
      min-width: var(--vaadin-select-text-field-width);
    }

    /* Small viewport adjustment */
    :host([phone]) {
      top: 0 !important;
      right: 0 !important;
      bottom: var(--vaadin-overlay-viewport-bottom, 0) !important;
      left: 0 !important;
      align-items: stretch;
      justify-content: flex-end;
    }

    :host([theme~='align-left']) {
      text-align: left;
    }

    :host([theme~='align-right']) {
      text-align: right;
    }

    :host([theme~='align-center']) {
      text-align: center;
    }
  `,
  { include: ['lumo-menu-overlay'], moduleId: 'lumo-select-overlay' }
);
