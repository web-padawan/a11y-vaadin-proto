
import { VButton } from './v-button.js';

class VMenuBarButton extends VButton {
  static get is() {
    return 'vaadin-menu-bar-button';
  }
}

customElements.define(VMenuBarButton.is, VMenuBarButton);
