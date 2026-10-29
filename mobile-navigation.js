(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.DalxiisNavigation = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function createMobileNavigation(options) {
        const {
            button,
            menu,
            eventTarget,
            desktopQuery,
            scheduleFocus = (callback) => callback(),
        } = options;

        if (!button || !menu || !eventTarget) return null;

        const links = [...menu.querySelectorAll('a[href]')];
        const isOpen = () => menu.classList.contains('active');

        function open() {
            menu.classList.add('active');
            button.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
            button.setAttribute('aria-label', 'Close navigation menu');
            scheduleFocus(() => links[0]?.focus());
        }

        function close({ restoreFocus = true } = {}) {
            const wasOpen = isOpen();
            menu.classList.remove('active');
            button.classList.remove('active');
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-label', 'Open navigation menu');

            if (wasOpen && restoreFocus && !desktopQuery?.matches) {
                button.focus();
            }
        }

        function toggle() {
            if (isOpen()) close();
            else open();
        }

        function onMenuKeyDown(event) {
            if (event.key !== 'Tab' || !isOpen() || links.length === 0) return;

            const firstLink = links[0];
            const lastLink = links[links.length - 1];
            if (event.shiftKey && eventTarget.activeElement === firstLink) {
                event.preventDefault();
                lastLink.focus();
            } else if (!event.shiftKey && eventTarget.activeElement === lastLink) {
                event.preventDefault();
                firstLink.focus();
            }
        }

        function onDocumentKeyDown(event) {
            if (event.key === 'Escape' && isOpen()) {
                event.preventDefault();
                close();
            }
        }

        function onDesktopChange(event) {
            if (event.matches) close({ restoreFocus: false });
        }

        function onLinkClick() {
            if (isOpen()) close({ restoreFocus: false });
        }

        button.addEventListener('click', toggle);
        menu.addEventListener('keydown', onMenuKeyDown);
        eventTarget.addEventListener('keydown', onDocumentKeyDown);
        links.forEach((link) => link.addEventListener('click', onLinkClick));
        desktopQuery?.addEventListener?.('change', onDesktopChange);

        return {
            open,
            close,
            isOpen,
            destroy() {
                button.removeEventListener('click', toggle);
                menu.removeEventListener('keydown', onMenuKeyDown);
                eventTarget.removeEventListener('keydown', onDocumentKeyDown);
                links.forEach((link) => link.removeEventListener('click', onLinkClick));
                desktopQuery?.removeEventListener?.('change', onDesktopChange);
            },
        };
    }

    return { createMobileNavigation };
}));
