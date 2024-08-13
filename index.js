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

// Accumulate common query object variables
const getQueryObject = function() {
	let query = {};
	advancedSearches.forEach(as => query[as] = [
		document.getElementById(as+'_occt').value,
		lex(document.getElementById(as).value)
	]);
	query['as_sites'] = Object.entries(sourcesTranslation)
		.filter(entry => document.getElementById('source_'+entry[0]).checked)
		.map(entry => entry[1]);
	query['as_qdrlo'] = document.getElementById('as_qdrlo').value
	query['as_qdrhi'] = document.getElementById('as_qdrhi').value
	query['as_nlo'] = document.getElementById('as_nlo').value
	query['as_nhi'] = document.getElementById('as_nhi').value
	query['as_engine'] = document.getElementById('as_engine').value;
	return query;
};

const googleQuery = function(query, udm14) {
	// Terms which must show up in document
	let occt, terms;
	[occt, terms] = query.as_q;
	occt = googleSearchOps[occt];
	let as_q = terms.map(s => occt+s).join(' ');
	as_q &&= ('('+as_q+')');

	// Look for exact phrase
	[occt, terms] = query.as_epq;
	occt = googleSearchOps[occt];
	let as_epq = terms.join(' ');
	as_epq &&= (occt+'"'+terms.join(' ').replaceAll('"','')+'"');

        // Terms where any of them appear
	[occt, terms] = query.as_oq;
	occt = googleSearchOps[occt];
	let as_oq = terms.map(s => occt+s).join(' OR ');
	as_oq &&= ('('+as_oq+')');

	// Terms to be excluded
	[occt, terms] = query.as_eq;
	occt = googleSearchOps[occt];
	let as_eq = terms.map(s => '-'+occt+s).join(' ');

	// Date range
	let as_qdrlo = query.as_qdrlo && 'after:'+as_qdrlo;
	let as_qdrhi = query.as_qdrhi && 'before:'+as_qdrhi;

	// Number ranges
	let as_n = (query.as_nlo || query.as_nhi) && `${query.as_nlo}..${query.as_nhi}`;

	// Sites to limit the search
	let as_sites = query.as_sites
		.map(entry => 'site:'+entry)
		.join(' OR ');
	as_sites = as_sites && ('('+as_sites+')'); 
	let queryStr = encodeURIComponent([
		as_q,
		as_n,
		as_oq,
		as_epq,
		as_eq,
		as_qdrlo,
		as_qdrhi,
		as_sites,
	].join(' '));
	window.location.href = 'https://google.com/search?q=' + queryStr + udm14;
}

document.getElementById('query').addEventListener('submit', (ev) => {
	ev.preventDefault();
	query = getQueryObject();
	if (query.as_engine == 'udm14') {
		googleQuery(query, '&udm=14');
	} else if (query.as_engine == 'google') {
		googleQuery(query, '');
	}
});
