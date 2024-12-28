# RSS Tree

[![Netlify Status](https://api.netlify.com/api/v1/badges/d2b11387-e2b1-4ead-a396-236a44348062/deploy-status)](https://app.netlify.com/sites/rsstree/deploys)
[![UptimeRobot status page](https://img.shields.io/badge/uptime%20robot-service%20status-008080?labelColor=005080)](https://stats.uptimerobot.com/JRAN7tBD3G)

Generate RSS Feeds from sources that don't have one.

❓ [What's an RSS Feed?](https://ncase.me/rss/)

## Feeds

| Feed | Uptime | Path | Link |
|------|--------|------|------|
| Groww Digest - Daily                   | ![Groww service monitor](https://img.shields.io/uptimerobot/ratio/m792455816-2d70eea9e9a9a5393a98f04c?label=Groww) | `/.netlify/functions/rss-groww` | [rsstree.netlify.app/.netlify/functions/rss-groww](https://rsstree.netlify.app/.netlify/functions/rss-groww) |
| Bytes - The Best JavaScript Newsletter | ![Bytes service monitor](https://img.shields.io/uptimerobot/ratio/m793759252-df1c9a7779695a96289fcadd?label=Bytes) | `/.netlify/functions/rss-bytes` | [rsstree.netlify.app/.netlify/functions/rss-bytes](https://rsstree.netlify.app/.netlify/functions/rss-bytes) |

| Demo images | |
|-|-|
| ![Demo of Groww Digest - Daily](./docs/demo-groww.jpg) | ![Demo of Bytes](./docs/demo-bytes.png) |

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
cp .env.sample .env  # Put all environment variables here
netlify functions:serve
```

### Testing

Automated tests:

```
npm run test
```

Manual tests:

```bash
# when caching with last-modified header
curl 'http://<host>/.netlify/functions/<func>' -Is | grep -i 'last-modified'
curl 'http://<host>/.netlify/functions/<func>' -H 'If-Modified-Since: <last-modified>' -I

# when caching with etag header
curl 'http://<host>/.netlify/functions/<func>' -Is | grep -i 'etag'
curl 'http://<host>/.netlify/functions/<func>' -H 'If-None-Match: "<etag>"' -I
```

### Debugger

Put a `debugger` statement whereever you want it. Then:

Run the debugger with tests:

```
npm run test:debugger
```

Run the debugger when running functions locally:

```
NODE_OPTIONS="--inspect" netlify functions:serve
```
