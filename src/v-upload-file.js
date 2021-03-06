import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import '@vaadin/vaadin-progress-bar/src/vaadin-progress-bar.js';

class VUploadFile extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        [hidden] {
          display: none !important;
        }
        li[part='row'] {
          list-style-type: none;
          align-items: center;
        }
        button {
          background: transparent;
          border: none;
          box-shadow: none;
          position: relative;
        }
        button::before {
          position: absolute;
          left: 0;
          top: 0;
          vertical-align: top;
        }
      </style>
      <li part="row" tabindex="0">
        <div part="info">
          <div part="done-icon" hidden$="[[!file.complete]]"></div>
          <div part="warning-icon" hidden$="[[!file.error]]"></div>
          <div part="meta">
            <div part="name" id="name">[[file.name]]</div>
            <div part="status" hidden$="[[!file.status]]" id="status">[[file.status]]</div>
            <div part="error" id="error" hidden$="[[!file.error]]">[[file.error]]</div>
          </div>
        </div>
        <div part="commands">
          <button
            type="button"
            part="start-button"
            file-event="file-start"
            on-click="_fireFileEvent"
            hidden$="[[!file.held]]"
            aria-label="Start"
          ></button>
          <button
            type="button"
            part="retry-button"
            file-event="file-retry"
            on-click="_fireFileEvent"
            hidden$="[[!file.error]]"
            aria-label="Retry"
          ></button>
          <button
            type="button"
            part="clear-button"
            file-event="file-abort"
            on-click="_fireFileEvent"
            aria-label="Clear"
          ></button>
        </div>
      </li>
      <vaadin-progress-bar
        part="progress"
        id="progress"
        value$="[[_formatProgressValue(file.progress)]]"
        error$="[[file.error]]"
        indeterminate$="[[file.indeterminate]]"
        uploading$="[[file.uploading]]"
        complete$="[[file.complete]]"
      ></vaadin-progress-bar>
    `;
  }

  static get is() {
    return 'vaadin-upload-file';
  }

  static get properties() {
    return {
      file: Object
    };
  }

  static get observers() {
    return [
      '_fileAborted(file.abort)',
      '_toggleHostAttribute(file.error, "error")',
      '_toggleHostAttribute(file.indeterminate, "indeterminate")',
      '_toggleHostAttribute(file.uploading, "uploading")',
      '_toggleHostAttribute(file.complete, "complete")'
    ];
  }

  /** @private */
  _fileAborted(abort) {
    if (abort) {
      this._remove();
    }
  }

  /** @private */
  _remove() {
    this.dispatchEvent(
      new CustomEvent('file-remove', {
        detail: { file: this.file },
        bubbles: true,
        composed: true
      })
    );
  }

  /** @private */
  _formatProgressValue(progress) {
    return progress / 100;
  }

  /** @private */
  _fireFileEvent(e) {
    e.preventDefault();
    return this.dispatchEvent(
      new CustomEvent(e.target.getAttribute('file-event'), {
        detail: { file: this.file },
        bubbles: true,
        composed: true
      })
    );
  }

  /** @private */
  _toggleHostAttribute(value, attributeName) {
    const shouldHave = Boolean(value);
    const has = this.hasAttribute(attributeName);
    if (has !== shouldHave) {
      if (shouldHave) {
        this.setAttribute(attributeName, '');
      } else {
        this.removeAttribute(attributeName);
      }
    }
  }

  focus() {
    this.shadowRoot.querySelector('li').focus();
  }
}

customElements.define(VUploadFile.is, VUploadFile);

export { VUploadFile };
