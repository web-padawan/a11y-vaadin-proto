import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/sizing.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/style.js';
import '@vaadin/vaadin-lumo-styles/font-icons.js';
import '@vaadin/vaadin-lumo-styles/mixins/field-button.js';
import './text-field.js';
import './date-picker.js';
import './time-picker.js';

registerStyles(
  'vaadin-date-time-picker-date-picker',
  css`
    :host {
      margin-right: 2px;
    }

    /* RTL specific styles */
    :host([dir='rtl']) {
      margin-right: auto;
      margin-left: 2px;
    }

    [part='input-field'] {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    /* RTL specific styles */
    :host([dir='rtl']) [part='input-field'] {
      border-radius: var(--lumo-border-radius);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    /* TODO: override in a better way? */
    [part='error-message']::before,
    [part='error-message']::after {
      display: none !important;
    }
  `,
  { moduleId: 'lumo-date-time-picker-date-picker', include: ['lumo-date-picker'] }
);

registerStyles(
  'vaadin-date-time-picker-time-picker',
  css`
    [part='input-field'] {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    /* RTL specific styles */
    :host([dir='rtl']) [part='input-field'] {
      border-radius: var(--lumo-border-radius);
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    /* TODO: override in a better way? */
    [part='error-message']::before,
    [part='error-message']::after {
      display: none !important;
    }
  `,
  { moduleId: 'lumo-date-time-picker-time-picker', include: ['lumo-time-picker'] }
);

registerStyles(
  'vaadin-date-time-picker',
  css`
    /* TODO: would "required-field" mixin be enough? */
  `,
  { moduleId: 'lumo-date-time-picker', include: ['lumo-text-field'] }
);
