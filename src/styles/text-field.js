import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/sizing.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/style.js';
import '@vaadin/vaadin-lumo-styles/typography.js';
import '@vaadin/vaadin-lumo-styles/mixins/required-field.js';
import '@vaadin/vaadin-lumo-styles/font-icons.js';
import '@vaadin/vaadin-lumo-styles/mixins/field-button.js';

registerStyles(
  'vaadin-text-field',
  css`
    :host {
      --lumo-text-field-size: var(--lumo-size-m);
      color: var(--lumo-body-text-color);
      font-size: var(--lumo-font-size-m);
      font-family: var(--lumo-font-family);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      -webkit-tap-highlight-color: transparent;
      padding: var(--lumo-space-xs) 0;
    }

    :host::before {
      height: var(--lumo-text-field-size);
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
    }

    :host([focused]:not([readonly])) [part='label'] {
      color: var(--lumo-primary-text-color);
    }

    :host([has-helper]) [part='helper-text']::before {
      content: '';
      display: block;
      height: 0.4em;
    }

    [part='helper-text'] ::slotted(*) {
      display: block;
      color: var(--lumo-secondary-text-color);
      font-size: var(--lumo-font-size-xs);
      line-height: var(--lumo-line-height-xs);
      margin-left: calc(var(--lumo-border-radius-m) / 4);
      transition: color 0.2s;
    }

    :host([focused]) [part='input-field'] ::slotted([slot='input']) {
      -webkit-mask-image: none;
      mask-image: none;
    }

    /* Hover */
    :host(:hover:not([readonly]):not([focused])) [part='label'],
    :host(:hover:not([readonly])) [part='helper-text'] ::slotted(*) {
      color: var(--lumo-body-text-color);
    }

    :host(:hover:not([readonly]):not([focused])) [part='input-field']::after {
      opacity: 0.1;
    }

    /* Touch device adjustment */
    @media (pointer: coarse) {
      :host(:hover:not([readonly]):not([focused])) [part='label'] {
        color: var(--lumo-secondary-text-color);
      }

      :host(:hover:not([readonly]):not([focused])) [part='input-field']::after {
        opacity: 0;
      }

      :host(:active:not([readonly]):not([focused])) [part='input-field']::after {
        opacity: 0.2;
      }
    }

    /* Trigger when not focusing using the keyboard */
    :host([focused]:not([focus-ring]):not([readonly])) [part='input-field']::after {
      transform: scaleX(0);
      transition-duration: 0.15s, 1s;
    }

    /* Focus-ring */
    :host([focus-ring]) [part='input-field'] {
      box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
    }

    /* Disabled style */
    :host([disabled]) {
      pointer-events: none;
    }

    :host([disabled]) [part='label'],
    :host([disabled]) [part='helper-text'],
    :host([disabled]) [part='input-field'] ::slotted(*) {
      color: var(--lumo-disabled-text-color);
      -webkit-text-fill-color: var(--lumo-disabled-text-color);
    }

    /* Invalid style */
    :host([invalid]) [part='input-field'] {
      background-color: var(--lumo-error-color-10pct);
    }

    :host([invalid]) [part='input-field']::after {
      background-color: var(--lumo-error-color-50pct);
    }

    :host([invalid][focus-ring]) [part='input-field'] {
      box-shadow: 0 0 0 2px var(--lumo-error-color-50pct);
    }

    :host([input-prevented]) [part='input-field'] {
      color: var(--lumo-error-text-color);
    }

    [part='clear-button']::before {
      content: var(--lumo-icons-cross);
    }

    /* TODO: theme variants and RTL styles are missing */
  `,
  { moduleId: 'lumo-text-field', include: ['lumo-required-field', 'lumo-field-button'] }
);
