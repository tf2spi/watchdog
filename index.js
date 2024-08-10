---
---
const sourcesTranslation = {
	{% for option in site.data.options.source %}
	'{{option.source}}': '{{option.url}}',
	{% endfor %}
};

const closeQuote = (s) => {
	return s.includes('"') && s.slice(-1) != '"' ? s.concat('"') : s;
}

// Lex words that are space separate and phrases surrounded in quotes
// Search operators like site:""
const lexRegex = /([a-zA-Z]+:)?([^\s"]+|"[^"]*"?)/g;
const lex = (query) => {
	return (query.match(lexRegex) || []).map(w => closeQuote(w));
}

document.getElementById('query').addEventListener('submit', (ev) => {
	ev.preventDefault();
	element = ev.submitter;
	as_q = document.getElementById('as_q').value || '';
	tokens = lex(as_q);
	query = encodeURIComponent(`(site:npr.org OR site:nytimes.com) ${tokens.join(' ')}`)
	window.location.href = 'https://google.com/search?q=' + query;
})
