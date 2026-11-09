import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createTripPreview, formatTripPreview } = require('../trip-preview.js');

function createTarget() {
    const listeners = new Map();
    return {
        listeners,
        addEventListener(type, handler) { listeners.set(type, handler); },
        removeEventListener(type) { listeners.delete(type); },
        dispatch(type, event = {}) { listeners.get(type)?.(event); },
    };
}

function createFixture({ valid = true } = {}) {
    const nameField = { focusCount: 0, focus() { this.focusCount += 1; } };
    const form = {
        ...createTarget(),
        resetCount: 0,
        reportValidity: () => valid,
        reset() { this.resetCount += 1; },
        elements: { namedItem: (name) => (name === 'name' ? nameField : null) },
    };
    const preview = { hidden: true, focusCount: 0, focus() { this.focusCount += 1; } };
    const previewText = { textContent: '' };
    const statusText = { textContent: '' };
    const clearButton = createTarget();
    const controller = createTripPreview({
        form,
        preview,
        previewText,
        statusText,
        clearButton,
        getValues: () => ({
            name: ' Amina Ali ',
            email: 'amina@example.com',
            destination: 'Berbera',
            message: 'Beach and history',
        }),
    });
    return { clearButton, controller, form, nameField, preview, previewText, statusText };
}

test('formats supplied fields in a readable order and omits blanks', () => {
    assert.equal(
        formatTripPreview({ name: ' Amina ', email: '', destination: 'Berbera' }),
        'Full name: Amina\nDestination: Berbera',
    );
});

test('keeps user-entered markup as plain preview text', () => {
    assert.equal(
        formatTripPreview({ name: '<img src=x onerror=alert(1)>', message: 'A & B' }),
        'Full name: <img src=x onerror=alert(1)>\nTrip interests: A & B',
    );
});

test('submission creates a local preview without resetting the form', () => {
    const { form, preview, previewText, statusText } = createFixture();
    let prevented = 0;

    form.dispatch('submit', { preventDefault: () => prevented += 1 });

    assert.equal(prevented, 1);
    assert.equal(form.resetCount, 0);
    assert.equal(preview.hidden, false);
    assert.equal(preview.focusCount, 1);
    assert.match(previewText.textContent, /Destination: Berbera/);
    assert.match(statusText.textContent, /Nothing was sent or stored/);
});

test('invalid forms do not reveal a preview', () => {
    const { form, preview } = createFixture({ valid: false });
    form.dispatch('submit', { preventDefault() {} });

    assert.equal(preview.hidden, true);
    assert.equal(preview.focusCount, 0);
});

test('Start Over clears the preview, resets fields and restores focus', () => {
    const { clearButton, form, nameField, preview, previewText, statusText } = createFixture();
    form.dispatch('submit', { preventDefault() {} });

    clearButton.dispatch('click');

    assert.equal(form.resetCount, 1);
    assert.equal(preview.hidden, true);
    assert.equal(previewText.textContent, '');
    assert.equal(nameField.focusCount, 1);
    assert.match(statusText.textContent, /Preview cleared/);
});

test('cleanup removes form and button listeners', () => {
    const { clearButton, controller, form } = createFixture();
    controller.destroy();

    assert.equal(form.listeners.size, 0);
    assert.equal(clearButton.listeners.size, 0);
});
