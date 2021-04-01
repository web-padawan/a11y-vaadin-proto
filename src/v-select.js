import { PolymerElement, html } from '@polymer/polymer';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { DelegateFocusMixin } from './mixins/delegate-focus-mixin.js';
import { LabelMixin } from './mixins/label-mixin.js';
import { HelperTextMixin } from './mixins/helper-text-mixin.js';
import { SlotMixin } from './mixins/slot-mixin.js';
import { ValidateMixin } from './mixins/validate-mixin.js';
import './styles/text-field-shared.js';
import './v-select-overlay.js';
import './v-input-container.js';

export class VSelect extends DelegateFocusMixin(
  ValidateMixin(HelperTextMixin(LabelMixin(SlotMixin(ThemableMixin(PolymerElement)))))
) {
  static get is() {
    return 'vaadin-select';
  }

  static get template() {
    return html`
      <style include="vaadin-text-field-shared-styles"></style>

      <div class="vaadin-select-container" part="container">
        <div part="label" on-click="focus">
          <slot name="label"></slot>
        </div>

        <vaadin-input-container part="input-field" readonly="[[readonly]]" disabled="[[disabled]]" on-click="_onClick">
          <slot name="prefix" slot="prefix"></slot>
          <slot name="input" slot="input"></slot>
          <div part="toggle-button" slot="suffix"></div>
        </vaadin-input-container>

        <div part="helper-text" on-click="focus">
          <slot name="helper"></slot>
        </div>

        <div part="error-message">
          <slot name="error-message"></slot>
        </div>
      </div>

      <vaadin-select-overlay
        opened="{{opened}}"
        with-backdrop="[[_phone]]"
        phone$="[[_phone]]"
        theme$="[[theme]]"
      ></vaadin-select-overlay>

      <iron-media-query query="[[_phoneMediaQuery]]" query-matches="{{_phone}}"></iron-media-query>

      <div style="display: none">
        <slot></slot>
      </div>
    `;
  }

  static get properties() {
    return {
      /**
       * Set when the select is open
       * @type {boolean}
       */
      opened: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
        observer: '_openedChanged'
      },

      /**
       * It stores the the `value` property of the selected item, providing the
       * value for iron-form.
       * When there’s an item selected, it's the value of that item, otherwise
       * it's an empty string.
       * On change or initialization, the component finds the item which matches the
       * value and displays it.
       * If no value is provided to the component, it selects the first item without
       * value or empty value.
       * Hint: If you do not want to select any item by default, you can either set all
       * the values of inner vaadin-items, or set the vaadin-select value to
       * an inexistent value in the items list.
       * @type {string}
       */
      value: {
        type: String,
        value: '',
        notify: true,
        observer: '_valueChanged'
      },

      /**
       * Custom function for rendering the content of the `<vaadin-select>`.
       * Receives two arguments:
       *
       * - `root` The `<vaadin-select-overlay>` internal container
       *   DOM element. Append your content to it.
       * - `select` The reference to the `<vaadin-select>` element.
       * @type {!SelectRenderer | undefined}
       */
      renderer: Function,

      /**
       * A hint to the user of what can be entered in the control.
       */
      placeholder: {
        type: String
      },

      /**
       * This attribute indicates that the user cannot modify the value of the control.
       */
      readonly: {
        type: Boolean,
        reflectToAttribute: true
      },

      /** @private */
      _phone: Boolean,

      /** @private */
      _phoneMediaQuery: {
        value: '(max-width: 420px), (max-height: 420px)'
      },

      /** @private */
      _overlayElement: Object,

      /** @private */
      _inputElement: Object,

      /** @private */
      _toggleElement: Object,

      /** @private */
      _items: Object,

      /** @private */
      _contentTemplate: Object,

      /** @private */
      _oldTemplate: Object,

      /** @private */
      _oldRenderer: Object
    };
  }

  static get observers() {
    return [
      '_updateAriaRequired(required)',
      '_updateSelectedItem(value, _items)',
      '_templateOrRendererChanged(_contentTemplate, renderer, _overlayElement)'
    ];
  }

  get slots() {
    return {
      ...super.slots,
      input: () => {
        const native = document.createElement('button');
        native.setAttribute('aria-haspopup', 'listbox');
        return native;
      }
    };
  }

  /** @protected */
  get focusElement() {
    return this._buttonNode;
  }

  /** @protected */
  get _buttonNode() {
    return this._getDirectSlotChild('input');
  }

  /** @protected */
  get _valueElement() {
    return this._buttonNode;
  }

  constructor() {
    super();

    // Ensure every instance has unique ID
    const uniqueId = (VSelect._uniqueId = 1 + VSelect._uniqueId || 0);
    this._fieldId = `${this.localName}-${uniqueId}`;

    this._boundSetPosition = this._setPosition.bind(this);
    this._boundOnKeyDown = this._onKeyDown.bind(this);
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-resize', this._boundSetPosition);

    if (this._buttonNode) {
      this._buttonNode.setAttribute('aria-labelledby', `${this._labelId} ${this._fieldId}`);
      this._buttonNode.setAttribute('aria-describedby', `${this._helperId} ${this._errorId}`);

      this._updateAriaRequired(this.required);

      this._updateAriaExpanded(this._buttonNode);
      this._buttonNode.addEventListener('keydown', this._boundOnKeyDown);
    }
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('iron-resize', this._boundSetPosition);
    if (this._buttonNode) {
      this._buttonNode.removeEventListener('keydown', this._boundOnKeyDown);
    }
    // Making sure the select is closed and removed from DOM after detaching the select.
    this.opened = false;
  }

  /** @protected */
  ready() {
    super.ready();

    this._overlayElement = this.shadowRoot.querySelector('vaadin-select-overlay');

    this._toggleElement = this.shadowRoot.querySelector('[part~="input-field"]');

    this._observer = new FlattenedNodesObserver(this, (info) => this._setTemplateFromNodes(info.addedNodes));
    this._observer.flush();
  }

  /** @private */
  _setTemplateFromNodes(nodes) {
    const template =
      Array.from(nodes).filter((node) => node.localName && node.localName === 'template')[0] || this._contentTemplate;
    this._overlayElement.template = this._contentTemplate = template;
    this._setForwardHostProps();
  }

  /** @private */
  _setForwardHostProps() {
    if (this._overlayElement.content) {
      const origForwardHostProp = this._overlayElement._instance && this._overlayElement._instance.forwardHostProp;

      if (this._overlayElement._instance) {
        this._overlayElement._instance.forwardHostProp = (...args) => {
          origForwardHostProp.apply(this._overlayElement._instance, args);
          setTimeout(() => {
            this._updateValueSlot();
          });
        };

        this._assignMenuElement();
      }
    }
  }

  /**
   * Manually invoke existing renderer.
   */
  render() {
    this._overlayElement.render();
    if (this._menuElement && this._menuElement.items) {
      this._updateSelectedItem(this.value, this._menuElement.items);
    }
  }

  /** @private */
  _removeNewRendererOrTemplate(template, oldTemplate, renderer, oldRenderer) {
    if (template !== oldTemplate) {
      this._contentTemplate = undefined;
    } else if (renderer !== oldRenderer) {
      this.renderer = undefined;
    }
  }

  /** @private */
  _templateOrRendererChanged(template, renderer, overlay) {
    if (!overlay) {
      return;
    }

    if (template && renderer) {
      this._removeNewRendererOrTemplate(template, this._oldTemplate, renderer, this._oldRenderer);
      throw new Error('You should only use either a renderer or a template for select content');
    }

    this._oldTemplate = template;
    this._oldRenderer = renderer;

    if (renderer) {
      overlay.setProperties({ owner: this, renderer: renderer });
      this.render();

      if (overlay.content.firstChild) {
        this._assignMenuElement();
      }
    }
  }

  /** @private */
  _assignMenuElement() {
    this._menuElement = Array.from(this._overlayElement.content.children).filter(
      (element) => element.localName !== 'style'
    )[0];

    if (this._menuElement) {
      this._menuElement.addEventListener('items-changed', () => {
        this._items = this._menuElement.items;
        this._items.forEach((item) => item.setAttribute('role', 'option'));
      });
      this._menuElement.addEventListener('selected-changed', () => this._updateValueSlot());
      this._menuElement.addEventListener('keydown', (e) => this._onKeyDownInside(e));
      this._menuElement.addEventListener(
        'click',
        () => {
          this.__userInteraction = true;
          // this.opened = false;
        },
        true
      );

      this._menuElement.setAttribute('role', 'listbox');
    }
  }

  /** @private */
  _valueChanged(value, oldValue) {
    if (value === '') {
      this.removeAttribute('has-value');
    } else {
      this.setAttribute('has-value', '');
    }

    // Skip validation for the initial empty string value
    if (value === '' && oldValue === undefined) {
      return;
    }

    this.validate();
  }

  /** @private */
  _onClick() {
    this.opened = !this.readonly;
  }

  /**
   * @param {!KeyboardEvent} e
   * @protected
   */
  _onKeyDown(e) {
    if (!this.readonly && !this.opened) {
      if (/^(Enter|SpaceBar|\s|ArrowDown|Down|ArrowUp|Up)$/.test(e.key)) {
        e.preventDefault();
        this.opened = true;
      } else if (/[a-zA-Z0-9]/.test(e.key) && e.key.length === 1) {
        const selected = this._menuElement.selected;
        const currentIdx = selected !== undefined ? selected : -1;
        const newIdx = this._menuElement._searchKey(currentIdx, e.key);
        if (newIdx >= 0) {
          this.__userInteraction = true;
          this._updateSelectedItem(this._items[newIdx].value, this._items);
        }
      }
    }
  }

  /**
   * @param {!KeyboardEvent} e
   * @protected
   */
  _onKeyDownInside(e) {
    if (/^(Tab)$/.test(e.key)) {
      this.opened = false;
    }
  }

  /** @private */
  _openedChanged(opened, wasOpened) {
    if (opened) {
      if (!this._overlayElement || !this._menuElement || !this.focusElement || this.disabled || this.readonly) {
        this.opened = false;
        return;
      }

      this._openedWithFocusRing = this.hasAttribute('focus-ring');
      this._menuElement.focus();
      this._setPosition();
      window.addEventListener('scroll', this._boundSetPosition, true);
    } else if (wasOpened) {
      if (this._phone) {
        this._setFocused(false);
      } else {
        this.focusElement.focus();
        if (this._openedWithFocusRing) {
          this.setAttribute('focus-ring', '');
        }
      }
      this.validate();
      window.removeEventListener('scroll', this._boundSetPosition, true);
    }

    this._updateAriaExpanded(this._buttonNode);
  }

  /** @private */
  _updateAriaExpanded(button) {
    if (button) {
      if (this.opened) {
        button.setAttribute('aria-expanded', 'true');
      } else {
        button.removeAttribute('aria-expanded');
      }
    }
  }

  /** @private */
  _updateAriaRequired(required) {
    if (this._buttonNode) {
      this._buttonNode.setAttribute('aria-required', Boolean(required));
    }
  }

  /** @private */
  _attachSelectedItem(selected) {
    if (!selected) {
      return;
    }
    let labelItem;
    if (selected.hasAttribute('label')) {
      labelItem = document.createElement('vaadin-item');
      labelItem.textContent = selected.getAttribute('label');
    } else {
      labelItem = selected.cloneNode(true);
    }

    // store reference to the original item
    labelItem._sourceItem = selected;

    labelItem.removeAttribute('tabindex');
    labelItem.removeAttribute('role');
    labelItem.setAttribute('id', this._fieldId);

    // TODO: override elsewhere?
    labelItem.style.padding = '0';

    this._valueElement.appendChild(labelItem);

    labelItem.selected = true;
  }

  /** @private */
  _updateValueSlot() {
    // TODO: set placeholder if no item is selected
    this._valueElement.innerHTML = '';

    const selected = this._items[this._menuElement.selected];

    this._attachSelectedItem(selected);

    if (!this._valueChanging && selected) {
      this._selectedChanging = true;
      this.value = selected.value || '';
      if (this.__userInteraction) {
        this.opened = false;
        this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
        this.__userInteraction = false;
      }
      delete this._selectedChanging;
    }
  }

  /** @private */
  _updateSelectedItem(value, items) {
    if (items) {
      this._menuElement.selected = items.reduce((prev, item, idx) => {
        return prev === undefined && item.value === value ? idx : prev;
      }, undefined);
      if (!this._selectedChanging) {
        this._valueChanging = true;
        this._updateValueSlot();
        delete this._valueChanging;
      }
    }
  }

  /** @protected */
  _shouldRemoveFocus() {
    return !this.opened;
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
  _setPosition() {
    const inputRect = this._toggleElement.getBoundingClientRect();
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const bottomAlign = inputRect.top > (viewportHeight - inputRect.height) / 2;

    const isRtl = this.getAttribute('dir') === 'rtl';
    if (isRtl) {
      this._overlayElement.style.right = document.documentElement.clientWidth - inputRect.right + 'px';
    } else {
      this._overlayElement.style.left = inputRect.left + 'px';
    }

    if (bottomAlign) {
      this._overlayElement.setAttribute('bottom-aligned', '');
      this._overlayElement.style.removeProperty('top');
      this._overlayElement.style.bottom = viewportHeight - inputRect.bottom + 'px';
    } else {
      this._overlayElement.removeAttribute('bottom-aligned');
      this._overlayElement.style.removeProperty('bottom');
      this._overlayElement.style.top = inputRect.top + 'px';
    }

    this._overlayElement.updateStyles({ '--vaadin-select-text-field-width': inputRect.width + 'px' });
  }
}

customElements.define(VSelect.is, VSelect);
