var request = require('request-json');
var client  = request.createClient('http://joshuaproject.net/');
var fs      = require('fs');
var API_KEY = process.env.API_KEY;
var limit   = process.env.LIMIT || 1000;
limit = (limit > 999) ? 1000 : limit;
limit = (limit < 1) ? 1 : limit;
var uri     = '/api/v2/people_groups?api_key=' + API_KEY + '&limit=' + limit + '&page=';
var path    = process.env.DATA || 'data/';
var individual = process.env.INDIVIDUAL || false;
var data    = [];
var usablePhotos = [];
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

function processPeople(people) {
	peopleGroupCount++;
	people = sparseData(people);
	data.push(people);
	fs.writeFile(path + peopleGroupCount + '.json', JSON.stringify(people, null, 2), 'utf8');

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
		var pages = body.meta.pagination.total_pages;
		console.log(page, 'of', pages, '-', usablePhotos.length, 'photos');
		if (page < pages) {
			getPage(page+1);
		} else {
			fs.writeFile(path + 'data.json', JSON.stringify(data, null, 2), 'utf8');
			fs.writeFile(path + 'data.min.json', JSON.stringify(data), 'utf8');
			fs.writeFile(path + 'photos.json', JSON.stringify(usablePhotos, null, 2), 'utf8');
			fs.writeFile(path + 'photos.min.json', JSON.stringify(usablePhotos), 'utf8');
		}
	});
}

getPage(1);
