import { PolymerElement, html } from '@polymer/polymer';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import '@vaadin/vaadin-date-picker/src/vaadin-date-picker-overlay.js';
import '@vaadin/vaadin-date-picker/src/vaadin-date-picker-overlay-content.js';
import { DatePickerMixin } from './mixins/date-picker-mixin.js';
import { InputPropsMixin } from './mixins/input-props-mixin.js';
import { FieldAriaMixin } from './mixins/field-aria-mixin.js';
import './styles/text-field-shared.js';
import './v-input-container.js';

export class VDatePicker extends DatePickerMixin(
  GestureEventListeners(FieldAriaMixin(InputPropsMixin(ThemableMixin(PolymerElement))))
) {
  static get is() {
    return 'vaadin-date-picker';
  }

  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles"></style>

      <div class="vaadin-select-container" part="container">
        <div part="label" on-click="focus">
          <slot name="label"></slot>
        </div>

        <vaadin-input-container part="input-field" readonly="[[readonly]]" disabled="[[disabled]]" class="input">
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input" slot="input"></slot>
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

      <vaadin-date-picker-overlay
        id="overlay"
        fullscreen$="[[_fullscreen]]"
        theme$="[[__getOverlayTheme(theme, _overlayInitialized)]]"
        on-vaadin-overlay-open="_onOverlayOpened"
        on-vaadin-overlay-close="_onOverlayClosed"
        disable-upgrade
      >
        <template>
          <!-- TODO: passing label here throws -->
          <vaadin-date-picker-overlay-content
            id="overlay-content"
            i18n="[[i18n]]"
            fullscreen$="[[_fullscreen]]"
            selected-date="{{_selectedDate}}"
            slot="dropdown-content"
            focused-date="{{_focusedDate}}"
            show-week-numbers="[[showWeekNumbers]]"
            min-date="[[_minDate]]"
            max-date="[[_maxDate]]"
            role="dialog"
            on-date-tap="_close"
            part="overlay-content"
            theme$="[[__getOverlayTheme(theme, _overlayInitialized)]]"
          ></vaadin-date-picker-overlay-content>
        </template>
      </vaadin-date-picker-overlay>
      <iron-media-query query="[[_fullscreenMediaQuery]]" query-matches="{{_fullscreen}}"></iron-media-query>
    `;
  }

  /** @protected */
  static get observers() {
    return ['_userInputValueChanged(_userInputValue)'];
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

  /** @protected */
  get _ariaTarget() {
    return this._inputNode;
  }

  /** @protected */
  get _clearOnEsc() {
    return false;
  }

  set _inputValue(value) {
    if (this._inputElement) {
      this._inputElement.value = value;
    }
  }

  get _inputValue() {
    return this._inputElement && this._inputElement.value;
  }

  /** @private */
  get _inputElement() {
    return this._inputNode;
  }

  /** @protected */
  get _nativeInput() {
    return this._inputNode;
  }

  constructor() {
    super();
    this._setType('text');
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();

    if (this._inputNode) {
      // TODO: which roles would be correct?
      this._inputNode.setAttribute('aria-haspopup', 'true');
      this._inputNode.setAttribute('aria-expanded', 'false');

      this._inputNode.setAttribute('autocomplete', 'off');

      // TODO: simplify references to input node
      this._setInputElement(this._inputNode);

      // TODO: do we need this logic now?
      this._inputElement.addEventListener('change', (e) => {
        this._userInputValueChanged();

        // For change event on text-field blur, after the field is cleared,
        // we schedule change event to be dispatched on date-picker blur.
        if (this._inputElement.value === '' && !e.__fromClearButton) {
          this.__dispatchChange = true;
        }
      });
    }
  }

  ready() {
    super.ready();

    this._positionTarget = this.shadowRoot.querySelector('vaadin-input-container');
  }

  /** @private */
  _onVaadinOverlayClose(e) {
    if (this._openedWithFocusRing && this.hasAttribute('focused')) {
      this.focusElement.setAttribute('focus-ring', '');
    } else if (!this.hasAttribute('focused')) {
      this.focusElement.blur();
    }
    if (e.detail.sourceEvent && e.detail.sourceEvent.composedPath().indexOf(this) !== -1) {
      e.preventDefault();
    }
  }

  /** @private */
  _toggle(e) {
    e.stopPropagation();
    this[this._overlayInitialized && this.$.overlay.opened ? 'close' : 'open']();
  }
}

customElements.define(VDatePicker.is, VDatePicker);
