import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createModalController } = require('../modal-controller.js');

function createEventTarget() {
    const listeners = new Map();
    return {
        activeElement: null,
        addEventListener(type, handler) {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type).add(handler);
        },
        removeEventListener(type, handler) {
            listeners.get(type)?.delete(handler);
        },
        dispatch(type, event = {}) {
            listeners.get(type)?.forEach((handler) => handler(event));
        },
    };
}

function createElement(eventTarget) {
    const target = createEventTarget();
    const attributes = new Map();
    const classes = new Set();
    return {
        ...target,
        style: { overflow: '' },
        focusCount: 0,
        classList: {
            add: (name) => classes.add(name),
            remove: (name) => classes.delete(name),
            contains: (name) => classes.has(name),
        },
        hasAttribute: (name) => attributes.has(name),
        setAttribute: (name, value) => attributes.set(name, value),
        removeAttribute: (name) => attributes.delete(name),
        getAttribute: (name) => attributes.get(name),
        focus() {
            this.focusCount += 1;
            eventTarget.activeElement = this;
        },
    };
}

function createFixture() {
    const documentTarget = createEventTarget();
    const body = createElement(documentTarget);
    const modal = createElement(documentTarget);
    const closeButton = createElement(documentTarget);
    const actionButton = createElement(documentTarget);
    const trigger = createElement(documentTarget);
    const main = createElement(documentTarget);
    const navigation = createElement(documentTarget);
    modal.setAttribute('inert', '');
    modal.querySelectorAll = () => [closeButton, actionButton];

    const controller = createModalController({
        modal,
        closeButton,
        body,
        eventTarget: documentTarget,
        backgroundElements: [navigation, main],
        scheduleFocus: (callback) => callback(),
    });

    return {
        controller,
        documentTarget,
        body,
        modal,
        closeButton,
        actionButton,
        trigger,
        main,
        navigation,
    };
}

test('opening exposes the modal and makes the page background inert', () => {
    const { controller, modal, closeButton, body, trigger, main, navigation } = createFixture();
    controller.open(trigger);

    assert.equal(controller.isOpen(), true);
    assert.equal(modal.getAttribute('aria-hidden'), 'false');
    assert.equal(modal.hasAttribute('inert'), false);
    assert.equal(main.hasAttribute('inert'), true);
    assert.equal(navigation.hasAttribute('inert'), true);
    assert.equal(body.style.overflow, 'hidden');
    assert.equal(closeButton.focusCount, 1);
});

test('Escape closes the modal, restores the background and returns focus', () => {
    const { controller, documentTarget, modal, body, trigger, main } = createFixture();
    controller.open(trigger);
    let prevented = 0;
    documentTarget.dispatch('keydown', { key: 'Escape', preventDefault: () => prevented += 1 });

    assert.equal(controller.isOpen(), false);
    assert.equal(modal.getAttribute('aria-hidden'), 'true');
    assert.equal(modal.hasAttribute('inert'), true);
    assert.equal(main.hasAttribute('inert'), false);
    assert.equal(body.style.overflow, '');
    assert.equal(trigger.focusCount, 1);
    assert.equal(prevented, 1);
});

test('Tab and Shift+Tab stay inside an open modal', () => {
    const { controller, documentTarget, modal, closeButton, actionButton, trigger } = createFixture();
    controller.open(trigger);
    let prevented = 0;

    documentTarget.activeElement = actionButton;
    modal.dispatch('keydown', { key: 'Tab', shiftKey: false, preventDefault: () => prevented += 1 });
    assert.equal(documentTarget.activeElement, closeButton);

    modal.dispatch('keydown', { key: 'Tab', shiftKey: true, preventDefault: () => prevented += 1 });
    assert.equal(documentTarget.activeElement, actionButton);
    assert.equal(prevented, 2);
});

test('the action path can close without returning focus to the card', () => {
    const { controller, trigger, modal, main } = createFixture();
    controller.open(trigger);
    controller.close({ restoreFocus: false });

    assert.equal(trigger.focusCount, 0);
    assert.equal(modal.hasAttribute('inert'), true);
    assert.equal(main.hasAttribute('inert'), false);
});

test('closing preserves pre-existing page state', () => {
    const { controller, body, trigger, navigation } = createFixture();
    body.style.overflow = 'clip';
    navigation.setAttribute('inert', '');

    controller.open(trigger);
    controller.open(trigger);
    controller.close();

    assert.equal(body.style.overflow, 'clip');
    assert.equal(navigation.hasAttribute('inert'), true);
});
