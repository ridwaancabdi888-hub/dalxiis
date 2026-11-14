(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.DalxiisTripPreview = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const fields = [
        ['name', 'Full name'],
        ['email', 'Email'],
        ['destination', 'Destination'],
        ['message', 'Trip interests'],
    ];

    function formatTripPreview(values) {
        return fields.flatMap(([key, label]) => {
            const value = String(values[key] ?? '').trim();
            return value ? [`${label}: ${value}`] : [];
        }).join('\n');
    }

    function createTripPreview(options) {
        const {
            form,
            preview,
            previewText,
            statusText,
            clearButton,
            getValues = () => Object.fromEntries(new FormData(form).entries()),
        } = options;

        if (!form || !preview || !previewText || !statusText || !clearButton) return null;

        function invalidate() {
            if (preview.hidden) return;

            preview.hidden = true;
            previewText.textContent = '';
            statusText.textContent = 'Trip details changed. Preview again to review the latest information.';
        }

        function onSubmit(event) {
            event.preventDefault();
            if (!form.reportValidity()) return;

            previewText.textContent = formatTripPreview(getValues());
            preview.hidden = false;
            statusText.textContent = 'Trip idea preview ready. Nothing was sent or stored.';
            preview.focus();
        }

        function onClear() {
            form.reset();
            preview.hidden = true;
            previewText.textContent = '';
            statusText.textContent = 'Preview cleared. Nothing was sent or stored.';
            form.elements.namedItem('name')?.focus();
        }

        form.addEventListener('submit', onSubmit);
        form.addEventListener('input', invalidate);
        clearButton.addEventListener('click', onClear);

        return {
            invalidate,
            destroy() {
                form.removeEventListener('submit', onSubmit);
                form.removeEventListener('input', invalidate);
                clearButton.removeEventListener('click', onClear);
            },
        };
    }

    return { createTripPreview, formatTripPreview };
}));
