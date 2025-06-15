#!/usr/bin/env python3
"""
Simple script to preview the website locally.
Starts a local HTTP server and opens the site in Safari.
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import sys
import os

def start_server(port=8000):
    """Start HTTP server on specified port"""
    try:
        with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"Server running at http://localhost:{port}/")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
            return port
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Port {port} is already in use, trying port {port + 1}")
            return start_server(port + 1)
        else:
            raise e

def open_in_safari(port):
    """Open the website in Safari after a brief delay"""
    time.sleep(1.5)  # Give server time to start
    url = f"http://localhost:{port}/"
    
    # Try to open specifically in Safari on macOS
    try:
        os.system(f'open -a Safari "{url}"')
        print(f"Opening {url} in Safari...")
    except:
        # Fallback to default browser
        webbrowser.open(url)
        print(f"Opening {url} in default browser...")

def find_available_port(start_port=8000):
    """Find an available port starting from start_port"""
    port = start_port
    while True:
        try:
            with socketserver.TCPServer(("", port), http.server.SimpleHTTPRequestHandler) as test_server:
                return port
        except OSError as e:
            if e.errno == 48:  # Address already in use
                port += 1
                if port > start_port + 100:  # Prevent infinite loop
                    raise Exception("Could not find available port")
            else:
                raise e

if __name__ == "__main__":
    # Find available port first
    port = find_available_port(8000)
    
    # Start Safari opening in a separate thread with correct port
    safari_thread = threading.Thread(target=open_in_safari, args=(port,))
    safari_thread.daemon = True
    safari_thread.start()
    
    # Start the server (this will block)
    try:
        start_server(port)
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)