# A11y prototypes

This is a research project for prototyping improvements to Vaadin components accessibility.

[Live demo →](https://a11y-vaadin-proto.netlify.app/)

## Setup

```sh
npm install
```

## Run dev server

```sh
npm start
```

## Components

- vaadin-checkbox
- vaadin-checkbox-group
- vaadin-radio-button
- vaadin-radio-group
- vaadin-number-field
- vaadin-text-field
- vaadin-select
- vaadin-combo-box
- vaadin-time-picker

## Issues

The following issues should be addressed by the new prototypes:

- [General: Elements without a robust accessible name or role](https://github.com/vaadin/web-components/issues/153)
  - vaadin-select
  - vaadin-radio-button (focus delegation)

- [text-field: input elements lack appropriate accessible names](https://github.com/vaadin/web-components/issues/161)

## Limitations

### `vaadin-select`

- [ ] VoiceOver does not announce `option` role on the `vaadin-item` elements:

> You are currently on a text element, inside a listbox.

This appears to be a VoiceOver specific behavior, not something we can fix.
