import json, datetime
with open('data_raw.json') as f:
    d = json.load(f)
d['fetchedAt'] = datetime.datetime.utcnow().isoformat()
with open('data.json', 'w') as f:
    json.dump(d, f, separators=(',', ':'))
