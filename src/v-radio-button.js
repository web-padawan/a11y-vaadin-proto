import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { InputFieldMixin } from './mixins/input-field-mixin.js';
import { FocusMixin } from './mixins/focus-mixin.js';
import { ActiveMixin } from './mixins/active-mixin.js';
import { CheckedMixin } from './mixins/checked-mixin.js';

export class VRadioButton extends CheckedMixin(
  InputFieldMixin(ActiveMixin(FocusMixin(ThemableMixin(PolymerElement))))
) {
  static get is() {
    return 'v-radio-button';
  }

  static get template() {
    return html`
      <style>
        :host {
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

        [part='container'] {
          display: inline-flex;
          align-items: baseline;
        }

        /* visually hidden */
        ::slotted(input) {
          border: 0px;
          clip: rect(0px, 0px, 0px, 0px);
          clip-path: inset(50%);
          height: 1px;
          margin: 0px -1px -1px 0px;
          overflow: hidden;
          padding: 0px;
          position: absolute;
          width: 1px;
          white-space: nowrap;
        }
      </style>
      <div part="container">
        <div part="radio">
          <slot name="input"></slot>
        </div>
        <div part="label">
          <slot name="label"></slot>
        </div>
        <div style="display: none !important">
          <slot id="noop"></slot>
        </div>
      </div>
    `;
  }

  get _noopSlot() {
    return this.$.noop;
  }

  constructor() {
    super();
    this._setType('radio');
    this.value = 'on';
  }

  /** @protected */
  _toggleChecked() {
    if (!this.checked) {
      super._toggleChecked();
    }
  }
}

customElements.define(VRadioButton.is, VRadioButton);
