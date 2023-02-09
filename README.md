# RSS Tree

[![Netlify Status](https://api.netlify.com/api/v1/badges/d2b11387-e2b1-4ead-a396-236a44348062/deploy-status)](https://app.netlify.com/sites/rsstree/deploys)

Generate RSS Feeds from sources that don't have one.

## Feeds

| Feed | Path | Link |
|------|------|---------|
| Groww Digest - Daily | `/.netlify/functions/rss-groww` | [rsstree.netlify.app/.netlify/functions/rss-groww](https://rsstree.netlify.app/.netlify/functions/rss-groww) |

![Demo of Groww Digest - Daily](./docs/demo.jpg)

## Development Requirements

- node and npm
- [netlify cli installed globally](https://docs.netlify.com/cli/get-started/)

## Project Scaffolding

Steps:

```
netlify init
netlify functions:create --name <func-name>
```

## Local Development

```
npm install
touch .env  # Put all environment variables here
netlify functions:serve
```

Testing

```bash
# when caching with last-modified header
curl 'http://<host>/.netlify/functions/<func>' -Is | grep -i 'last-modified'
curl 'http://<host>/.netlify/functions/<func>' -H 'If-Modified-Since: <last-modified>' -I

# when caching with etag header
curl 'http://<host>/.netlify/functions/<func>' -Is | grep -i 'etag'
curl 'http://<host>/.netlify/functions/<func>' -H 'If-None-Match: "<etag>"' -I
```
