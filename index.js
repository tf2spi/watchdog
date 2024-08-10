---
---
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
const googleSearches = {
	{% for option in site.data.options.query %}
	'{{option.name}}': '{{option.google}}',
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
	submitter = ev.submitter;

	sites = Object.entries(sourcesTranslation)
		.filter(entry => document.getElementById('source_'+entry[0]).checked)
		.map(entry => `site:${entry[1]}`);

	as_keys = {}
	advancedSearches.forEach(as => as_keys[as] = [
		document.getElementById(as+'_occt').value,
		lex(document.getElementById(as).value)
	]);

        // Google search has "allin*" operators to optimize query size
	let occt, terms;
	[occt, terms] = as_keys.as_q;
	occt = googleSearches[occt];
	let as_q = (occt && 'all')+occt+terms.join(' ');
	as_q = as_q && ('('+as_q+')');

	// Google has '[]' which function the same as quotes
	[occt, terms] = as_keys.as_epq;
	occt = googleSearches[occt];
	let as_epq = terms.join(' ');
	as_epq = as_epq && (occt+'['+terms.join(' ')+']');

        // Terms where any of them appear
	[occt, terms] = as_keys.as_oq;
	occt = googleSearches[occt];
	let as_oq = terms.map(s => occt+s).join(' OR ');
	as_oq = as_oq && ('('+as_oq+')');

	// Terms to be excluded
	[occt, terms] = as_keys.as_eq;
	occt = googleSearches[occt];
	let as_eq = terms.map(s => '-'+occt+s).join(' ');

	let as_sites = sites.join(' OR ');
	as_sites = as_sites && ('('+as_sites+')'); 
	let query = encodeURIComponent([
		as_q,
		as_epq,
		as_oq,
		as_eq,
		as_sites,
	].join(' '));

	console.log(decodeURIComponent(query));
	window.location.href = 'https://google.com/search?q=' + query;
});
