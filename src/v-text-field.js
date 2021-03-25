import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { TextFieldMixin } from './mixins/text-field-mixin.js';
import './styles/text-field-shared.js';

export class VTextField extends TextFieldMixin(ThemableMixin(PolymerElement)) {
  static get is() {
    return 'v-text-field';
  }

  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles"></style>

      <div class="vaadin-text-field-container" part="container">
        <div part="label" on-click="focus">
          <slot name="label"></slot>
        </div>

        <div part="input-field">
          <slot name="prefix"></slot>
          <slot name="input"></slot>
          <slot name="suffix"></slot>
        </div>

        <div part="helper-text" on-click="focus">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>
    `;
  }

  constructor() {
    super();
    this._setType('text');
  }
}

customElements.define(VTextField.is, VTextField);
