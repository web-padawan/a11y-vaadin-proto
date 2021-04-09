import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-date-picker/theme/lumo/vaadin-date-picker-overlay-styles.js';
import '@vaadin/vaadin-date-picker/theme/lumo/vaadin-date-picker-overlay-content-styles.js';
import '@vaadin/vaadin-date-picker/theme/lumo/vaadin-month-calendar-styles.js';
import '@vaadin/vaadin-lumo-styles/font-icons.js';
import './text-field.js';

registerStyles(
  'vaadin-date-picker',
  css`
    :host {
      outline: none;
    }

    [part='toggle-button']::before {
      content: var(--lumo-icons-calendar);
    }

    @media (max-width: 420px), (max-height: 420px) {
      [part='overlay-content'] {
        height: 70vh;
      }
    }
  `,
  { moduleId: 'lumo-date-picker', include: ['lumo-text-field'] }
);
