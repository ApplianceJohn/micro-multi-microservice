# The Micro-Multi-Microservice

## Timestamp API

A simple API that returns a Unix and UTC timestamp based on what you add to the request URL.

### Example Use

```
[ROOT_PATH]/api/2022-3-23
[ROOT_PATH]/api/1648065268
```

Results may be passed to any receiving program.

## Header Parser

Returns information about the user as a JSON object.

`[ROOT_PATH]/api/whoami`

## URL Shotener

Enter a URL to return an endpoint that redirects to the URL provided.

The result is in the format `/api/shorturl/[id]`

A problem by [freeCodeCamp](https://freecodecamp.org/) solved by [yours truly](https://github.com/ApplianceJohn/).
