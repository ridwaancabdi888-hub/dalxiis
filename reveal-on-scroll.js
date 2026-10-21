(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.DalxiisReveal = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function reveal(element) {
        element.classList.add('visible');
    }

    function observeElements(elements, options = {}) {
        const items = Array.from(elements || []);
        const ObserverClass = options.ObserverClass
            ?? (typeof IntersectionObserver === 'function' ? IntersectionObserver : null);

        if (!ObserverClass) {
            items.forEach(reveal);
            return null;
        }

        const observer = new ObserverClass((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                reveal(entry.target);
                observer.unobserve(entry.target);
            });
        }, options.observerOptions);

        items.forEach((element) => observer.observe(element));
        return observer;
    }

    return { observeElements };
}));
