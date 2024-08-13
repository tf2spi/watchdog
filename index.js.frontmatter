---
---
'use strict';

// Put frontmatter data in separate module file to
// help LSP and the JS runtime give better diagnostics
// with correct line numbers and errors
const sourcesTranslation = {
	{% for option in site.data.options.source %}
	'{{option.source}}': '{{option.url}}',
	{% endfor %}
};
const advancedSearches = [
	{% for option in site.data.options.as %}
	'{{option.name}}',
	{% endfor %}
];
const googleSearchOps = {
	{% for option in site.data.options.query %}
	'{{option.name}}': '{{option.google}}',
	{% endfor %}
};

export {sourcesTranslation, advancedSearches, googleSearchOps};
