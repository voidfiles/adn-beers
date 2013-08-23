"""
Flask Module Docs:  http://flask.pocoo.org/docs/api/#flask.Module

This file is used for both the routing and logic of your
application.
"""
import urllib

from google.appengine.ext import ndb

from flask import Blueprint, url_for, render_template, request, redirect, Response

views = Blueprint('views', __name__)

UNTAPPED_API_BASE = "http://api.untappd.com/v4"

CLIENT_ID = "UNTAPPD_CLIENT_ID"
CLIENT_SECRET = "UNTAPPD_CLIENT_SECRET"
CREDENTIALS = {
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET, 
}


@ndb.tasklet
def make_request(call, method='GET', params=None):
    params = params or {}

    params.update(CREDENTIALS)
    params = urllib.urlencode(params)

    url = '%s/%s' % (UNTAPPED_API_BASE, call)
    if params:
        url += '?' + params

    kwargs = {
        "method": method,
        "url": url,
    }

    ctx = ndb.get_context()

    resp = yield ctx.urlfetch(**kwargs)
    if resp.status_code == 200:
        raise ndb.Return(resp.content)

    raise Exception('Couldn\'t fetch %s %s' % (url, resp.content))


@views.route('/beer/<post_id>/')
@views.route('/')
def index(post_id=None):
    return render_template('index.html')


@views.route('/api-proxy/<path:method>')
@ndb.synctasklet
def api_proxy(method):
    """Render website's index page."""

    params = {
        'q': request.args.get('q'),
    }

    resp = yield make_request(method, params=params)

    raise ndb.Return(Response(resp, mimetype='application/json'))

@views.route('/qunit/')
def qunit():
    """Render a QUnit page for JavaScript tests."""
    return render_template('test_js.html')


@views.after_request
def add_header(response):
    """Add header to force latest IE rendering engine and Chrome Frame."""
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    return response


@views.app_errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404
