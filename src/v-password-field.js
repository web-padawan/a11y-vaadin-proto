import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import './styles/text-field-shared.js';
import { VTextField } from './v-text-field.js';

const ownTemplate = html`
  <div part="reveal-button" slot="suffix">
    <slot name="reveal"></slot>
  </div>
`;

let memoizedTemplate;

export class VPasswordField extends VTextField {
  static get is() {
    return 'vaadin-password-field';
  }

  static get template() {
    if (!memoizedTemplate) {
      // Clone the superclass template
      memoizedTemplate = super.template.cloneNode(true);

      // Retrieve this element's dom-module template
      const revealButton = ownTemplate.content.querySelector('[part="reveal-button"]');

      // Append reveal-button and styles to the text-field template
      const inputField = memoizedTemplate.content.querySelector('[part="input-field"]');
      inputField.appendChild(revealButton);
    }

    return memoizedTemplate;
  }

  static get properties() {
    return {
      /**
       * Set to true to hide the eye icon which toggles the password visibility.
       * @attr {boolean} reveal-button-hidden
       * @type {boolean}
       */
      revealButtonHidden: {
        type: Boolean,
        observer: '_revealButtonHiddenChanged',
        value: false
      },

      /**
       * True if the password is visible ([type=text]).
       * @attr {boolean} password-visible
       * @type {boolean}
       */
      passwordVisible: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        observer: '_passwordVisibleChanged',
        readOnly: true
      }
    };
  }

  get slots() {
    return {
      ...super.slots,
      reveal: () => {
        const btn = document.createElement('button');
        btn.setAttribute('aria-label', 'Reveal');
        btn.setAttribute('tabindex', '0');
        return btn;
      }
    };
  }

  get _revealNode() {
    return this._getDirectSlotChild('reveal');
  }

  constructor() {
    super();
    this._setType('password');
    this._boundTogglePasswordVisibility = this._togglePasswordVisibility.bind(this);
  }

  /** @protected */
  ready() {
    super.ready();

    this._revealPart = this.shadowRoot.querySelector('[part="reveal-button"]');
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();

    if (this._revealNode) {
      this._revealNode.addEventListener('click', this._boundTogglePasswordVisibility);
    }

    this._toggleRevealHidden(this.revealButtonHidden);
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._revealNode) {
      this._revealNode.removeEventListener('click', this._boundTogglePasswordVisibility);
    }
  }

  /**
   * @param {Event} e
   * @return {boolean}
   * @protected
   */
  _shouldRemoveFocus(e) {
    return e.relatedTarget !== this._revealNode;
  }

  /** @private */
  _revealButtonHiddenChanged(hidden) {
    this._toggleRevealHidden(hidden);
  }

  /** @private */
  _togglePasswordVisibility() {
    this._passwordVisibilityChanging = true;
    this._inputNode.blur();
    this._setPasswordVisible(!this.passwordVisible);
    this._inputNode.focus();
    this._passwordVisibilityChanging = false;
  }

  /** @private */
  _toggleRevealHidden(hidden) {
    if (this._revealNode) {
      if (hidden) {
        this._revealPart.setAttribute('hidden', '');
        this._revealNode.setAttribute('tabindex', '-1');
        this._revealNode.setAttribute('aria-hidden', 'true');
      } else {
        this._revealPart.removeAttribute('hidden');
        this._revealNode.setAttribute('tabindex', '0');
        this._revealNode.removeAttribute('aria-hidden');
      }
    }
  }

  /** @private */
  _passwordVisibleChanged(passwordVisible) {
    this._setType(passwordVisible ? 'text' : 'password');
  }
}

customElements.define(VPasswordField.is, VPasswordField);
