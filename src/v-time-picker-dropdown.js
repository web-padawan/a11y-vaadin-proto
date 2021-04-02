import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ComboBoxMixin } from '@vaadin/vaadin-combo-box/src/vaadin-combo-box-mixin.js';
import '@vaadin/vaadin-combo-box/src/vaadin-combo-box-dropdown-wrapper.js';

class VTimePickerDropdown extends ThemableMixin(ComboBoxMixin(PolymerElement)) {
  static get is() {
    return 'vaadin-time-picker-dropdown';
  }

  static get template() {
    return html`
      <slot></slot>
      <vaadin-combo-box-dropdown-wrapper
        id="overlay"
        opened="[[opened]]"
        position-target="[[positionTarget]]"
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
      positionTarget: Object,

      inputElement: {
        type: Object,
        readOnly: true
      }
    };
  }

  constructor() {
    super();
    this._boundInputValueChanged = this._inputValueChanged.bind(this);
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

  ready() {
    super.ready();

    this.renderer = (root, _combo, model) => {
      root.textContent = model.item.label;
    };

    this.positionTarget = this.querySelector('vaadin-input-container');
    this._toggleElement = this.querySelector('[part="toggle-button"]');
  }

  setInput(input) {
    // TODO: refactor ComboBoxMixin logic
    this._setInputElement(input);
    this._nativeInput = input;
    input.addEventListener('input', this._boundInputValueChanged);
  }

  /** @protected */
  _onClick(e) {
    // TODO: here we override ComboBoxMixin listener to make toggle button work
    this._closeOnBlurIsPrevented = true;

    const path = e.composedPath();

    if (path.indexOf(this._toggleElement) > -1 && this.opened) {
      this.close();
    } else if (path.indexOf(this._toggleElement) > -1 || !this.autoOpenDisabled) {
      this.open();
    }

    this._closeOnBlurIsPrevented = false;
  }
}

customElements.define(VTimePickerDropdown.is, VTimePickerDropdown);
