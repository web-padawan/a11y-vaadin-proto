import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';

registerStyles(
  '',
  css`
    :host {
      display: inline-flex;
      outline: none;
    }

    :host::before {
      content: '\\2003';
      width: 0;
      display: inline-block;
      /* Size and position this element on the same vertical position as the input-field element
           to make vertical align for the host element work as expected */
    }

    :host([hidden]) {
      display: none !important;
    }

    [part='container'] {
      display: flex;
      flex-direction: column;
      min-width: 100%;
      max-width: 100%;
      width: var(--vaadin-text-field-default-width, 12em);
    }

    [part='label']:empty {
      display: none;
    }

    [part='input-field'] {
      display: flex;
      align-items: center;
      flex: auto;
      /* TODO: text-field only */
      flex-grow: 0;
    }

    /* Reset the native input styles */
    [part='input-field'] ::slotted([slot='input']) {
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

    [part='input-field'] ::slotted(*) {
      flex: none;
    }

    [part='input-field'] ::slotted([slot='input']) {
      flex: auto;
      white-space: nowrap;
      overflow: hidden;
      width: 100%;
      height: 100%;
    }

    [part='input-field'] ::slotted(textarea) {
      resize: none;
    }

    [part='clear-button'] {
      display: none;
      cursor: default;
    }

    [part='clear-button']::before {
      content: '✕';
    }

    :host([clear-button-visible][has-value]:not([disabled]):not([readonly])) [part='clear-button'] {
      display: block;
    }
  `,
  { moduleId: 'vaadin-text-field-shared-styles' }
);
