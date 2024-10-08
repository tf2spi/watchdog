'use strict';
import {sourcesTranslation, advancedSearches, googleSearchOps} from './index.frontmatter.js';

const closeQuote = (s) => {
	return s.includes('"') && s.slice(-1) != '"' ? s.concat('"') : s;
}

// Lex words that are space separate and phrases surrounded in quotes
// Search operators like op:"word1 word2" should also be allowed.
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

// A lot of the encoding functions for certain search
// parameters are the same between search engines so
// put them in separate functions.

// How Google encodes as_q (where all words must show up once)
const googleQEncode = function(query) {
	let occt, terms;
	[occt, terms] = query.as_q;
	occt = googleSearchOps[occt];
	let as_q = terms.map(s => occt+s).join(' ');
	as_q &&= ('('+as_q+')');
	return as_q;
};

// How Google encodes as_epq (where the exact phrase must show up)
// Remove quotes to prevent misinterpretation of queries.
const googleEpqEncode = function(query) {
	let occt, terms;
	[occt, terms] = query.as_epq;
	occt = googleSearchOps[occt];
	let as_epq = terms.join(' ');
	as_epq &&= (occt+'"'+terms.join(' ').replaceAll('"','')+'"');
	return as_epq;
};

// How Google encodes as_oq (where only one of the words must show up)
const googleOqEncode = function(query) {
	let occt, terms;
	[occt, terms] = query.as_oq;
	occt = googleSearchOps[occt];
	let as_oq = terms.map(s => occt+s).join(' OR ');
	as_oq &&= ('('+as_oq+')');
	return as_oq;
};

// How Google encodes as_eq (where none of the words can show up)
const googleEqEncode = function(query) {
	let occt, terms;
	[occt, terms] = query.as_eq;
	occt = googleSearchOps[occt];
	let as_eq = terms.map(s => '-'+occt+s).join(' ');
	return as_eq;
};

// How Google encodes as_qdr (date range for results)
const googleQdrEncode = function(query) {
	let as_qdrlo = query.as_qdrlo && 'after:'+query.as_qdrlo;
	let as_qdrhi = query.as_qdrhi && 'before:'+query.as_qdrhi;
	return as_qdrlo+' '+as_qdrhi;
};

// How Google encodes as_n (number range for results)
const googleNEncode = function(query) {
	return (query.as_nlo || query.as_nhi) && `${query.as_nlo}..${query.as_nhi}`;
}

// How Google encodes as_sites (sites to limit the search to)
const googleSitesEncode = function(query) {
	let as_sites = query.as_sites
		.map(entry => 'site:'+entry)
		.join(' OR ');
	as_sites = as_sites && ('('+as_sites+')');
	return as_sites;
};

// How Bing encodes as_sites
const bingSitesEncode = function(query) {
	let as_sites = query.as_sites
		.map(entry =>'site:'+entry)
		.join(' OR ');
};

// When crafting query strings, we'll likely have
// redundant spaces that we should replace with one.
// Even in quotes, most search engines don't care about
// the exact number spaces.
const whitespaceRegex = /\s+/g;

// Craft query string for use with Google
const googleQueryStr = function(query) {
	return encodeURIComponent([
		googleQEncode(query),
		googleNEncode(query),
		googleOqEncode(query),
		googleEpqEncode(query),
		googleEqEncode(query),
		googleQdrEncode(query),
		googleSitesEncode(query),
	].join(' ').replace(whitespaceRegex, ' '));
};

document.getElementById('query').addEventListener('submit', (ev) => {
	ev.preventDefault();
	let query = getQueryObject();
	let url = '';
	if (query.as_engine == 'google') {
		url = 'https://google.com/search?q='+googleQueryStr(query);
	} else if (query.as_engine == 'udm14') {
		url = 'https://google.com/search?udm=14&q='+googleQueryStr(query);
	} else if (query.as_engine == 'ecosia') {
		// Ecosia supposedly uses a Bing backend but Google search
		// operators work instead of Bing search operators...
		url = 'https://ecosia.com/search?q='+googleQueryStr(query);
	}
	window.location.href = url;
});
