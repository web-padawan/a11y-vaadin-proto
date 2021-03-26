import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { ActiveMixin } from './mixins/active-mixin.js';
import { CheckedMixin } from './mixins/checked-mixin.js';
import { InputAriaMixin } from './mixins/input-aria-mixin.js';
import { SlotLabelMixin } from './mixins/slot-label-mixin.js';

export class VCheckbox extends SlotLabelMixin(
  CheckedMixin(InputAriaMixin(ActiveMixin(ThemableMixin(PolymerElement))))
) {
  static get is() {
    return 'v-checkbox';
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
        <div part="checkbox">
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

  static get properties() {
    return {
      /**
       * Indeterminate state of the checkbox when it's neither checked nor unchecked, but undetermined.
       * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#Indeterminate_state_checkboxes
       * @type {boolean}
       */
      indeterminate: {
        type: Boolean,
        notify: true,
        observer: '_indeterminateChanged',
        reflectToAttribute: true,
        value: false
      }
    };
  }

  get _noopSlot() {
    return this.$.noop;
  }

  constructor() {
    super();
    this._setType('checkbox');
    this.value = 'on';
  }

  connectedCallback() {
    super.connectedCallback();

    if (this._inputNode) {
      this._inputNode.indeterminate = this.indeterminate;
    }
  }

  /** @private */
  _indeterminateChanged(indeterminate) {
    if (indeterminate && this._inputNode) {
      this._inputNode.indeterminate = indeterminate;
    }
  }

  /** @protected */
  _toggleChecked() {
    this.indeterminate = false;

    super._toggleChecked();
  }

  /** @protected */
  _toggleAriaChecked() {
    if (this.indeterminate) {
      this.setAttribute('aria-checked', 'mixed');
    } else {
      this.setAttribute('aria-checked', Boolean(this.checked));
    }
  }
}

customElements.define(VCheckbox.is, VCheckbox);
