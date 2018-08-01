#!/usr/bin/env python

from __future__ import print_function
import sys

try:
    # Py2
    import SimpleHTTPServer as httpserve
except ImportError:
    # Py3
    import http.server as httpserve

try:
    # Py2
    import SocketServer as socketserver
except ImportError:
    # Py3
    import socketserver

import webbrowser

PORT = 6543
print("Serving at local port %d ..." % PORT)

Handler = httpserve.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(("", PORT), Handler)
print("Serving on http://localhost:%d" % PORT)

#webbrowser.open('http://localhost:%d/?url=http://localhost:%d/scratch_extensions/martyExtended.js#scratch' % (PORT, PORT))
webbrowser.open('http://localhost:%d/martyScratch.html' % (PORT))

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("bye!")

httpd.server_close()
sys.exit(0)
