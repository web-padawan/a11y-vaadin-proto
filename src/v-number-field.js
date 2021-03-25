import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin';
import { InputFieldMixin } from './mixins/input-field-mixin.js';
import './styles/text-field-shared.js';

export class VNumberField extends InputFieldMixin(ThemableMixin(PolymerElement)) {
  static get is() {
    return 'v-number-field';
  }

  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles">
        :host([readonly]) [part$='button'] {
          pointer-events: none;
        }

        [part='decrease-button']::before {
          content: '−';
        }

        [part='increase-button']::before {
          content: '+';
        }

        [part='decrease-button'],
        [part='increase-button'] {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        /* TODO: RTL styles are missing */
      </style>

      <div class="vaadin-text-field-container" part="container">
        <div part="label" on-click="focus">
          <slot name="label"></slot>
        </div>

        <div part="input-field">
          <div
            disabled$="[[!_allowed(-1, value, min, max, step)]]"
            part="decrease-button"
            on-click="_decreaseValue"
            on-touchend="_decreaseButtonTouchend"
            hidden$="[[!hasControls]]"
          ></div>
          <slot name="prefix"></slot>
          <slot name="input"></slot>
          <slot name="suffix"></slot>
          <div
            disabled$="[[!_allowed(1, value, min, max, step)]]"
            part="increase-button"
            on-click="_increaseValue"
            on-touchend="_increaseButtonTouchend"
            hidden$="[[!hasControls]]"
          ></div>
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
       * Set to true to display value increase/decrease controls.
       * @attr {boolean} has-controls
       * @type {boolean}
       */
      hasControls: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
       * The minimum value of the field.
       */
      min: {
        type: Number,
        reflectToAttribute: true,
        observer: '_minChanged'
      },

      /**
       * The maximum value of the field.
       */
      max: {
        type: Number,
        reflectToAttribute: true,
        observer: '_maxChanged'
      },

      /**
       * Specifies the allowed number intervals of the field.
       * @type {number}
       */
      step: {
        type: Number,
        value: 1,
        observer: '_stepChanged'
      }
    };
  }

  get slotStyles() {
    return {
      ...super.slotStyles,
      number: `
        /* Hide the native arrow icons */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `
    };
  }

  constructor() {
    super();
    this._setType('number');
    this._boundOnChange = this.__onInputChange.bind(this);
  }

  /**
   * @param {HTMLElement} node
   * @protected
   */
  _addInputListeners(node) {
    super._addInputListeners(node);

    node.addEventListener('change', this._boundOnChange);
  }

  /**
   * @param {HTMLElement} node
   * @protected
   */
  _removeInputListeners(node) {
    super._removeInputListeners(node);

    node.removeEventListener('change', this._boundOnChange);
  }

  /** @private */
  _decreaseButtonTouchend(e) {
    // Cancel the following click and focus events
    e.preventDefault();
    this._decreaseValue();
  }

  /** @private */
  _increaseButtonTouchend(e) {
    // Cancel the following click and focus events
    e.preventDefault();
    this._increaseValue();
  }

  /** @protected */
  _createConstraintsObserver() {
    // NOTE: do not call "super" but instead override the method to add extra arguments
    this._createMethodObserver('_constraintsChanged(required, min, max, step)');
  }

  /** @private */
  _constraintsChanged(required, min, max) {
    if (!this.invalid) {
      return;
    }

    const isNumUnset = (n) => !n && n !== 0;

    if (!isNumUnset(min) || !isNumUnset(max)) {
      this.validate();
    } else if (!required) {
      this.invalid = false;
    } else {
      this.validate();
    }
  }

  /** @private */
  _decreaseValue() {
    this._incrementValue(-1);
  }

  /** @private */
  _increaseValue() {
    this._incrementValue(1);
  }

  /** @private */
  _incrementValue(incr) {
    if (this.disabled || this.readonly) {
      return;
    }

    let value = parseFloat(this.value);

    if (!this.value) {
      if ((this.min == 0 && incr < 0) || (this.max == 0 && incr > 0) || (this.max == 0 && this.min == 0)) {
        incr = 0;
        value = 0;
      } else if ((this.max == null || this.max >= 0) && (this.min == null || this.min <= 0)) {
        value = 0;
      } else if (this.min > 0) {
        value = this.min;
        if (this.max < 0 && incr < 0) {
          value = this.max;
        }
        incr = 0;
      } else if (this.max < 0) {
        value = this.max;
        if (incr < 0) {
          incr = 0;
        } else {
          // FIXME(yuriy): find a proper solution to make correct step back
          if (this._getIncrement(1, value - this.step) > this.max) {
            value -= 2 * this.step;
          } else {
            value -= this.step;
          }
        }
      }
    } else if (value < this.min) {
      incr = 0;
      value = this.min;
    } else if (value > this.max) {
      incr = 0;
      value = this.max;
    }

    const newValue = this._getIncrement(incr, value);
    if (!this.value || incr == 0 || this._incrementIsInsideTheLimits(incr, value)) {
      this._setValue(newValue);
    }
  }

  /** @private */
  _setValue(value) {
    this.value = this.inputElement.value = String(parseFloat(value));
    this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  /** @private */
  _getIncrement(incr, currentValue) {
    let step = this.step || 1,
      min = this.min || 0;

    // To avoid problems with decimal math, multiplying to operate with integers.
    const multiplier = Math.max(this._getMultiplier(currentValue), this._getMultiplier(step), this._getMultiplier(min));

    step *= multiplier;
    currentValue = Math.round(currentValue * multiplier);
    min *= multiplier;

    const margin = (currentValue - min) % step;

    if (incr > 0) {
      return (currentValue - margin + step) / multiplier;
    } else if (incr < 0) {
      return (currentValue - (margin || step)) / multiplier;
    } else {
      return currentValue / multiplier;
    }
  }

  /** @private */
  _getDecimalCount(number) {
    const s = String(number);
    const i = s.indexOf('.');
    return i === -1 ? 1 : s.length - i - 1;
  }

  /** @private */
  _getMultiplier(number) {
    if (!isNaN(number)) {
      return Math.pow(10, this._getDecimalCount(number));
    }
  }

  /** @private */
  _incrementIsInsideTheLimits(incr, value) {
    if (incr < 0) {
      return this.min == null || this._getIncrement(incr, value) >= this.min;
    } else if (incr > 0) {
      return this.max == null || this._getIncrement(incr, value) <= this.max;
    } else {
      return this._getIncrement(incr, value) <= this.max && this._getIncrement(incr, value) >= this.min;
    }
  }

  /** @private */
  _allowed(sign) {
    const incr = sign * (this.step || 1);
    const value = parseFloat(this.value);
    return !this.value || (!this.disabled && this._incrementIsInsideTheLimits(incr, value));
  }

  /**
   * @param {number} newVal
   * @param {number | undefined} oldVal
   * @protected
   */
  _stepChanged(newVal) {
    // TODO: refactor to not have initial value
    // https://github.com/vaadin/vaadin-text-field/issues/435

    // Avoid using initial value in validation
    this.__validateByStep = this.__stepChangedCalled || this.getAttribute('step') !== null;

    if (this.inputElement) {
      this.inputElement.step = this.__validateByStep ? newVal : 'any';
    }

    this.__stepChangedCalled = true;
    this.setAttribute('step', newVal);
  }

  /** @private */
  _minChanged(min) {
    if (this.inputElement) {
      this.inputElement.min = min;
    }
  }

  /** @private */
  _maxChanged(max) {
    if (this.inputElement) {
      this.inputElement.max = max;
    }
  }

  /**
   * @param {unknown} newVal
   * @param {unknown} oldVal
   * @protected
   */
  _valueChanged(newVal, oldVal) {
    // Validate value to be numeric
    if (newVal && isNaN(parseFloat(newVal))) {
      this.value = '';
    } else if (typeof this.value !== 'string') {
      this.value = String(this.value);
    }

    super._valueChanged(this.value, oldVal);
  }

  /**
   * @param {!KeyboardEvent} e
   * @protected
   */
  _onKeyDown(e) {
    if (e.keyCode == 38) {
      e.preventDefault();
      this._increaseValue();
    } else if (e.keyCode == 40) {
      e.preventDefault();
      this._decreaseValue();
    }

    super._onKeyDown(e);
  }

  /** @private */
  __onInputChange() {
    this.validate();
  }

  /**
   * @return {boolean}
   */
  checkValidity() {
    // text-field mixin does not check against `min`, `max` and `step`
    if (this.min !== undefined || this.max !== undefined || this.__validateByStep) {
      return this.inputElement.checkValidity();
    }

    return super.checkValidity();
  }
}

customElements.define(VNumberField.is, VNumberField);
