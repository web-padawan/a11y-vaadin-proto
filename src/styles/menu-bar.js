import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';

registerStyles(
  'vaadin-menu-bar-button',
  css`
    :host {
      margin: calc(var(--lumo-space-xs) / 2);
      margin-left: 0;
      border-radius: 0;
    }

    :host([expanded]) [part='button'] {
      background-color: var(--lumo-primary-color-10pct);
    }
  `,
  { moduleId: 'lumo-menu-bar-button' }
);
