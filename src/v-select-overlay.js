import { OverlayElement } from '@vaadin/vaadin-overlay/src/vaadin-overlay.js';
import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';

registerStyles(
  'v-select-overlay',
  css`
    :host {
      align-items: flex-start;
      justify-content: flex-start;
    }
  `,
  { moduleId: 'vaadin-select-overlay-styles' }
);

class SelectOverlayElement extends OverlayElement {
  static get is() {
    return 'v-select-overlay';
  }
}

customElements.define(SelectOverlayElement.is, SelectOverlayElement);
