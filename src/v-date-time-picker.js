import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { LabelMixin } from './mixins/label-mixin.js';
import { HelperTextMixin } from './mixins/helper-text-mixin.js';
import { ValidateMixin } from './mixins/validate-mixin.js';
import { SlotMixin } from './mixins/slot-mixin.js';
import './styles/text-field-shared.js';
import { VDatePicker } from './v-date-picker.js';
import { VTimePicker } from './v-time-picker.js';

customElements.define(
  'vaadin-date-time-picker-date-picker',
  class extends VDatePicker {
    static get is() {
      return 'vaadin-date-time-picker-date-picker';
    }
  }
);

customElements.define(
  'vaadin-date-time-picker-time-picker',
  class extends VTimePicker {
    static get is() {
      return 'vaadin-date-time-picker-time-picker';
    }
  }
);

export class VDateTimePicker extends ValidateMixin(
  HelperTextMixin(LabelMixin(SlotMixin(ThemableMixin(PolymerElement))))
) {
  static get is() {
    return 'vaadin-date-time-picker';
  }

  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles">
        :host {
          display: inline-block;
        }

        :host([hidden]) {
          display: none !important;
        }

        .slot-container {
          display: flex;
        }

        .slot-container ::slotted([slot='date-picker']) {
          pointer-events: all;
          min-width: 0;
          flex: 1 1 auto;
        }

        .slot-container ::slotted([slot='time-picker']) {
          pointer-events: all;
          min-width: 0;
          flex: 1 1.65 auto;
        }

        /* TODO: override text-field shared styles */
        :host::before {
          display: none !important;
        }

        [part='container'] {
          width: auto;
        }
      </style>

      <div part="container">
        <div part="label">
          <slot name="label"></slot>
        </div>

        <div class="slot-container">
          <slot name="date-picker" id="dateSlot"></slot>
          <slot name="time-picker" id="timeSlot"></slot>
        </div>

        <div part="helper-text">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>
    `;
  }

  static get observers() {
    return ['__invalidChanged(invalid)', '__requiredChanged(required)'];
  }

  get slots() {
    return {
      ...super.slots,
      'date-picker': () => {
        const picker = document.createElement('vaadin-date-time-picker-date-picker');
        return picker;
      },
      'time-picker': () => {
        const picker = document.createElement('vaadin-date-time-picker-time-picker');
        return picker;
      }
    };
  }

  // TODO: the code is incomplete and only concerns ARIA attributes.

  /** @protected */
  connectedCallback() {
    super.connectedCallback();

    this.__datePicker = this._getDirectSlotChild('date-picker');
    this.__timePicker = this._getDirectSlotChild('time-picker');

    this.setAttribute('role', 'group');
    this.setAttribute('aria-labelledby', this._labelId);

    // TODO: handle error message same as in FieldAriaMixin

    if (this.__datePicker) {
      // add accessible label
      this.__datePicker._inputNode.removeAttribute('aria-labelledby');
      // TODO: expose the "Date" label under i18n object
      this.__datePicker._inputNode.setAttribute('aria-label', 'Date');

      this.__datePicker.invalid = this.invalid;
    }

    if (this.__timePicker) {
      // add accessible label
      this.__timePicker._inputNode.removeAttribute('aria-labelledby');
      // TODO: expose the "Time" label under i18n object
      this.__timePicker._inputNode.setAttribute('aria-label', 'Time');

      this.__timePicker.invalid = this.invalid;
    }

    this._updateAriaAttribute(this.invalid);
  }

  // TODO: logic below is a copy from FieldAriaMixin, consider using it directly

  /** @protected */
  _updateAriaAttribute() {
    const ariaIds = [this._helperId];

    ariaIds.push(this._errorId);

    // TODO: commented for testing
    // if (invalid) {
    //   ariaIds.push(this._errorId);
    // }

    const value = ariaIds.join(' ');

    if (this.__datePicker) {
      this.__datePicker._inputNode.setAttribute('aria-describedby', value);
    }

    if (this.__timePicker) {
      this.__timePicker._inputNode.setAttribute('aria-describedby', value);
    }
  }

  /** @private */
  __invalidChanged(invalid) {
    if (this.__datePicker) {
      this.__datePicker.invalid = invalid;
    }
    if (this.__timePicker) {
      this.__timePicker.invalid = invalid;
    }

    // Override attributes set by pickers
    this._updateAriaAttribute(invalid);
  }

  /** @private */
  __requiredChanged(required) {
    if (this.__datePicker) {
      this.__datePicker.required = required;
    }
    if (this.__timePicker) {
      this.__timePicker.required = required;
    }
  }

}

customElements.define(VDateTimePicker.is, VDateTimePicker);
