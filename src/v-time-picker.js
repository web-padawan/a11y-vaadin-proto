import { PolymerElement, html } from '@polymer/polymer';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { InputPropsMixin } from './mixins/input-props-mixin.js';
import { HelperTextMixin } from './mixins/helper-text-mixin.js';
import './styles/text-field-shared.js';
import './v-time-picker-dropdown';
import './v-input-container.js';

export class VTimePicker extends HelperTextMixin(InputPropsMixin(ThemableMixin(PolymerElement))) {
  static get is() {
    return 'vaadin-time-picker';
  }

  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles"></style>

      <div class="vaadin-select-container" part="container">
        <div part="label" on-click="focus">
          <slot name="label"></slot>
        </div>

        <vaadin-time-picker-dropdown
          id="dropdown"
          allow-custom-value
          item-label-path="value"
          filtered-items="[[__dropdownItems]]"
          disabled="[[disabled]]"
          readonly="[[readonly]]"
          auto-open-disabled="[[autoOpenDisabled]]"
          dir="ltr"
          theme$="[[theme]]"
        >
          <vaadin-input-container part="input-field" readonly="[[readonly]]" disabled="[[disabled]]" class="input">
            <slot name="prefix" slot="prefix"></slot>
            <slot name="input" slot="input"></slot>
            <div part="toggle-button" slot="suffix"></div>
          </vaadin-input-container>
        </vaadin-time-picker-dropdown>

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
       * Set true to prevent the overlay from opening automatically.
       * @attr {boolean} auto-open-disabled
       */
      autoOpenDisabled: Boolean,

      /**
       * The object used to localize this component.
       * To change the default localization, replace the entire
       * _i18n_ object or just the property you want to modify.
       *
       * The object has the following JSON structure:
       * ```
       *   {
       *     // A function to format given `Object` as
       *     // time string. Object is in the format `{ hours: ..., minutes: ..., seconds: ..., milliseconds: ... }`
       *     formatTime: (time) => {
       *       // returns a string representation of the given
       *       // object in `hh` / 'hh:mm' / 'hh:mm:ss' / 'hh:mm:ss.fff' - formats
       *     },
       *     // A function to parse the given text to an `Object` in the format
       *     // `{ hours: ..., minutes: ..., seconds: ..., milliseconds: ... }`.
       *     // Must properly parse (at least) text
       *     // formatted by `formatTime`.
       *     parseTime: text => {
       *       // Parses a string in object/string that can be formatted by`formatTime`.
       *     }
       *     // Translation of the time selector icon button title.
       *     selector: 'Time selector',
       *     // Translation of the time selector clear button title.
       *     clear: 'Clear'
       *   }
       * ```
       * @type {!TimePickerI18n}
       */
      i18n: {
        type: Object,
        value: () => {
          return {
            formatTime: (time) => {
              if (!time) {
                return;
              }

              const pad = (num = 0, fmt = '00') => (fmt + num).substr((fmt + num).length - fmt.length);
              // Always display hour and minute
              let timeString = `${pad(time.hours)}:${pad(time.minutes)}`;
              // Adding second and millisecond depends on resolution
              time.seconds !== undefined && (timeString += `:${pad(time.seconds)}`);
              time.milliseconds !== undefined && (timeString += `.${pad(time.milliseconds, '000')}`);
              return timeString;
            },
            parseTime: (text) => {
              // Parsing with RegExp to ensure correct format
              const MATCH_HOURS = '(\\d|[0-1]\\d|2[0-3])';
              const MATCH_MINUTES = '(\\d|[0-5]\\d)';
              const MATCH_SECONDS = MATCH_MINUTES;
              const MATCH_MILLISECONDS = '(\\d{1,3})';
              const re = new RegExp(
                `^${MATCH_HOURS}(?::${MATCH_MINUTES}(?::${MATCH_SECONDS}(?:\\.${MATCH_MILLISECONDS})?)?)?$`
              );
              const parts = re.exec(text);
              if (parts) {
                // Allows setting the milliseconds with hundreds and tens precision
                if (parts[4]) {
                  while (parts[4].length < 3) {
                    parts[4] += '0';
                  }
                }
                return { hours: parts[1], minutes: parts[2], seconds: parts[3], milliseconds: parts[4] };
              }
            }
          };
        }
      },

      /**
       * Minimum time allowed.
       *
       * Supported time formats are in ISO 8601:
       * - `hh:mm`
       * - `hh:mm:ss`
       * - `hh:mm:ss.fff`
       * @type {string}
       */
      min: {
        type: String,
        value: '00:00:00.000'
      },

      /**
       * Maximum time allowed.
       *
       * Supported time formats are in ISO 8601:
       * - `hh:mm`
       * - `hh:mm:ss`
       * - `hh:mm:ss.fff`
       * @type {string}
       */
      max: {
        type: String,
        value: '23:59:59.999'
      },

