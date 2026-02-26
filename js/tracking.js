/* ============================================
   Lightweight Visit + Conversion Tracking
   Uses Netlify Forms as storage backend
   ============================================ */
(function () {
    const NETLIFY_FORM_ENDPOINT = '/';
    const VISIT_FORM_NAME = 'visit_log';
    const CONVERSION_FORM_NAME = 'conversion_log';

    function encodeFormData(payload) {
        return Object.keys(payload)
            .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key] ?? ''))
            .join('&');
    }

    function postToNetlifyForm(payload) {
        return fetch(NETLIFY_FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: encodeFormData(payload)
        }).catch(() => {
            // Silent fail: tracking must never block UX
        });
    }

    function getSessionId() {
        const key = 'site_session_id';
        const existing = localStorage.getItem(key);
        if (existing) return existing;

        const generated = 's_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem(key, generated);
        return generated;
    }

    function getDeviceType() {
        const ua = navigator.userAgent || '';
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    function trackVisitOncePerSessionAndPath() {
        const path = window.location.pathname || '/';
        const sessionPathKey = `tracked_visit:${path}`;

        if (sessionStorage.getItem(sessionPathKey) === '1') return;
        sessionStorage.setItem(sessionPathKey, '1');

        postToNetlifyForm({
            'form-name': VISIT_FORM_NAME,
            path,
            referrer: document.referrer || 'direct',
            session_id: getSessionId(),
            device: getDeviceType(),
            page_title: document.title || ''
        });
    }

    window.logSiteConversion = function (conversionType) {
        return postToNetlifyForm({
            'form-name': CONVERSION_FORM_NAME,
            type: conversionType || 'generic',
            path: window.location.pathname || '/',
            referrer: document.referrer || 'direct',
            session_id: getSessionId(),
            device: getDeviceType()
        });
    };

    trackVisitOncePerSessionAndPath();
})();
