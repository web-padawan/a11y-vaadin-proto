import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/sizing.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/style.js';
import '@vaadin/vaadin-lumo-styles/font-icons.js';
import '@vaadin/vaadin-lumo-styles/mixins/field-button.js';
import './text-field.js';

registerStyles(
  'vaadin-combo-box',
  css`
    [part='toggle-button']::before {
      content: var(--lumo-icons-dropdown);
    }

    /* Highlight the toggle button when hovering over the entire component */
    :host(:hover:not([readonly]):not([disabled])) [part='toggle-button'] {
      color: var(--lumo-contrast-80pct);
    }
  `,
  { moduleId: 'lumo-combo-box', include: ['lumo-text-field'] }
);
