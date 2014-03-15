import cherrypy
import htpc
import logging
import urllib2
import urllib
import hashlib
import json

class Trakt:
	def __init__(self):
		self.logger = logging.getLogger('modules.trakt')
		htpc.MODULES.append({
			'name': 'Trakt',
			'id': 'trakt',
			'test': htpc.WEBDIR + 'Trakt/ping',
			'fields': [
				{'type': 'bool', 'label': 'Enable', 'name': 'trakt_enable'},
				{'type': 'text', 'label': 'Menu name', 'name': 'trakt_name'},
				{'type': 'text', 'label': 'API key', 'name': 'trakt_apikey'},
				{'type': 'text', 'label': 'Username', 'name': 'trakt_username'},
				{'type': 'password', 'label': 'Password', 'name': 'trakt_password'}
		]})
	
	@cherrypy.expose()
	def index(self):
		return htpc.LOOKUP.get_template("trakt.html").render(scriptname="trakt")
		
	@cherrypy.expose()
	@cherrypy.tools.json_out()
	def GetTrending(self, strType = ""):
		return self.fetch(strType + "/trending")
		
	@cherrypy.expose()
	@cherrypy.tools.json_out()
	def GetRecommendations(self, strType = ""):
		return self.fetch("recommendations/" + strType, True)
	
	def fetch(self, strQuery, bAuthenticate = False):
		strResponse = None
		strData = None
		
		if bAuthenticate == True:
			strData = urllib.urlencode({
				'username':	htpc.settings.get("trakt_username", ""),
				'password':	hashlib.sha1(htpc.settings.get("trakt_password", "")).hexdigest()
			})
	
		try:
			pRequest = urllib2.Request("http://api.trakt.tv/%s.json/%s" % (strQuery, htpc.settings.get("trakt_apikey", "")), strData)
			strResponse = urllib2.urlopen(pRequest).read()
		except urllib2.HTTPError, e:
			print e
			return
			
		return json.loads(strResponse)