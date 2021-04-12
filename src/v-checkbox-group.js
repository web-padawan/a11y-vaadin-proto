import { PolymerElement, html } from '@polymer/polymer';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { DisabledMixin } from './mixins/disabled-mixin.js';
import { FocusMixin } from './mixins/focus-mixin.js';
import { LabelMixin } from './mixins/label-mixin.js';
import { FieldAriaMixin } from './mixins/field-aria-mixin.js';
import { VCheckbox } from './v-checkbox.js';

export class VCheckboxGroup extends FieldAriaMixin(
  LabelMixin(FocusMixin(DisabledMixin(ThemableMixin(PolymerElement))))
) {
  static get is() {
    return 'vaadin-checkbox-group';
  }

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
        }

        :host([hidden]) {
          display: none !important;
        }

        [part='container'] {
          display: flex;
          flex-direction: column;
        }

        :host(:not([has-label])) [part='label'] {
          display: none;
        }
      </style>
      <div part="container">
        <div part="label">
          <slot name="label"></slot>
        </div>

        <div part="group-field">
          <slot id="slot"></slot>
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

  static get properties() {
    return {
      /**
       * Value of the checkbox group.
       * Toggling the checkboxes modifies the value by creating new array each time.
       * @type {string[]}
       */
      value: {
        type: Array,
        value: () => [],
        notify: true
      }
    };
  }

  static get observers() {
    return ['_updateValue(value, value.splices)'];
  }

  /** @protected */
  get _ariaAttr() {
    return 'aria-labelledby';
  }

  /** @private */
  get _checkboxes() {
    return this._filterCheckboxes(this.querySelectorAll('*'));
  }

  /** @protected */
  ready() {
    super.ready();

    // See https://github.com/vaadin/vaadin-web-components/issues/94
    this.setAttribute('role', 'group');

    const checkedChangedListener = (e) => {
      this._changeSelectedCheckbox(e.target);
    };

    this._observer = new FlattenedNodesObserver(this, (info) => {
      const addedCheckboxes = this._filterCheckboxes(info.addedNodes);

      addedCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('checked-changed', checkedChangedListener);

        if (this.disabled) {
          checkbox.disabled = true;
        }

        if (checkbox.checked) {
          this._addCheckboxToValue(checkbox.value);
        } else if (this.value.indexOf(checkbox.value) > -1) {
          checkbox.checked = true;
        }
      });

      this._filterCheckboxes(info.removedNodes).forEach((checkbox) => {
        checkbox.removeEventListener('checked-changed', checkedChangedListener);

        if (checkbox.checked) {
          this._removeCheckboxFromValue(checkbox.value);
        }
      });

      const hasValue = (checkbox) => {
        const { value } = checkbox;
        return checkbox.hasAttribute('value') || (value && value !== 'on');
      };

      if (!addedCheckboxes.every(hasValue)) {
        console.warn('Please add value attribute to all checkboxes in checkbox group');
      }
    });
  }

  /**
   * Returns true if `value` is valid.
   *
   * @return {boolean} True if the value is valid.
   */
  validate() {
    this.invalid = this.required && this.value.length === 0;
    return !this.invalid;
  }

  /** @private */
  _filterCheckboxes(nodes) {
    return Array.from(nodes).filter((child) => child instanceof VCheckbox);
  }

  /**
   * @param {boolean} disabled
   * @protected
   */
  _disabledChanged(disabled) {
    super._disabledChanged(disabled);

    this._checkboxes.forEach((checkbox) => (checkbox.disabled = disabled));
  }

  /**
   * @return {boolean}
   * @protected
   */
  _shouldSetFocus() {
    const activeElement = this.getRootNode().activeElement;
    return this.contains(activeElement);
  }

  /**
   * @param {Event} e
   * @return {boolean}
   * @protected
   */
  _shouldRemoveFocus(e) {
    return !this._checkboxes.some((checkbox) => checkbox.contains(e.relatedTarget));
  }

  /**
   * @param {boolean} focused
   * @protected
   */
  _setFocused(focused) {
    if (!focused) {
      this.validate();
    }

    super._setFocused(focused);
  }

  /**
   * @param {string} value
   * @protected
   */
  _addCheckboxToValue(value) {
    if (this.value.indexOf(value) === -1) {
      this.value = this.value.concat(value);
    }
  }

  /**
   * @param {string} value
   * @protected
   */
  _removeCheckboxFromValue(value) {
    this.value = this.value.filter((v) => v !== value);
  }

  /**
   * @param {CheckboxElement} checkbox
   * @protected
   */
  _changeSelectedCheckbox(checkbox) {
    if (this._updatingValue) {
      return;
    }

    if (checkbox.checked) {
      this._addCheckboxToValue(checkbox.value);
    } else {
      this._removeCheckboxFromValue(checkbox.value);
    }
  }

  /** @private */
  _updateValue(value) {
    // setting initial value to empty array, skip validation
    if (value.length === 0 && this._oldValue === undefined) {
      return;
    }

    if (value.length) {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }

    this._oldValue = value;
    // set a flag to avoid updating loop
    this._updatingValue = true;
    // reflect the value array to checkboxes
    this._checkboxes.forEach((checkbox) => {
      checkbox.checked = value.indexOf(checkbox.value) > -1;
    });
    this._updatingValue = false;

    this.validate();
  }
}

customElements.define(VCheckboxGroup.is, VCheckboxGroup);
