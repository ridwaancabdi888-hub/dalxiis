(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.DalxiisModal = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    function createModalController(options) {
        const {
            modal,
            closeButton,
            body,
            eventTarget,
            backgroundElements = [],
            scheduleFocus = (callback) => callback(),
        } = options;

        if (!modal || !closeButton || !body || !eventTarget) return null;

        let trigger = null;
        let previousOverflow = '';
        const backgroundState = new Map();
        const isOpen = () => modal.classList.contains('active');

        function setBackgroundInert(inert) {
            backgroundElements.forEach((element) => {
                if (!element) return;
                if (inert) {
                    backgroundState.set(element, element.hasAttribute('inert'));
                    element.setAttribute('inert', '');
                } else if (!backgroundState.get(element)) {
                    element.removeAttribute('inert');
                }
            });
            if (!inert) backgroundState.clear();
        }

        function open(nextTrigger) {
            const wasOpen = isOpen();
            if (!wasOpen) previousOverflow = body.style.overflow;
            trigger = nextTrigger || trigger;
            modal.removeAttribute('inert');
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            body.style.overflow = 'hidden';
            if (!wasOpen) setBackgroundInert(true);
            scheduleFocus(() => closeButton.focus());
        }

        function close({ restoreFocus = true } = {}) {
            if (!isOpen()) return;
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('inert', '');
            body.style.overflow = previousOverflow;
            setBackgroundInert(false);

            if (restoreFocus) trigger?.focus();
        }

        function onDocumentKeyDown(event) {
            if (event.key !== 'Escape' || !isOpen()) return;
            event.preventDefault();
            close();
        }

        function onModalKeyDown(event) {
            if (event.key !== 'Tab' || !isOpen()) return;
            const focusableElements = [...modal.querySelectorAll(focusableSelector)];
            if (!focusableElements.length) {
                event.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey && eventTarget.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && eventTarget.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        function onBackdropClick(event) {
            if (event.target === modal) close();
        }

        function onCloseClick() {
            close();
        }

        closeButton.addEventListener('click', onCloseClick);
        modal.addEventListener('click', onBackdropClick);
        modal.addEventListener('keydown', onModalKeyDown);
        eventTarget.addEventListener('keydown', onDocumentKeyDown);

        return {
            open,
            close,
            isOpen,
            destroy() {
                close({ restoreFocus: false });
                closeButton.removeEventListener('click', onCloseClick);
                modal.removeEventListener('click', onBackdropClick);
                modal.removeEventListener('keydown', onModalKeyDown);
                eventTarget.removeEventListener('keydown', onDocumentKeyDown);
            },
        };
    }

    return { createModalController };
}));
