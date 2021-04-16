import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/font-icons.js';
import '@vaadin/vaadin-lumo-styles/sizing.js';

registerStyles(
  'vaadin-password-field',
  css`
    [part='reveal-button'] {
      position: relative;
    }

    [part='reveal-button']::before {
      content: var(--lumo-icons-eye);
    }

    :host([password-visible]) [part='reveal-button']::before {
      content: var(--lumo-icons-eye-disabled);
    }

    [part='reveal-button'] {
      display: var(--lumo-password-field-reveal-button-display, block);
    }

    ::slotted([slot='reveal']) {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background: transparent;
      border: none;
    }
  `,
  { moduleId: 'lumo-password-field' }
);
