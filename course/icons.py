"""Original 24x24 line icons (stroke=currentColor). Embedded inline so pages work offline, including file://."""

ICONS = {
    'terminal': '<path d="M4 17l6-6-6-6M12 19h8"/>',
    'branch': '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-12 6"/>',
    'container': '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    'wheel': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M12 14.5V21M4 7.5l5.8 3.3M14.2 13.2l5.8 3.3M4 16.5l5.8-3.3M14.2 10.8l5.8-3.3"/>',
    'anchor': '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 11h8M5 13c0 5 3.5 8 7 8s7-3 7-8"/>',
    'mesh': '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="12" cy="11" r="1.5"/><path d="M7 6h10M6.5 7.5l4.3 10M17.5 7.5l-4.3 10M12 12.5V17"/>',
    'gear': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    'hammer': '<path d="M3 21l9-9M13 4l7 7-3 3-7-7zM9 8l4-4"/>',
    'layers': '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12.5l9 5 9-5M3 17l9 5 9-5"/>',
    'cloud': '<path d="M7 19a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 19z"/>',
    'rocket': '<path d="M12 3c4 2 6 6 5 11l-5 3-5-3c-1-5 1-9 5-11z"/><circle cx="12" cy="10" r="2"/><path d="M8 17l-3 4M16 17l3 4"/>',
    'workflow': '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h4a2 2 0 012 2v7"/>',
    'stack': '<rect x="4" y="3" width="16" height="6" rx="1"/><rect x="4" y="11" width="16" height="6" rx="1"/><path d="M8 20h8M8 6h.01M8 14h.01"/>',
    'flask': '<path d="M9 3h6M10 3v6l-5 10a2 2 0 002 3h10a2 2 0 002-3l-5-10V3"/>',
    'bulb': '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 00-4-10z"/>',
    'warn': '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    'coin': '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6v2M12 16v2"/>',
    'shield': '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
    'check': '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    'bad': '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    'home': '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'key': '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
}


def sprite():
    syms = ''.join(f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items())
    return f'<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">{syms}</svg>'


def ic(name, cls='ic'):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#i-{name}"/></svg>'
