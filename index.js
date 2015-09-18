var request      = require('request-json');
var client       = request.createClient('http://joshuaproject.net/');
var fs           = require('fs');
var API_KEY      = process.env.API_KEY    || false;
var limit        = process.env.LIMIT      || 1000;
var path         = process.env.DATA       || 'data/';
var individual   = process.env.INDIVIDUAL || false;
var minimized    = process.env.MINIMIZED  || false;
var both         = process.env.BOTH       || false;
var peopleData   = [];
var usablePhotos = [];
var uri          = '/api/v2/people_groups?api_key=' + API_KEY + '&limit=' + limit + '&page=';
limit            = (limit > 999) ? 1000 : limit;
limit            = (limit < 1)   ? 1    : limit;
var booleans = { // fields that contain boolean data in the form of 'Y' = true, 'N' or '' = false
	'10_40Window': 1,
	'LeastReached': 1,
	'IndigenousCode': 1,
	'Photo': 1,
	'PhotoGood': 1,
	'PhotoCreativeCommons': 1,
	'PhotoCopyright': 1,
	'Map': 1,
	'MapCopyright': 1,
	'JF':1,
	'AudioRecordings':1,
	'NTOnline':1,
	'GospelRadio':1,
};
var peopleGroupCount = 0;
try {
	fs.mkdirSync(path);
} catch(e) {}

if (!API_KEY) throw new Error('Missing API_KEY');

// sparse data, drop falsy data fields
// Y/N/blank to boolean
function sparseData(obj) {
	var result = {};
	for (var key in obj) {
		if (obj[key]) {
			if (booleans[key]) {
				if (obj[key] == 'Y') result[key] = true;
			} else {
				result[key] = obj[key];
			}
		}
	}
	return result;
}

function writeData(file, obj) {
	if (minimized || both) {
		fs.writeFile(path + file + '.min.json', JSON.stringify(obj), 'utf8');
	}
	if (!minimized || both) {
		fs.writeFile(path + file + '.json', JSON.stringify(obj, null, 2), 'utf8');
	}
}

function processPeople(people) {
	if (!people) return;
	peopleGroupCount++;
	people = sparseData(people);
	peopleData.push(people);
	if (individual) {
		writeData(peopleGroupCount, people);
	}
	var isPhoto = people.Photo;
	if (isPhoto && people.PhotoGood && !people.PhotoCopyright) {
		if (usablePhotos.indexOf(people.PhotoAddress) < 0) {
			usablePhotos.push(people.PhotoAddress);
		}
	}
}

function getPage(page) {
	client.get(uri + page, function(err, res, body) {
		if (err) throw err;
		var peoples = body.data;
		for (var i=0; i < peoples.length; i++) {
			processPeople(peoples[i]);
		}
		if (!body.meta.pagination || body.status.status_code == 403) {
			throw new Error('Invalid API_KEY');
		}
		var pages = body.meta.pagination.total_pages;
		console.log(page + ' of ' + pages + ' - ' +  usablePhotos.length + ' photos');
		if (page < pages) {
			getPage(page+1);
		} else {
			writeData('data',   peopleData);
			writeData('photos', usablePhotos);
		}
	});
}

getPage(1);
