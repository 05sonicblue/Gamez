import cherrypy
import json
import os
from DBFunctions import GetGamesFromTerm, GetGameDataFromTerm, AddGameToDb, GetRequestedGames, RemoveGameFromDb, UpdateStatus, GetLog, ClearDBLog,AddWiiGamesIfMissing,AddXbox360GamesIfMissing,ApiGetGamesFromTerm
from UpgradeFunctions import CheckForNewVersion,IgnoreVersion,UpdateToLatestVersion
import ConfigParser
from time import sleep
import urllib
from xml.dom import minidom
import base64
import hashlib
import random

class WebRoot:
    appPath = ''

    def __init__(self,app_path):
        WebRoot.appPath = app_path

    @cherrypy.expose
    def index(self,status_message='',version=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        html = """

        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
        <html>
          <head>
            <title>Gamez :: Home</title>
            <link rel="stylesheet" type="text/css" href="css/navigation.css" />
            <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.16.custom.css" />
            <link rel="stylesheet" type="text/css" href="css/datatables.css" />
            <link rel="stylesheet" type="text/css" href="css/jquery.ui.override.css" />
            <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
            <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
            <script type="text/javascript" src="js/menu.js"></script>
            <script type="text/javascript" language="javascript" src="/js/jquery.dataTables.min.js"></script>
          </head>
          <body id="dt_example">"""
        if(status_message <> ''):
            html = html + """
                            <div id='_statusbar' class='statusbar statusbarhighlight'>""" + status_message + """</div>"""
        isNewVersionAvailable = CheckForNewVersion(WebRoot.appPath)
        if(isNewVersionAvailable):
            html = html + """
                            <div id='_statusbar' class='statusbar statusbarhighlight'>New Version Available :: <a href="/upgradetolatestversion?verification=SYSTEM_DIRECTED">Upgrade Now</a> | <a href="/ignorecurrentversion?verification=SYSTEM_DIRECTED">Ignore Until Next Version</a></div>
                          """
        html = html + """
            <div id="menu">
                <ul class="menu">
                    <li class="parent">
                        <a href="/">
                            Home
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/settings">
                            Settings
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/log">
                            Log
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/updategamelist">
                            Update Game List
                        </a>
                    </li>
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <button style="margin-top:8px" id="searchButton" class="ui-widget" style="font-size:15px" name="searchButton" type="submit">Search</button> 
                        <script>
                            $("#search").autocomplete(
                                {
                                    source:"/get_game_list/",
                                    minChars: 1,
                                    max:25,
                                    dataType:'json'
                                }
                            );
                            $("button").button().click(function(){
                                var searchText = document.getElementById("search").value;
                                //alert(searchText);
                                document.location.href = "search?term=" + searchText;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="container">"""
        db_result = GetRequestedGames()
        if(db_result == ''):
            html  = html + """No games added. Try searching for some."""
        else:
            html = html + """
                <script>function UpdateGameStatus(status,db_id){var redirectUrl = '/updatestatus?game_id=' + db_id + '&status=' + status;location.href=redirectUrl;}</script>
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Game Name</th>
                    <th>Game Type</th>
                    <th>System</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>"""
            html = html + db_result
            html = html + """
                </tbody>
              </table>
              <script>$(document).ready(function() {
	            oTable = $('#searchresults').dataTable({"bJQueryUI": true,"bSort":false,"bLengthChange":false});});
              </script>
             """
        html = html + """
            </div>
          </body>
        </html>
        

               """
        return html;

    @cherrypy.expose
    def search(self,term=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        html = """

        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
        <html>
          <head>
            <title>Gamez :: Search</title>
            <link rel="stylesheet" type="text/css" href="css/navigation.css" />
            <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.16.custom.css" />
            <link rel="stylesheet" type="text/css" href="css/datatables.css" />
            <link rel="stylesheet" type="text/css" href="css/jquery.ui.override.css" />
            <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
            <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
            <script type="text/javascript" src="js/menu.js"></script>
            <script type="text/javascript" language="javascript" src="/js/jquery.dataTables.min.js"></script>
          </head>
          <body id="dt_example">
            <div id="menu">
                <ul class="menu">
                    <li class="parent">
                        <a href="/">
                            Home
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/settings">
                            Settings
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/log">
                            Log
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/updategamelist">
                            Update Game List
                        </a>
                    </li>
                </ul>
               <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <button style="margin-top:8px" id="searchButton" class="ui-widget" style="font-size:15px" name="searchButton" type="submit">Search</button> 
                        <script>
                            $("#search").autocomplete(
                                {
                                    source:"/get_game_list/",
                                    minChars: 1,
                                    max:25,
                                    dataType:'json'
                                }
                            );
                            $("button").button().click(function(){
                                var searchText = document.getElementById("search").value;
                                //alert(searchText);
                                document.location.href = "search?term=" + searchText;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="container">"""
        db_result = GetGameDataFromTerm(term)
        if(db_result == ''):
            html  = html + """No Results Found. Try Searching Again"""
        else:
            html = html + """
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                  <tr>
                    <th>Download</th>
                    <th>Game Name</th>
                    <th>Game Type</th>
                    <th>System</th>
                  </tr>
                </thead>
                <tbody>"""
            html = html + db_result
            html = html + """
                </tbody>
              </table>
              <script>$(document).ready(function() {
	            oTable = $('#searchresults').dataTable({"bJQueryUI": true,"bSort":false,"bLengthChange":false});});
              </script>
             """
        html = html + """
            </div>
          </body>
        </html>
        

               """
        return html;

    @cherrypy.expose
    def settings(self):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        html = """

        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
        <html>
          <head>
            <title>Gamez :: Settings</title>
            <link rel="stylesheet" type="text/css" href="css/navigation.css" />
            <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.16.custom.css" />
            <link rel="stylesheet" type="text/css" href="css/datatables.css" />
            <link rel="stylesheet" type="text/css" href="css/jquery.ui.override.css" />
            <link rel="stylesheet" type="text/css" href="css/settings.css" />
            <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
            <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
            <script type="text/javascript" src="js/menu.js"></script>
            <script type="text/javascript" language="javascript" src="/js/jquery.dataTables.min.js"></script>
          </head>
          <body id="dt_example">
            <div id="menu">
                <ul class="menu">
                    <li class="parent">
                        <a href="/">
                            Home
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/settings">
                            Settings
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/log">
                            Log
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/updategamelist">
                            Update Game List
                        </a>
                    </li>
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <button style="margin-top:8px" id="searchButton" class="ui-widget" style="font-size:15px" name="searchButton" type="submit">Search</button> 
                        <script>
                            $("#search").autocomplete(
                                {
                                    source:"/get_game_list/",
                                    minChars: 1,
                                    max:25,
                                    dataType:'json'
                                }
                            );
                            $("button").button().click(function(){
                                var searchText = document.getElementById("search").value;
                                document.location.href = "search?term=" + searchText;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="stylized" class="myform">
                <form id="form" name="form" method="get" action="/savesettings">
                <h1>General</h1>

                <label>Gamez Host</label>
                <input type="text" name="cherrypyHost" id="cherrypyHost" value='""" + config.get('global','server.socket_host').replace('"','') +  """' />

                <label>Gamez Port</label>
                <input type="text" name="cherrypyPort" id="cherrypyPort" value='""" + config.get('global','server.socket_port').replace('"','') +  """' />

                <label>Download Interval (In Seconds)</label>
                <input type="text" name="downloadInterval" id="downloadInterval" value='""" + config.get('Scheduler','download_interval').replace('"','') +  """' />

                <label>Gamez API Key</label>
                <input type="text" name="gamezApiKey" id="gamezApiKey" value='""" + config.get('SystemGenerated','api_key').replace('"','') +  """' />

                <h1>SABnzbd+</h1>

                <label>SABnzbd+ Host</label>
                <input type="text" name="sabHost" id="sabHost" value='""" + config.get('Sabnzbd','host').replace('"','') +  """' />

                <label>SABnzbd+ Port</label>
                <input type="text" name="sabPort" id="sabPort" value='""" + config.get('Sabnzbd','port').replace('"','') +  """' />

                <label>SABnzbd+ API Key</label>
                <input type="text" name="sabApi" id="sabApi" value='""" + config.get('Sabnzbd','api_key').replace('"','') +  """' />
                

                <h1>NZB Matrix</h1>

                <label>NZB Matrix API Key</label>
                <input type="text" name="nzbMatrixApi" id="nzbMatrixApi" value='""" + config.get('NZBMatrix','api_key').replace('"','') +  """' />

                <label>NZB Matrix Username</label>
                <input type="text" name="nzbMatrixUsername" id="nzbMatrixUsername" value='""" + config.get('NZBMatrix','username').replace('"','') +  """' />


                <h1>Newznab</h1>

                <label>Newznab Host</label>
                <input type="text" name="newznabHost" id="newznabHost" value='""" + config.get('Newznab','host').replace('"','') +  """' />

                <label>Newznab Port</label>
                <input type="text" name="newznabPort" id="newznabPort" value='""" + config.get('Newznab','port').replace('"','') +  """' />

                <label>Newznab API Key</label>
                <input type="text" name="newznabApi" id="newznabApi" value='""" + config.get('Newznab','api_key').replace('"','') +  """' />

                <label>Newznab Wii Category ID</label>
                <input type="text" name="newznabWiiCat" id="newznabWiiCat" value='""" + config.get('Newznab','wii_category_id').replace('"','') +  """' />

                <label>Newznab Xbox 360 Category ID</label>
                <input type="text" name="newznabXbox360Cat" id="newznabXbox360Cat" value='""" + config.get('Newznab','xbox360_category_id').replace('"','') +  """' />

                <button type="submit">Save Settings</button>
                <div class="spacer"></div>

                
                </form>
            </div>



          </body>
        </html>
        

               """
        return html;

    @cherrypy.expose
    def log(self,status_message='',version=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        html = """

        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
        <html>
          <head>
            <title>Gamez :: Log</title>
            <link rel="stylesheet" type="text/css" href="css/navigation.css" />
            <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.16.custom.css" />
            <link rel="stylesheet" type="text/css" href="css/datatables.css" />
            <link rel="stylesheet" type="text/css" href="css/jquery.ui.override.css" />
            <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
            <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
            <script type="text/javascript" src="js/menu.js"></script>
            <script type="text/javascript" language="javascript" src="/js/jquery.dataTables.min.js"></script>
          </head>
          <body id="dt_example">"""
        html = html + """
            <div id="menu">
                <ul class="menu">
                    <li class="parent">
                        <a href="/">
                            Home
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/settings">
                            Settings
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/log">
                            Log
                        </a>
                    </li>
                    <li class="parent">
                        <a href="/updategamelist">
                            Update Game List
                        </a>
                    </li>
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <button style="margin-top:8px" id="searchButton" class="ui-widget" style="font-size:15px" name="searchButton" type="submit">Search</button> 
                        <script>
                            $("#search").autocomplete(
                                {
                                    source:"/get_game_list/",
                                    minChars: 1,
                                    max:25,
                                    dataType:'json'
                                }
                            );
                            $("button").button().click(function(){
                                var searchText = document.getElementById("search").value;
                                document.location.href = "search?term=" + searchText;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="container">"""
        db_result = GetLog()
        if(db_result == ''):
            html  = html + """No log entries."""
        else:
            html = html + """
                <script>function UpdateGameStatus(status,db_id){var redirectUrl = '/updatestatus?game_id=' + db_id + '&status=' + status;location.href=redirectUrl;}</script>
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                    <th>Message</th>
                    <th>Date / Time</th>
                  </tr>
                </thead>
                <tbody>"""
            html = html + db_result
            html = html + """
                </tbody>
              </table>
              <div style="float:right;"><button name="clearLogBtn" id="clearLogBtn" class="clear-log-button" onclick="location.href='/clearlog'">Clear Log</button></div>
              <script>$(document).ready(function() {
	            oTable = $('#searchresults').dataTable({"bJQueryUI": true,"bSort":false,"bLengthChange":false});});
              </script>
             """
        html = html + """
            </div>
          </body>
        </html>
        

               """
        return html;

    @cherrypy.expose
    def updatestatus(self,game_id='',status=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        if(status <> ''):
            UpdateStatus(game_id,status)
        raise cherrypy.InternalRedirect('/')

    @cherrypy.expose
    def get_game_list(self,term=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        return GetGamesFromTerm(term)

    @cherrypy.expose
    def addgame(self,dbid): 
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        AddGameToDb(dbid,'Wanted')
        raise cherrypy.InternalRedirect('/')

    @cherrypy.expose
    def removegame(self,dbid):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        RemoveGameFromDb(dbid)
        raise cherrypy.InternalRedirect('/')

    @cherrypy.expose
    def ignorecurrentversion(self,verification):
        if(verification == "SYSTEM_DIRECTED"):
            IgnoreVersion(WebRoot.appPath)
        raise cherrypy.InternalRedirect('/') 

    @cherrypy.expose
    def upgradetolatestversion(self,verification):
        if(verification == "SYSTEM_DIRECTED"):
            status = UpdateToLatestVersion(WebRoot.appPath)
            raise cherrypy.InternalRedirect("/?status_message=" + status)

    @cherrypy.expose
    def savesettings(self,cherrypyHost='', nzbMatrixUsername='', downloadInterval=3600, sabPort='', nzbMatrixApi='', sabApi='', cherrypyPort='', sabHost='',gamezApiKey='',newznabHost='',newznabPort='',newznabApi='',newznabWiiCat='',newznabXbox360Cat=''):
        cherrypyHost = '"' + cherrypyHost + '"'
        nzbMatrixUsername = '"' + nzbMatrixUsername + '"'
        nzbMatrixApi = '"' + nzbMatrixApi + '"'
        sabApi = '"' + sabApi + '"'
        sabHost = '"' + sabHost + '"'
        gamezApiKey = '"' + gamezApiKey + '"'
        newznabHost = '"' + newznabHost + '"'
        newznabApi = '"' + newznabApi + '"'
        newznabWiiCat = '"' + newznabWiiCat + '"'
        newznabXbox360Cat = '"' + newznabXbox360Cat + '"'
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        config.set('global','server.socket_host',cherrypyHost)
        config.set('global','server.socket_port',cherrypyPort)
        config.set('NZBMatrix','username',nzbMatrixUsername)
        config.set('NZBMatrix','api_key',nzbMatrixApi)
        config.set('Sabnzbd','host',sabHost)
        config.set('Sabnzbd','port',sabPort)
        config.set('Sabnzbd','api_key',sabApi)
        config.set('Scheduler','download_interval',downloadInterval)
        config.set('SystemGenerated','api_key',gamezApiKey)
        config.set('Newznab','host',newznabHost)
        config.set('Newznab','port',newznabPort)
        config.set('Newznab','wii_category_id',newznabWiiCat)
        config.set('Newznab','xbox360_category_id',newznabXbox360Cat)
        config.set('Newznab','api_key',newznabApi)
        with open(configFilePath,'wb') as configFile:
            config.write(configFile)
        status = "Application Settings Updated Successfully. Gamez is restarting. If after 5 seconds, Gamez isn't working, update the Gamez.ini file and re-launch Gamez"
        raise cherrypy.InternalRedirect("/?status_message=" + status)

    @cherrypy.expose
    def clearlog(self):
        ClearDBLog()
        raise cherrypy.InternalRedirect('/') 

    @cherrypy.expose
    def api(self,api_key='',mode='',term='',system=''):
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        systemApiKey = config.get('SystemGenerated','api_key').replace('"','')
        if(api_key == ''):
            return json.dumps({"Error" : "API Key Required"})
        elif(api_key <> systemApiKey):
            return json.dumps({"Error" : "Invalid API Key"})
        else:
            if(mode == 'search'):
                return ApiGetGamesFromTerm(term,system)
            else:
                response = {"Error" : mode + " Mode Not Implemented"}

            #TODO: Get List of requested games

            #TODO: Add Game to requested list

            #TODO: Remove game from requested list

            #TODO: Update game list from gamezapp.org web service

            return json.dumps(response)
        return json.dumps({"Error" : "Unkown Error"})     

    @cherrypy.expose
    def updategamelist(self):
        AddWiiGamesIfMissing()
        AddXbox360GamesIfMissing()
        status = "Game list has been updated successfully"
        raise cherrypy.InternalRedirect("/?status_message=" + status)