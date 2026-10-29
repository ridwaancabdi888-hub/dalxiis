import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createMobileNavigation } = require('../mobile-navigation.js');

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
    const classes = new Set();
    const attributes = new Map();
    return {
        ...target,
        focusCount: 0,
        classList: {
            add: (name) => classes.add(name),
            remove: (name) => classes.delete(name),
            contains: (name) => classes.has(name),
        },
        setAttribute: (name, value) => attributes.set(name, value),
        getAttribute: (name) => attributes.get(name),
        focus() {
            this.focusCount += 1;
            eventTarget.activeElement = this;
        },
    };
}

function createFixture() {
    const documentTarget = createEventTarget();
    const button = createElement(documentTarget);
    const firstLink = createElement(documentTarget);
    const lastLink = createElement(documentTarget);
    const menu = createElement(documentTarget);
    menu.querySelectorAll = () => [firstLink, lastLink];
    const desktopQuery = createEventTarget();
    desktopQuery.matches = false;

    const navigation = createMobileNavigation({
        button,
        menu,
        eventTarget: documentTarget,
        desktopQuery,
        scheduleFocus: (callback) => callback(),
    });

    return { button, menu, firstLink, lastLink, desktopQuery, documentTarget, navigation };
}

test('opens the mobile menu and exposes its state', () => {
    const { button, menu, firstLink, navigation } = createFixture();
    navigation.open();

    assert.equal(navigation.isOpen(), true);
    assert.equal(menu.classList.contains('active'), true);
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.equal(button.getAttribute('aria-label'), 'Close navigation menu');
    assert.equal(firstLink.focusCount, 1);
});

test('closes after navigation without focusing the hidden menu button', () => {
    const { button, firstLink, navigation } = createFixture();
    navigation.open();
    firstLink.dispatch('click');

    assert.equal(navigation.isOpen(), false);
    assert.equal(button.focusCount, 0);
    assert.equal(button.getAttribute('aria-expanded'), 'false');
});

test('closes on the desktop breakpoint without moving focus', () => {
    const { button, desktopQuery, navigation } = createFixture();
    navigation.open();
    desktopQuery.matches = true;
    desktopQuery.dispatch('change', { matches: true });

    assert.equal(navigation.isOpen(), false);
    assert.equal(button.focusCount, 0);
});

test('Escape restores focus and Tab stays inside an open menu', () => {
    const { button, menu, firstLink, lastLink, documentTarget, navigation } = createFixture();
    navigation.open();

    documentTarget.activeElement = lastLink;
    let prevented = 0;
    menu.dispatch('keydown', { key: 'Tab', shiftKey: false, preventDefault: () => prevented += 1 });
    assert.equal(documentTarget.activeElement, firstLink);
    assert.equal(prevented, 1);

    documentTarget.dispatch('keydown', { key: 'Escape', preventDefault: () => prevented += 1 });
    assert.equal(navigation.isOpen(), false);
    assert.equal(documentTarget.activeElement, button);
    assert.equal(prevented, 2);
});
