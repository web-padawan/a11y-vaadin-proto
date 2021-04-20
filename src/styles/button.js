import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/style.js';

registerStyles(
  'v-button',
  css`
    :host {
      display: inline-block;
    }

    [part='button'] {
      --lumo-button-size: var(--lumo-size-m);
      background-color: var(--lumo-contrast-5pct);
      border: none;
      border-radius: var(--lumo-border-radius);
      box-sizing: border-box;
      color: var(--lumo-primary-text-color);
      cursor: var(--lumo-clickable-cursor);
      font-family: var(--lumo-font-family);
      font-size: var(--lumo-font-size-m);
      font-weight: 500;
      height: var(--lumo-button-size);
      line-height: var(--lumo-button-size);
      min-width: calc(var(--lumo-button-size) * 2);
      padding: 0 calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius) / 2);
      position: relative;
      outline: none;
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
    }

    /* Sizes */
    :host([theme~='small']) [part='button'] {
      --lumo-button-size: var(--lumo-size-s);
      font-size: var(--lumo-font-size-s);
    }

    :host([theme~='large']) [part='button'] {
      --lumo-button-size: var(--lumo-size-l);
      font-size: var(--lumo-font-size-l);
    }

    /* Element states */
    [part='button']::before,
    [part='button']::after {
      background-color: currentColor;
      border-radius: inherit;
      bottom: 0;
      content: '';
      left: 0;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: opacity 0.2s;
      z-index: 1;
    }

    /* Hover */
    [part='button']:hover::before {
      opacity: 0.05;
    }

    @media (pointer: coarse) {
      [part='button']:not(:active):hover::before {
        opacity: 0;
      }
    }

    /* Active */
    [part='button']::after {
      filter: blur(8px);
      transition: opacity 1.4s, transform 0.1s;
    }

    [part='button']:active::before {
      opacity: 0.1;
      transition-duration: 0s;
    }

    [part='button']:active::after {
      opacity: 0.1;
      transform: scale(0);
      transition-duration: 0s, 0s;
    }

    /* Focus */
    :host([focus-ring]) [part='button'] {
      box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
      outline: none;
    }

    /* Tertiary & tertiary inline */
    :host([theme~='tertiary']) [part='button'],
    :host([theme~='tertiary-inline']) [part='button'] {
      background-color: transparent;
      min-width: 0;
      transition: opacity 0.2s;
    }

    :host([theme~='tertiary']) [part='button']::before,
    :host([theme~='tertiary-inline']) [part='button']::before {
      display: none;
    }

    :host([theme~='tertiary']) [part='button'] {
      padding: 0 calc(var(--lumo-button-size) / 6);
    }

    @media (hover: hover) {
      :host([theme*='tertiary']) [part='button']:not(:active):hover {
        opacity: 0.8;
      }
    }

    :host([theme~='tertiary']) [part='button']:active,
    :host([theme~='tertiary-inline']) [part='button']:active {
      opacity: 0.5;
      transition-duration: 0s;
    }

    :host([theme~='tertiary-inline']) [part='button'] {
      font-size: inherit;
      height: auto;
      line-height: inherit;
      margin: 0;
      padding: 0;
    }

    /* Primary */
    :host([theme~='primary']) [part='button'] {
      background-color: var(--lumo-primary-color);
      color: var(--lumo-primary-contrast-color);
      font-weight: 600;
      min-width: calc(var(--lumo-button-size) * 2.5);
    }

    :host([theme~='primary']) [part='button']:hover::before {
      opacity: 0.1;
    }

    :host([theme~='primary']) [part='button']:active::before {
      background-color: var(--lumo-shade-20pct);
    }

    @media (pointer: coarse) {
      :host([theme~='primary']) [part='button']:active::before {
        background-color: var(--lumo-shade-60pct);
      }

      :host([theme~='primary']) [part='button']:not(:active):hover::before {
        opacity: 0;
      }
    }

    :host([theme~='primary']) [part='button']:active::after {
      opacity: 0.2;
    }

    /* Success */
    :host([theme~='success']) [part='button'] {
      color: var(--lumo-success-text-color);
    }

    :host([theme~='success'][theme~='primary']) [part='button'] {
      background-color: var(--lumo-success-color);
      color: var(--lumo-success-contrast-color);
    }

    /* Error */
    :host([theme~='error']) [part='button'] {
      color: var(--lumo-error-text-color);
    }

    :host([theme~='error'][theme~='primary']) [part='button'] {
      background-color: var(--lumo-error-color);
      color: var(--lumo-error-contrast-color);
    }

    /* Contrast */
    :host([theme~='contrast']) [part='button'] {
      color: var(--lumo-contrast);
    }

    :host([theme~='contrast'][theme~='primary']) [part='button'] {
      background-color: var(--lumo-contrast);
      color: var(--lumo-base-color);
    }

    /* Icons */
    ::slotted(iron-icon) {
      display: inline-block;
      height: var(--lumo-icon-size-m);
      margin-top: calc((var(--lumo-button-size) - var(--lumo-icon-size-m)) / 2);
      vertical-align: top;
      width: var(--lumo-icon-size-m);
    }

    :host([theme~='tertiary-inline']) ::slotted(iron-icon) {
      margin-top: 0;
    }

    ::slotted(iron-icon[slot='prefix']) {
      margin-left: calc(var(--lumo-space-xs) * -1);
    }

    ::slotted(iron-icon[slot='suffix']) {
      margin-right: calc(var(--lumo-space-xs) * -1);
    }

    /* Icon-only */
    :host([theme~='icon']:not([theme~='tertiary-inline'])) [part='button'] {
      min-width: var(--lumo-button-size);
      padding-left: calc(var(--lumo-button-size) / 4);
      padding-right: calc(var(--lumo-button-size) / 4);
    }

    /* Disabled */
    [part='button'][disabled] {
      background-color: var(--lumo-contrast-5pct);
      color: var(--lumo-disabled-text-color);
      pointer-events: none;
    }

    :host([theme~='primary']) [part='button'][disabled] {
      background-color: var(--lumo-primary-color-50pct);
      color: var(--lumo-primary-contrast-color);
    }

    :host([theme~='success'][theme~='primary']) [part='button'][disabled] {
      background-color: var(--lumo-success-color-50pct);
    }

    :host([theme~='error'][theme~='primary']) [part='button'][disabled] {
      background-color: var(--lumo-error-color-50pct);
    }

    :host([theme~='contrast'][theme~='primary']) [part='button'][disabled] {
      background-color: var(--lumo-contrast-50pct);
    }
  `,
  { moduleId: 'lumo-button-next' }
);
