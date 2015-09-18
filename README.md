# Joshua Import
[Joshua Project](http://joshuaproject.net) data import to local JSON

## Usage

```sh
API_KEY=api_key_string node .
```

Where:
- `API_KEY` Your [Joshua Project API](http://joshuaproject.net/api/v2) Key
- `DATA` path to where JSON data is stored, default: `data/`
- `LIMIT` is the number of rows to fetch from the Joshua Project API each pass, 1-1000, default: `1000`
- `INDIVIDUAL` if defined, outputs individual JSON files for each people group row returned, default: `false`

## License
MIT
