import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { InputPropsMixin } from './mixins/input-props-mixin.js';
import { FieldAriaMixin } from './mixins/field-aria-mixin.js';
import { ComboBoxMixin } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box-mixin.js';
import { ComboBoxDataProviderMixin } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box-data-provider-mixin.js';
import '@vaadin/vaadin-combo-box/src/vaadin-combo-box-dropdown-wrapper.js';
import './styles/text-field-shared.js';
import './v-input-container.js';

export class VComboBox extends ComboBoxDataProviderMixin(
  ComboBoxMixin(FieldAriaMixin(InputPropsMixin(ThemableMixin(PolymerElement))))
) {
  static get is() {
    return 'vaadin-combo-box';
  }

  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles"></style>

      <div part="container">
        <div part="label" on-click="focus">
          <slot name="label"></slot>
        </div>

        <vaadin-input-container part="input-field" readonly="[[readonly]]" disabled="[[disabled]]">
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input" slot="input"></slot>
          <slot name="suffix" slot="suffix"></slot>
          <div id="clearButton" part="clear-button" slot="suffix"></div>
          <div id="toggleButton" part="toggle-button" slot="suffix"></div>
        </vaadin-input-container>

        <div part="helper-text" on-click="focus">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <vaadin-combo-box-dropdown-wrapper
        id="overlay"
        opened="[[opened]]"
        position-target="[[_positionTarget]]"
        _focused-index="[[_focusedIndex]]"
        _item-id-path="[[itemIdPath]]"
        _item-label-path="[[itemLabelPath]]"
        loading="[[loading]]"
        theme="[[theme]]"
      ></vaadin-combo-box-dropdown-wrapper>
    `;
  }

  static get properties() {
    return {
      /**
       * Set true to prevent the overlay from opening automatically.
       * @attr {boolean} auto-open-disabled
       */
      autoOpenDisabled: Boolean,

      /** @protected */
      inputElement: {
        type: Object,
        readOnly: true
      },

      /** @private */
      _positionTarget: Object
    };
  }

  constructor() {
    super();
    this._setType('text');
    this._boundInputValueChanged = this._inputValueChanged.bind(this);
  }

  /** @protected */
  get _ariaTarget() {
    return this._inputNode;
  }

  /**
   * @return {string}
   * @protected
   */
  get _inputElementValue() {
    return this.inputElement && this.inputElement.value;
  }

  /**
   * @param {string} value
   * @protected
   */
  set _inputElementValue(value) {
    if (this.inputElement) {
      this.inputElement.value = value;
    }
  }

  /** @protected */
  get _clearOnEsc() {
    return false;
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();

    this._preventInputBlur();

    if (this._inputNode) {
      this._inputNode.setAttribute('role', 'combobox');
      this._inputNode.setAttribute('aria-autocomplete', 'list');
      this._inputNode.setAttribute('aria-expanded', 'false');

      this._inputNode.setAttribute('autocomplete', 'off');

      this._setInputElement(this._inputNode);
      this._nativeInput = this._inputNode;
      this._inputNode.addEventListener('input', this._boundInputValueChanged);
    }
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();

    this._restoreInputBlur();
  }

  /** @protected */
  ready() {
    super.ready();

    this._positionTarget = this.shadowRoot.querySelector('vaadin-input-container');
    this._toggleElement = this.$.toggleButton;
    this._clearElement = this.$.clearButton;
  }

  // TODO: here we override `validate` and `checkValidity` from ComboBoxMixin

  /**
   * Returns true if `value` is valid.
   *
   * @return {boolean} True if the value is valid.
   */
  validate() {
    return !(this.invalid = !this.checkValidity());
  }

  /**
   * Returns true if the current input value satisfies all constraints (if any)
   * @return {boolean}
   */
  checkValidity() {
    return !this.required || !!this.value;
  }

  /**
   * @param {boolean} focused
   * @protected
   */
  _setFocused(focused) {
    super._setFocused(focused);

    if (!focused) {
      this.validate();
    }
  }

  /** @protected */
  _onClick(e) {
    // TODO: here we override ComboBoxMixin listener to make toggle button work
    this._closeOnBlurIsPrevented = true;

    const path = e.composedPath();

    if (path.indexOf(this._clearElement) !== -1) {
      this._clear();
      this.focus();
    } else if (path.indexOf(this._toggleElement) !== -1) {
      if (this.opened) {
        this.close();
      } else if (!this.autoOpenDisabled) {
        this.open();
      }
    }

    this._closeOnBlurIsPrevented = false;
  }
}

customElements.define(VComboBox.is, VComboBox);
