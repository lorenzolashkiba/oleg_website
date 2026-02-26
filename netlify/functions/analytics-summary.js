const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';
const VISIT_FORM_NAME = 'visit_log';
const CONVERSION_FORM_NAME = 'conversion_log';

function json(statusCode, payload) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    };
}

async function fetchNetlify(path, token) {
    const res = await fetch(`${NETLIFY_API_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Netlify API ${res.status}: ${body.slice(0, 300)}`);
    }

    return res.json();
}

async function fetchAllSubmissions(formId, token, maxPages = 10) {
    const all = [];
    for (let page = 1; page <= maxPages; page += 1) {
        const items = await fetchNetlify(`/forms/${formId}/submissions?per_page=100&page=${page}`, token);
        if (!Array.isArray(items) || items.length === 0) break;
        all.push(...items);
        if (items.length < 100) break;
    }
    return all;
}

function safeDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function aggregateVisits(visitSubmissions, windowDays) {
    const now = new Date();
    const minDate = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

    const pageViews = {};
    const sessions = new Set();
    let total = 0;
    let windowTotal = 0;

    visitSubmissions.forEach((s) => {
        total += 1;
        const path = s?.data?.path || '/';
        pageViews[path] = (pageViews[path] || 0) + 1;

        const sid = s?.data?.session_id;
        if (sid) sessions.add(sid);

        const createdAt = safeDate(s?.created_at);
        if (createdAt && createdAt >= minDate) windowTotal += 1;
    });

    const topPages = Object.entries(pageViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, views]) => ({ path, views }));

    return {
        total_visits: total,
        last_days_visits: windowTotal,
        unique_sessions: sessions.size,
        top_pages: topPages
    };
}

function aggregateConversions(conversionSubmissions, windowDays) {
    const now = new Date();
    const minDate = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const byType = {};
    let total = 0;
    let windowTotal = 0;

    conversionSubmissions.forEach((s) => {
        total += 1;
        const type = s?.data?.type || 'generic';
        byType[type] = (byType[type] || 0) + 1;

        const createdAt = safeDate(s?.created_at);
        if (createdAt && createdAt >= minDate) windowTotal += 1;
    });

    return { total_conversions: total, last_days_conversions: windowTotal, by_type: byType };
}

exports.handler = async (event) => {
    try {
        const dashboardKey = process.env.ANALYTICS_DASHBOARD_KEY;
        const providedKey = event.headers['x-analytics-key'] || event.headers['X-Analytics-Key'];

        if (dashboardKey && providedKey !== dashboardKey) {
            return json(401, { error: 'Unauthorized' });
        }

        const siteId = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
        const token = process.env.NETLIFY_ACCESS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;
        const windowDays = Math.max(1, Math.min(90, Number(event.queryStringParameters?.days || 30)));

        if (!siteId || !token) {
            return json(500, {
                error: 'Missing site/token env vars (NETLIFY_SITE_ID or SITE_ID, NETLIFY_ACCESS_TOKEN or NETLIFY_AUTH_TOKEN)'
            });
        }

        const forms = await fetchNetlify(`/sites/${siteId}/forms`, token);
        const visitForm = forms.find((f) => f.name === VISIT_FORM_NAME);
        const conversionForm = forms.find((f) => f.name === CONVERSION_FORM_NAME);

        if (!visitForm || !conversionForm) {
            return json(404, {
                error: 'Forms not found. Ensure visit_log and conversion_log exist and site was redeployed.'
            });
        }

        const [visitSubmissions, conversionSubmissions] = await Promise.all([
            fetchAllSubmissions(visitForm.id, token),
            fetchAllSubmissions(conversionForm.id, token)
        ]);

        const visits = aggregateVisits(visitSubmissions, windowDays);
        const conversions = aggregateConversions(conversionSubmissions, windowDays);
        const conversionRate = visits.total_visits > 0
            ? Number(((conversions.total_conversions / visits.total_visits) * 100).toFixed(2))
            : 0;

        return json(200, {
            generated_at: new Date().toISOString(),
            window_days: windowDays,
            visits,
            conversions,
            conversion_rate_percent: conversionRate
        });
    } catch (error) {
        return json(500, { error: error.message || 'Unexpected error' });
    }
};
