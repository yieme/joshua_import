var request = require('request-json');
var client  = request.createClient('http://joshuaproject.net/');
var fs      = require('fs');
var API_KEY = process.env.API_KEY;
var uri     = '/api/v2/people_groups?api_key=' + API_KEY + '&limit=1&page=';
var path    = __dirname + '/data/';
var data    = [];
var usablePhotos = [];
var booleans = {
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

function getPage(page) {
	client.get(uri + page, function(err, res, body) {
		if (err) throw err;
		var people = sparseData(body.data[0]);
		data.push(people);
		var isPhoto = people.Photo;
		fs.writeFile(path + page + '.json', JSON.stringify(people, null, 2), 'utf8');
		if (isPhoto && people.PhotoGood && !people.PhotoCopyright) {
			usablePhotos.push(people.PhotoAddress);
			console.log(page, 'photo');
		} else {
			console.log(page);
		}
		if (page < body.meta.pagination.total_count) {
			getPage(page+1);
		} else {
			fs.writeFile(path + '_all.json', JSON.stringify(data, null, 2), 'utf8');
			fs.writeFile(path + '_photos.json', JSON.stringify(usablePhotos, null, 2), 'utf8');
		}
	});
}

getPage(1);
