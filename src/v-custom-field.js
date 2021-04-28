import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { LabelMixin } from './mixins/label-mixin.js';
import { HelperTextMixin } from './mixins/helper-text-mixin.js';
import { ValidateMixin } from './mixins/validate-mixin.js';
import { FieldAriaMixin } from './mixins/field-aria-mixin.js';
import { CustomFieldMixin } from './custom-field-mixin.js';

class VCustomField extends CustomFieldMixin(
  FieldAriaMixin(ValidateMixin(LabelMixin(HelperTextMixin(ThemableMixin(PolymerElement)))))
) {
  static get template() {
    return html`
      <style>
        :host {
          display: inline-flex;
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

        .container {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .inputs-wrapper {
          flex: none;
        }
      </style>
      <div class="container">
        <div part="label">
          <slot name="label"></slot>
        </div>

        <div class="inputs-wrapper" on-change="__updateValue">
          <slot id="slot"></slot>
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

  static get is() {
    return 'vaadin-custom-field';
  }

  static get properties() {
    return {
      /**
       * The name of the control, which is submitted with the form data.
       */
      name: String,

      /**
       * The value of the field. When wrapping several inputs, it will contain `\t`
       * (Tab character) as a delimiter indicating parts intended to be used as the
       * corresponding inputs values. Use the [`i18n`](#/elements/vaadin-custom-field#property-i18n)
       * property to customize this behavior.
       */
      value: {
        type: String,
        observer: '__valueChanged',
        notify: true
      }
    };
  }

  static get observers() {
    return ['__toggleHasValue(value)'];
  }

  /** @protected */
  get _ariaAttr() {
    return 'aria-labelledby';
  }

  /** @protected */
  ready() {
    super.ready();

    // See https://github.com/vaadin/vaadin-web-components/issues/94
    this.setAttribute('role', 'group');
  }

  /**
   * Returns true if the current inputs values satisfy all constraints (if any)
   * @return {boolean}
   */
  checkValidity() {
    const invalidFields = this.inputs.filter((input) => !(input.validate || input.checkValidity).call(input));

    if (invalidFields.length || (this.required && !this.value.trim())) {
      // Either 1. one of the input fields is invalid or
      // 2. the custom field itself is required but doesn't have a value
      return false;
    }
    return true;
  }

  /** @private */
  __toggleHasValue(value) {
    if (value !== null && value.trim() !== '') {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }
  }
}

customElements.define(VCustomField.is, VCustomField);

export { VCustomField };
