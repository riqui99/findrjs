#!/usr/bin/env python
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import json
import socket
import os
import platform
import subprocess
import sys
import time


start_time = time.time()


def uptime():
    return time.time() - start_time


class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Expose-Headers", "Access-Control-Allow-Origin")
        self.send_header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        response = json.dumps({
            "hostname": socket.gethostname(),
            "system": platform.system(),
            "os": platform.release(),
            "system_name": os.name,
            "uptime": uptime()
        })
        self.wfile.write(response)


if __name__ == "__main__":
    from sys import argv

    port = 8878
    if len(argv) == 2:
        port = argv[1]

    server_address = ('', port)
    httpd = HTTPServer(server_address, S)
    print 'Starting findr server on port {}'.format(port)
    httpd.serve_forever()
