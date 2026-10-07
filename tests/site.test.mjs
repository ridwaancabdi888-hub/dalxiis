import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../404.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');

const canonicalMatch = index.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
const canonicalUrl = canonicalMatch?.[1];

function extractBlocks(html, tagName) {
    return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, 'gi'))]
        .map((match) => match[0]);
}

function extractAttribute(markup, attribute) {
    const match = markup.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i'));
    return match?.[1];
}

test('canonical URL, robots and sitemap stay aligned', () => {
    assert.ok(canonicalUrl, 'index.html must include a canonical URL');
    assert.equal(new URL(canonicalUrl).origin, 'https://dalxiis-six.vercel.app');
    assert.match(robots, /^User-agent:\s*\*$/m);
    assert.match(robots, /^Allow:\s*\/$/m);
    assert.match(robots, new RegExp(`^Sitemap:\\s*${canonicalUrl}sitemap\\.xml$`, 'm'));
    assert.match(sitemap, new RegExp(`<loc>${canonicalUrl}<\\/loc>`));
});

test('structured destination data matches the visible cards', () => {
    const structuredDataMatch = index.match(
        /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i,
    );
    assert.ok(structuredDataMatch, 'index.html must include JSON-LD');

    const structuredData = JSON.parse(structuredDataMatch[1]);
    const destinationList = structuredData['@graph'].find((item) => item['@type'] === 'ItemList');
    assert.ok(destinationList, 'JSON-LD must include an ItemList');

    const cardNames = [...index.matchAll(/class=["']card-title["'][^>]*>([^<]+)<\/h3>/gi)]
        .map((match) => match[1].trim());
    const structuredNames = destinationList.itemListElement
        .map((entry) => entry.item.name.trim());

    assert.equal(destinationList.numberOfItems, cardNames.length);
    assert.deepEqual(structuredNames, cardNames);
    assert.deepEqual(
        destinationList.itemListElement.map((entry) => entry.position),
        cardNames.map((_, index) => index + 1),
    );
});

test('every internal navigation link points to an existing id', () => {
    const ids = new Set([...index.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]));
    const fragmentLinks = [...index.matchAll(/<a\b[^>]*\shref=["']#([^"']+)["'][^>]*>/gi)]
        .map((match) => match[1]);

    assert.ok(fragmentLinks.length > 0, 'at least one fragment link is expected');
    for (const fragment of fragmentLinks) {
        assert.ok(ids.has(fragment), `missing target id for #${fragment}`);
    }
});

test('destination cards retain keyboard and dialog semantics', () => {
    const cards = extractBlocks(index, 'div')
        .filter((block) => /class=["'][^"']*\bdestination-card\b/i.test(block));

    assert.equal(cards.length, 6);
    for (const card of cards) {
        assert.equal(extractAttribute(card, 'role'), 'button');
        assert.equal(extractAttribute(card, 'tabindex'), '0');
        assert.equal(extractAttribute(card, 'aria-haspopup'), 'dialog');
        assert.ok(extractAttribute(card, 'data-details'), 'destination details are required');
    }

    const modal = index.match(/<div\s+class=["']modal-overlay["'][\s\S]*?<\/div>\s*<\/div>/i)?.[0];
    assert.ok(modal, 'destination modal must exist');
    assert.equal(extractAttribute(modal, 'role'), 'dialog');
    assert.equal(extractAttribute(modal, 'aria-modal'), 'true');
    assert.ok(extractAttribute(modal, 'aria-labelledby'));
});

test('contact fields keep explicit labels and native validation', () => {
    for (const id of ['name', 'email', 'destination', 'message']) {
        assert.match(index, new RegExp(`<label\\s+for=["']${id}["']`, 'i'));
        assert.match(index, new RegExp(`<(?:input|textarea)[^>]+id=["']${id}["']`, 'i'));
    }

    const nameInput = index.match(/<input\b[^>]*id=["']name["'][^>]*>/i)?.[0];
    const emailInput = index.match(/<input\b[^>]*id=["']email["'][^>]*>/i)?.[0];
    assert.ok(nameInput);
    assert.ok(emailInput);
    assert.match(nameInput, /\srequired(?:\s|>)/i);
    assert.equal(extractAttribute(emailInput, 'type'), 'email');
    assert.match(emailInput, /\srequired(?:\s|>)/i);
    assert.match(index, /id=["']formSuccess["'][^>]+role=["']status["']/i);
});

test('classic inline JavaScript remains syntactically valid', () => {
    const scripts = [...index.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
        .filter((match) => !/application\/ld\+json/i.test(match[1]))
        .map((match) => match[2])
        .filter((source) => source.trim());

    assert.ok(scripts.length > 0, 'at least one classic script is expected');
    for (const source of scripts) {
        assert.doesNotThrow(() => new Function(source));
    }
});

test('custom 404 page remains non-indexable and links home', () => {
    assert.match(notFound, /<meta\s+name=["']robots["']\s+content=["']noindex,\s*follow["']/i);
    assert.match(notFound, /<a\s+href=["']\/["'][^>]*>/i);
    assert.match(notFound, /<h1>Page not found<\/h1>/i);
});
