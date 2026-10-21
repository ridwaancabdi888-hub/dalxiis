import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { observeElements } = require('../reveal-on-scroll.js');

function createElement() {
    const classes = new Set();
    return {
        classList: {
            add(name) {
                classes.add(name);
            },
            contains(name) {
                return classes.has(name);
            },
        },
    };
}

test('reveals every element when IntersectionObserver is unavailable', () => {
    const elements = [createElement(), createElement(), createElement()];

    const observer = observeElements(elements, { ObserverClass: null });

    assert.equal(observer, null);
    assert.ok(elements.every((element) => element.classList.contains('visible')));
});

test('observes every element with the configured observer options', () => {
    const elements = [createElement(), createElement()];
    const observerOptions = { threshold: 0.25 };
    let receivedCallback;
    let receivedOptions;

    class FakeObserver {
        constructor(callback, options) {
            receivedCallback = callback;
            receivedOptions = options;
            this.observed = [];
        }

        observe(element) {
            this.observed.push(element);
        }

        unobserve() {}
    }

    const observer = observeElements(elements, { ObserverClass: FakeObserver, observerOptions });

    assert.deepEqual(observer.observed, elements);
    assert.equal(receivedOptions, observerOptions);
    assert.equal(typeof receivedCallback, 'function');
});

test('reveals and stops observing elements after they enter the viewport', () => {
    const visibleElement = createElement();
    const hiddenElement = createElement();
    let callback;

    class FakeObserver {
        constructor(receivedCallback) {
            callback = receivedCallback;
            this.unobserved = [];
        }

        observe() {}

        unobserve(element) {
            this.unobserved.push(element);
        }
    }

    const observer = observeElements(
        [visibleElement, hiddenElement],
        { ObserverClass: FakeObserver }
    );

    callback([
        { target: visibleElement, isIntersecting: true },
        { target: hiddenElement, isIntersecting: false },
    ]);

    assert.equal(visibleElement.classList.contains('visible'), true);
    assert.equal(hiddenElement.classList.contains('visible'), false);
    assert.deepEqual(observer.unobserved, [visibleElement]);
});
