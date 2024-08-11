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
const googleSearchOps = {
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

	let as_keys = {}
	advancedSearches.forEach(as => as_keys[as] = [
		document.getElementById(as+'_occt').value,
		lex(document.getElementById(as).value)
	]);

	// Terms which must show up in document
	let occt, terms;
	[occt, terms] = as_keys.as_q;
	occt = googleSearchOps[occt];
	let as_q = terms.map(s => occt+s).join(' ');
	as_q &&= ('('+as_q+')');

	// Look for exact phrase
	// Google has '[]' which function the same as quotes
	[occt, terms] = as_keys.as_epq;
	occt = googleSearchOps[occt];
	let as_epq = terms.join(' ');
	as_epq &&= (occt+'['+terms.join(' ')+']');

        // Terms where any of them appear
	[occt, terms] = as_keys.as_oq;
	occt = googleSearchOps[occt];
	let as_oq = terms.map(s => occt+s).join(' OR ');
	as_oq &&= ('('+as_oq+')');

	// Terms to be excluded
	[occt, terms] = as_keys.as_eq;
	occt = googleSearchOps[occt];
	let as_eq = terms.map(s => '-'+occt+s).join(' ');

	let as_qdrlo = document.getElementById('as_qdrlo').value;
	as_qdrlo &&= 'after:'+as_qdrlo;
	let as_qdrhi = document.getElementById('as_qdrhi').value;
	as_qdrhi &&= 'before:'+as_qdrhi;

	let as_sites = Object.entries(sourcesTranslation)
		.filter(entry => document.getElementById('source_'+entry[0]).checked)
		.map(entry => `site:${entry[1]}`)
		.join(' OR ');
	as_sites = as_sites && ('('+as_sites+')'); 
	let query = encodeURIComponent([
		as_q,
		as_oq,
		as_epq,
		as_eq,
		as_qdrlo,
		as_qdrhi,
		as_sites,
	].join(' '));
	window.location.href = 'https://google.com/search?q=' + query;
});