      /**
       * Specifies the number of valid intervals in a day used for
       * configuring the items displayed in the selection box.
       *
       * It also configures the precision of the value string. By default
       * the component formats values as `hh:mm` but setting a step value
       * lower than one minute or one second, format resolution changes to
       * `hh:mm:ss` and `hh:mm:ss.fff` respectively.
       *
       * Unit must be set in seconds, and for correctly configuring intervals
       * in the dropdown, it need to evenly divide a day.
       *
       * Note: it is possible to define step that is dividing an hour in inexact
       * fragments (i.e. 5760 seconds which equals 1 hour 36 minutes), but it is
       * not recommended to use it for better UX experience.
       */
      step: {
        type: Number
      },

      /**
       * The time value for this element.
       *
       * Supported time formats are in ISO 8601:
       * - `hh:mm` (default)
       * - `hh:mm:ss`
       * - `hh:mm:ss.fff`
       * @type {string}
       */
      value: {
        type: String,
        observer: '__valueChanged',
        notify: true,
        value: ''
      },

      /** @private */
      __dropdownItems: {
        type: Array
      }
    };
  }

  /** @private */
  get __dropdownElement() {
    return this.$.dropdown;
  }

  /** @private */
  get __inputElement() {
    return this._inputNode;
  }

  constructor() {
    super();
    this._setType('text');
    this._boundOnKeyDown = this.__onKeyDown.bind(this);
  }

  static get observers() {
    return ['__updateDropdownItems(i18n.*, min, max, step)'];
  }

  /** @protected */
  ready() {
    super.ready();

    // Not using declarative because we receive an event before text-element shadow is ready,
    // thus querySelector in textField.focusElement raises an undefined exception on validate
    this.__dropdownElement.addEventListener('value-changed', (e) => this.__onInputChange(e));

    this.__dropdownElement.addEventListener('opened-changed', (e) => this.__onOpenedChanged(e));

    // Validation listeners
    this.__dropdownElement.addEventListener('change', () => this.validate());

    // TODO: handle change event differently with slotted input
    this.__dropdownElement.addEventListener('change', (e) => {
      // `vaadin-combo-box-light` forwards 'change' event from text-field.
      // So we need to filter out in order to avoid duplicates.
      if (e.composedPath()[0] !== this.__inputElement) {
        this.__dispatchChange();
      }
    });
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();

    if (this._inputNode) {
      this._inputNode.addEventListener('keydown', this._boundOnKeyDown);

      this._inputNode.setAttribute('role', 'combobox');
      this._inputNode.setAttribute('aria-autocomplete', 'list');
      this._inputNode.setAttribute('aria-expanded', 'false');

      this._inputNode.setAttribute('aria-describedby', `${this._helperId} ${this._errorId}`);

      this.$.dropdown.setInput(this._inputNode);
    }
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._inputNode) {
      this._inputNode.removeEventListener('keydown', this._boundOnKeyDown);
    }
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

  /** @private */
  __validDayDivisor(step) {
    // valid if undefined, or exact divides a day, or has millisecond resolution
    return !step || (24 * 3600) % step === 0 || (step < 1 && ((step % 1) * 1000) % 1 === 0);
  }

  /** @private */
  __onKeyDown(e) {
    if (this.readonly || this.disabled || this.__dropdownItems.length) {
      return;
    }

    const stepResolution = (this.__validDayDivisor(this.step) && this.step) || 60;

    if (e.keyCode === 40) {
      this.__onArrowPressWithStep(-stepResolution);
    } else if (e.keyCode === 38) {
      this.__onArrowPressWithStep(stepResolution);
    }
  }

  /** @private */
  __onArrowPressWithStep(step) {
    const objWithStep = this.__addStep(this.__getMsec(this.__memoValue), step, true);
    this.__memoValue = objWithStep;
    this.__inputElement.value = this.i18n.formatTime(this.__validateTime(objWithStep));
    this.__dispatchChange();
  }

  /** @private */
  __dispatchChange() {
    this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  /**
   * Returning milliseconds from Object in the format `{ hours: ..., minutes: ..., seconds: ..., milliseconds: ... }`
   * @private
   */
  __getMsec(obj) {
    let result = ((obj && obj.hours) || 0) * 60 * 60 * 1000;
    result += ((obj && obj.minutes) || 0) * 60 * 1000;
    result += ((obj && obj.seconds) || 0) * 1000;
    result += (obj && parseInt(obj.milliseconds)) || 0;

    return result;
  }

  /**
   * Returning seconds from Object in the format `{ hours: ..., minutes: ..., seconds: ..., milliseconds: ... }`
   * @private
   */
  __getSec(obj) {
    let result = ((obj && obj.hours) || 0) * 60 * 60;
    result += ((obj && obj.minutes) || 0) * 60;
    result += (obj && obj.seconds) || 0;
    result += (obj && obj.milliseconds / 1000) || 0;

    return result;
  }

  /**
   * Returning Object in the format `{ hours: ..., minutes: ..., seconds: ..., milliseconds: ... }`
   * from the result of adding step value in milliseconds to the milliseconds amount.
   * With `precision` parameter rounding the value to the closest step valid interval.
   * @private
   */
  __addStep(msec, step, precision) {
    // If the time is `00:00` and step changes value downwards, it should be considered as `24:00`
    if (msec === 0 && step < 0) {
      msec = 24 * 60 * 60 * 1000;
    }

    const stepMsec = step * 1000;
    const diffToNext = msec % stepMsec;
    if (stepMsec < 0 && diffToNext && precision) {
      msec -= diffToNext;
    } else if (stepMsec > 0 && diffToNext && precision) {
      msec -= diffToNext - stepMsec;
    } else {
      msec += stepMsec;
    }

    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    return { hours: hh < 24 ? hh : 0, minutes: mm, seconds: ss, milliseconds: msec };
  }

  /** @private */
  __updateDropdownItems(i8n, min, max, step) {
    const minTimeObj = this.__validateTime(this.__parseISO(min));
    const minSec = this.__getSec(minTimeObj);

    const maxTimeObj = this.__validateTime(this.__parseISO(max));
    const maxSec = this.__getSec(maxTimeObj);

    this.__adjustValue(minSec, maxSec, minTimeObj, maxTimeObj);

    this.__dropdownItems = this.__generateDropdownList(minSec, maxSec, step);

    if (step !== this.__oldStep) {
      this.__oldStep = step;
      const parsedObj = this.__validateTime(this.__parseISO(this.value));
      this.__updateValue(parsedObj);
    }

    if (this.value) {
      this.__dropdownElement.value = this.i18n.formatTime(this.i18n.parseTime(this.value));
    }
  }

  /** @private */
  __generateDropdownList(minSec, maxSec, step) {
    if (step < 15 * 60 || !this.__validDayDivisor(step)) {
      return [];
    }

    const generatedList = [];

    // Default step in overlay items is 1 hour
    step = step || 3600;

    let time = -step + minSec;
    while (time + step >= minSec && time + step <= maxSec) {
      const timeObj = this.__validateTime(this.__addStep(time * 1000, step));
      time += step;
      const formatted = this.i18n.formatTime(timeObj);
      generatedList.push({ label: formatted, value: formatted });
    }

    return generatedList;
  }

  /** @private */
  __adjustValue(minSec, maxSec, minTimeObj, maxTimeObj) {
    // Do not change the value if it is empty
    if (!this.__memoValue) {
      return;
    }

    const valSec = this.__getSec(this.__memoValue);

    if (valSec < minSec) {
      this.__updateValue(minTimeObj);
    } else if (valSec > maxSec) {
      this.__updateValue(maxTimeObj);
    }
  }

  /** @private */
  __valueChanged(value, oldValue) {
    const parsedObj = (this.__memoValue = this.__parseISO(value));
    const newValue = this.__formatISO(parsedObj) || '';

    if (this.value !== '' && this.value !== null && !parsedObj) {
      this.value = oldValue;
    } else if (this.value !== newValue) {
      this.value = newValue;
    } else {
      this.__updateInputValue(parsedObj);
    }
  }

  /** @private */
  __onInputChange() {
    const parsedObj = this.i18n.parseTime(this.__dropdownElement.value);
    const newValue = this.i18n.formatTime(parsedObj) || '';

    if (parsedObj) {
      if (this.__dropdownElement.value !== newValue) {
        this.__dropdownElement.value = newValue;
      } else {
        this.__updateValue(parsedObj);
      }
    } else {
      this.value = '';
    }
  }

  /** @private */
  __updateValue(obj) {
    const timeString = this.__formatISO(this.__validateTime(obj)) || '';
    this.value = timeString;
  }

  /** @private */
  __updateInputValue(obj) {
    const timeString = this.i18n.formatTime(this.__validateTime(obj)) || '';
    this.__dropdownElement.value = timeString;
  }

  /** @private */
  __validateTime(timeObject) {
    if (timeObject) {
      timeObject.hours = parseInt(timeObject.hours);
      timeObject.minutes = parseInt(timeObject.minutes || 0);
      timeObject.seconds = this.__stepSegment < 3 ? undefined : parseInt(timeObject.seconds || 0);
      timeObject.milliseconds = this.__stepSegment < 4 ? undefined : parseInt(timeObject.milliseconds || 0);
    }
    return timeObject;
  }

  /** @private */
  get __stepSegment() {
    if (this.step % 3600 === 0) {
      // Accept hours
      return 1;
    } else if (this.step % 60 === 0 || !this.step) {
      // Accept minutes
      return 2;
    } else if (this.step % 1 === 0) {
      // Accept seconds
      return 3;
    } else if (this.step < 1) {
      // Accept milliseconds
      return 4;
    }
    return undefined;
  }

  /** @private */
  __formatISO(time) {
    // The default i18n formatter implementation is ISO 8601 compliant
    return VTimePicker.properties.i18n.value().formatTime(time);
  }

  /** @private */
  __parseISO(text) {
    // The default i18n parser implementation is ISO 8601 compliant
    return VTimePicker.properties.i18n.value().parseTime(text);
  }

  /** @private */
  __onOpenedChanged(opened, wasOpened) {
    if (this._inputNode) {
      if (opened) {
        this._inputNode.setAttribute('aria-expanded', 'true');
      } else if (wasOpened) {
        this._inputNode.setAttribute('aria-expanded', 'false');
      }
    }
  }
}

customElements.define(VTimePicker.is, VTimePicker);
