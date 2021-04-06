import { PolymerElement, html } from '@polymer/polymer';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { DisabledMixin } from './mixins/disabled-mixin.js';
import { FocusMixin } from './mixins/focus-mixin.js';
import { LabelMixin } from './mixins/label-mixin.js';
import { HelperTextMixin } from './mixins/helper-text-mixin.js';
import { ValidateMixin } from './mixins/validate-mixin.js';
import { VRadioButton } from './v-radio-button.js';

export class VRadioGroup extends ValidateMixin(
  HelperTextMixin(LabelMixin(FocusMixin(DisabledMixin(ThemableMixin(PolymerElement)))))
) {
  static get is() {
    return 'vaadin-radio-group';
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
      <div class="container">
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
       * Value of the radio group.
       */
      value: {
        type: String,
        notify: true,
        observer: '_valueChanged'
      },

      /**
       * This attribute indicates that the user cannot modify the value of the control.
       */
      readonly: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_readonlyChanged'
      }
    };
  }

  /** @private */
  get _radioButtons() {
    return this._filterRadioButtons(this.querySelectorAll('*'));
  }

  ready() {
    super.ready();

    // See https://github.com/vaadin/vaadin-web-components/issues/94
    this.setAttribute('role', 'radiogroup');
    this.setAttribute('aria-labelledby', this._labelId);
    this.setAttribute('aria-describedby', `${this._helperId} ${this._errorId}`);

    this._addListeners();

    this._observer = new FlattenedNodesObserver(this, (info) => {
      const checkedChangedListener = (e) => {
        if (e.target.checked) {
          this._changeSelectedButton(e.target);
        }
      };

      // reverse() is used to set the last checked radio button value to radio group value
      this._filterRadioButtons(info.addedNodes)
        .reverse()
        .forEach((button) => {
          button.addEventListener('checked-changed', checkedChangedListener);

          if (this.disabled) {
            button.disabled = true;
          }

          if (button.checked) {
            this._changeSelectedButton(button);
          }
        });

      this._filterRadioButtons(info.removedNodes).forEach((button) => {
        button.removeEventListener('checked-changed', checkedChangedListener);

        if (button == this._checkedButton) {
          this.value = undefined;
        }
      });
    });

    if (this._radioButtons.length) {
      this._setFocusable(0);
    }
  }

  /** @private */
  _filterRadioButtons(nodes) {
    return Array.from(nodes).filter((child) => child instanceof VRadioButton);
  }

  /**
   * @param {boolean} disabled
   * @protected
   */
  _disabledChanged(disabled) {
    super._disabledChanged(disabled);

    this._updateDisableButtons();
  }

  /**
   * @return {boolean}
   * @protected
   */
  _shouldSetFocus() {
    return this._containsFocus();
  }

  /**
   * @param {Event} e
   * @return {boolean}
   * @protected
   */
  _shouldRemoveFocus(e) {
    return !this._radioButtons.some((radio) => radio.contains(e.relatedTarget));
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

  /** @private */
  _updateDisableButtons() {
    this._radioButtons.forEach((button) => {
      if (this.disabled) {
        button.disabled = true;
      } else if (this.readonly) {
        // it's not possible to set readonly to radio buttons, but we can
        // unchecked ones instead.
        button.disabled = button !== this._checkedButton && this.readonly;
      } else {
        button.disabled = false;
      }
    });
  }

  /** @private */
  _readonlyChanged(newV, oldV) {
    (newV || oldV) && this._updateDisableButtons();
  }

  /** @private */
  _addListeners() {
    this.addEventListener('keydown', (e) => {
      const checkedRadioButton = e.target.parentElement;
      const horizontalRTL = this.getAttribute('dir') === 'rtl' && this.theme !== 'vertical';

      // LEFT, UP - select previous radio button
      if (e.keyCode === 37 || e.keyCode === 38) {
        e.preventDefault();
        this._selectIncButton(horizontalRTL, checkedRadioButton);
      }

      // RIGHT, DOWN - select next radio button
      if (e.keyCode === 39 || e.keyCode === 40) {
        e.preventDefault();
        this._selectIncButton(!horizontalRTL, checkedRadioButton);
      }
    });
  }

  /**
   * @param {boolean} next
   * @param {!RadioButtonElement} checkedRadioButton
   * @protected
   */
  _selectIncButton(next, checkedRadioButton) {
    if (next) {
      this._selectNextButton(checkedRadioButton);
    } else {
      this._selectPreviousButton(checkedRadioButton);
    }
  }

  /**
   * @param {!RadioButtonElement} element
   * @param {boolean=} setFocusRing
   * @protected
   */
  _selectButton(element, setFocusRing) {
    if (this._containsFocus()) {
      element.focus();
      if (setFocusRing) {
        element.setAttribute('focus-ring', '');
      }
    }
    this._changeSelectedButton(element, setFocusRing);
  }

  /**
   * @return {boolean}
   * @protected
   */
  _containsFocus() {
    const activeElement = this.getRootNode().activeElement;
    return this.contains(activeElement);
  }

  /**
   * @return {boolean}
   * @protected
   */
  _hasEnabledButtons() {
    return !this._radioButtons.every((button) => button.disabled);
  }

  /**
   * @param {!RadioButtonElement} element
   * @protected
   */
  _selectNextButton(element) {
    if (!this._hasEnabledButtons()) {
      return;
    }

    const nextButton = element.nextElementSibling || this._radioButtons[0];

    if (nextButton.disabled) {
      this._selectNextButton(nextButton);
    } else {
      this._selectButton(nextButton, true);
    }
  }

  /**
   * @param {!RadioButtonElement} element
   * @protected
   */
  _selectPreviousButton(element) {
    if (!this._hasEnabledButtons()) {
      return;
    }

    const previousButton = element.previousElementSibling || this._radioButtons[this._radioButtons.length - 1];

    if (previousButton.disabled) {
      this._selectPreviousButton(previousButton);
    } else {
      this._selectButton(previousButton, true);
    }
  }

  /**
   * @param {RadioButtonElement} button
   * @param {boolean=} fireChangeEvent
   * @protected
   */
  _changeSelectedButton(button, fireChangeEvent) {
    if (this._checkedButton === button) {
      return;
    }

    this._checkedButton = button;

    if (this._checkedButton) {
      this.value = this._checkedButton.value;
    }

    this._radioButtons.forEach((button) => {
      if (button === this._checkedButton) {
        if (fireChangeEvent) {
          button.click();
        } else {
          button.checked = true;
        }
      } else {
        button.checked = false;
      }
    });

    this.validate();
    this.readonly && this._updateDisableButtons();
    button && this._setFocusable(this._radioButtons.indexOf(button));
  }

  /** @private */
  _valueChanged(newV, oldV) {
    if (oldV && (newV === '' || newV === null || newV === undefined)) {
      this._changeSelectedButton(null);
      this.removeAttribute('has-value');
      return;
    }

    if (!this._checkedButton || newV != this._checkedButton.value) {
      const newCheckedButton = this._radioButtons.filter((button) => button.value == newV)[0];

      if (newCheckedButton) {
        this._selectButton(newCheckedButton);
        this.setAttribute('has-value', '');
      } else {
        console.warn(`No <vaadin-radio-button> with value ${newV} found.`);
      }
    }
  }

  /**
   * @param {number} idx
   * @protected
   */
  _setFocusable(idx) {
    const items = this._radioButtons;
    items.forEach((radio) => (radio.focusElement.tabIndex = radio === items[idx] ? 0 : -1));
  }
}

customElements.define(VRadioGroup.is, VRadioGroup);
