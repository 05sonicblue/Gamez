import cherrypy
import json
import os
from DBFunctions import GetGamesFromTerm, GetGameDataFromTerm, AddGameToDb, GetRequestedGames, RemoveGameFromDb, UpdateStatus, GetLog, ClearDBLog,AddWiiGamesIfMissing,AddXbox360GamesIfMissing,ApiGetGamesFromTerm,AddComingSoonGames,GetUpcomingGames,AddGameUpcomingToDb,ApiGetRequestedGames
from UpgradeFunctions import CheckForNewVersion,IgnoreVersion,UpdateToLatestVersion
import ConfigParser
from time import sleep
import urllib
from xml.dom import minidom
import base64
import hashlib
import random
from lib.FolderFunctions import *

class WebRoot:
    appPath = ''

    def __init__(self,app_path):
        WebRoot.appPath = app_path

    @cherrypy.expose
    def index(self,status_message='',version='',filter=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        defaultSearch = config.get('SystemGenerated','default_search').replace('"','')
        if(defaultSearch == "Wii"):
            defaultSearch = "<option>---</option><option selected>Wii</option><option>Xbox360</option>"
        elif(defaultSearch == "Xbox360"):
            defaultSearch = "<option>---</option><option>Wii</option><option selected>Xbox360</option>"
        else:
            defaultSearch = "<option selected>---</option><option>Wii</option><option>Xbox360</option>"        
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
                        <ul><li><a href="/?filter=Wanted">Wanted Games</a></li><li><a href="/?filter=Snatched">Snatched Games</a></li><li><a href="/?filter=Downloaded">Downloaded Games</a></li></ul>
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
                    <li class="parent">
                        <a href="/comingsoon">
                            Upcoming Releases
                        </a>
                    </li>
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <select id="systemDropDown">""" + defaultSearch + """</select>
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
                                var system = document.getElementById("systemDropDown").options[document.getElementById("systemDropDown").selectedIndex].value;
                                if(system == "---")
                                {
                                    system = "";	
                                }
                                document.location.href = "search?term=" + searchText + "&system=" + system;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="container">"""
        db_result = GetRequestedGames(filter)
        if(db_result == ''):
            html  = html + """No games to show. Try searching for some."""
        else:
            html = html + """
                <script>function UpdateGameStatus(status,db_id){var redirectUrl = '/updatestatus?game_id=' + db_id + '&status=' + status;location.href=redirectUrl;}</script>
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                  <tr>
                    <th>Actions</th>
		    <th>Cover</th>
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
    def search(self,term='',system=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        defaultSearch = config.get('SystemGenerated','default_search').replace('"','')
        if(defaultSearch == "Wii"):
            defaultSearch = "<option>---</option><option selected>Wii</option><option>Xbox360</option>"
        elif(defaultSearch == "Xbox360"):
            defaultSearch = "<option>---</option><option>Wii</option><option selected>Xbox360</option>"
        else:
            defaultSearch = "<option selected>---</option><option>Wii</option><option>Xbox360</option>"              
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
                    <li class="parent">
                        <a href="/comingsoon">
                            Upcoming Releases
                        </a>
                    </li>                    
                </ul>
               <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <select id="systemDropDown">""" + defaultSearch + """</select>
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
                                var system = document.getElementById("systemDropDown").options[document.getElementById("systemDropDown").selectedIndex].value;
				if(system == "---")
				{
				    system = "";	
				}
                                document.location.href = "search?term=" + searchText + "&system=" + system;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="container">"""
        db_result = GetGameDataFromTerm(term,system)
        if(db_result == ''):
            html  = html + """No Results Found. Try Searching Again"""
        else:
            html = html + """
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                  <tr>
                    <th>Download</th>
                    <th>Cover</th>
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
        sabChecked = config.get('SystemGenerated','sabnzbd_enabled').replace('"','')
        nzbmatrixChecked = config.get('SystemGenerated','nzbmatrix_enabled').replace('"','')
        newznabChecked = config.get('SystemGenerated','newznab_enabled').replace('"','')
        growlChecked = config.get('SystemGenerated','growl_enabled').replace('"','')
        prowlChecked = config.get('SystemGenerated','prowl_enabled').replace('"','')
        notifoChecked = config.get('SystemGenerated','notifo_enabled').replace('"','')
        nzbBlackholeChecked = config.get('SystemGenerated','blackhole_nzb_enabled').replace('"','')
        torrentBlackholeChecked = config.get('SystemGenerated','blackhole_torrent_enabled').replace('"','')
        katChecked = config.get('SystemGenerated','torrent_kat_enabled').replace('"','')
        
        sabDownloadProcessChecked = config.get('SystemGenerated','process_sabnzbd_download_folder_enabled').replace('"','')
        nzbDownloadProcessChecked = config.get('SystemGenerated','process_nzb_download_folder_enabled').replace('"','')
        torrentDownloadProcessChecked = config.get('SystemGenerated','process_torrent_download_folder_enabled').replace('"','')
        downloadProcessWiiChecked = config.get('SystemGenerated','process_download_folder_wii_enabled').replace('"','')
        downloadProcessXbox360Checked = config.get('SystemGenerated','process_download_folder_xbox360_enabled').replace('"','')
        
        defaultSearch = config.get('SystemGenerated','default_search').replace('"','')
        if(sabChecked == "1"):
            sabChecked = "CHECKED"
        else:
            sabChecked = ""
        if(nzbmatrixChecked == "1"):
            nzbmatrixChecked = "CHECKED"
        else:
            nzbmatrixChecked = ""
        if(newznabChecked == "1"):
            newznabChecked = "CHECKED"
        else:
            newznabChecked = ""       
        if(growlChecked == "1"):
            growlChecked = "CHECKED"
        else:
            growlChecked = ""       
        if(prowlChecked == "1"):
            prowlChecked = "CHECKED"
        else:
            prowlChecked = ""       
        if(notifoChecked == "1"):
            notifoChecked = "CHECKED"
        else:
            notifoChecked = ""    
        if(nzbBlackholeChecked == "1"):
            nzbBlackholeChecked = "CHECKED"
        else:
            nzbBlackholeChecked = ""             
        if(torrentBlackholeChecked == "1"):
            torrentBlackholeChecked = "CHECKED"
        else:
            torrentBlackholeChecked = ""             
        if(katChecked == "1"):
            katChecked = "CHECKED"
        else:
            katChecked = ""          

        if(sabDownloadProcessChecked == "1"):
            sabDownloadProcessChecked = "CHECKED"
        else:
            sabDownloadProcessChecked = ""  
        if(nzbDownloadProcessChecked == "1"):
            nzbDownloadProcessChecked = "CHECKED"
        else:
            nzbDownloadProcessChecked = ""  
        if(torrentDownloadProcessChecked == "1"):
            torrentDownloadProcessChecked = "CHECKED"
        else:
            torrentDownloadProcessChecked = ""  
        if(downloadProcessWiiChecked == "1"):
            downloadProcessWiiChecked = "CHECKED"
        else:
            downloadProcessWiiChecked = ""  
        if(downloadProcessXbox360Checked == "1"):
            downloadProcessXbox360Checked = "CHECKED"
        else:
            downloadProcessXbox360Checked = ""              
        if(defaultSearch == "Wii"):
            defaultSearch = "<option>---</option><option selected>Wii</option><option>Xbox360</option>"
        elif(defaultSearch == "Xbox360"):
            defaultSearch = "<option>---</option><option>Wii</option><option selected>Xbox360</option>"
        else:
            defaultSearch = "<option selected>---</option><option>Wii</option><option>Xbox360</option>"
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
                    <li class="parent">
                        <a href="/comingsoon">
                            Upcoming Releases
                        </a>
                    </li>                    
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <select id="systemDropDown">""" + defaultSearch + """</select>
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
                            $("#searchButton").button().click(function(){
                            	var searchText = document.getElementById("search").value;
                                var system = document.getElementById("systemDropDown").options[document.getElementById("systemDropDown").selectedIndex].value;
				if(system == "---")
				{
				    system = "";	
				}
                                document.location.href = "search?term=" + searchText + "&system=" + system;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="tabs">
		<ul>
			<li><a href="#gamez-tab">Gamez</a></li>
			<li><a href="#downloaders-tab">Downloaders</a></li>
			<li><a href="#searchproviders-tab">Search Providers</a></li>
			<li><a href="#notifications-tab">Notifications</a></li>
			<li><a href="#folders-tab">Folders</a></li>
		</ul>
		<form id="form" name="form" method="get" action="/savesettings">
		<div id="gamez-tab">
			<p>
				<table cellpadding="5">
					<tr>
						<td>
							<label><b>Gamez Host</b></label>
							<br />
							<input style="width:250px" type="text" name="cherrypyHost" id="cherrypyHost" value='""" + config.get('global','server.socket_host').replace('"','') +  """' />

						</td>
						
						<td>
							<label><b>Gamez Port</b></label>
							<br />
                					<input style="width:250px" type="text" name="cherrypyPort" id="cherrypyPort" value='""" + config.get('global','server.socket_port').replace('"','') +  """' />
						</td>
						<td>
							<label><b>Gamez Username</b></label>
							<br />
							<input style="width:250px" type="text" name="gamezUsername" id="gamezUsername" value='""" + config.get('global','user_name').replace('"','') +  """' />
						</td>

						<td>
							<label><b>Gamez Password</b></label>
							<br />
							<input style="width:250px" type="text" name="gamezPassword" id="gamezPassword" value='""" + config.get('global','password').replace('"','') +  """' />
						</td>
					</tr>
					<tr><td colspan="4"></td></tr>
					<tr>
						<td>
							<label><b>Download Interval</b></label>
							<br />
							<label><b>(In Seconds)</b></label>
							<br />
                					<input style="width:250px" type="text" name="downloadInterval" id="downloadInterval" value='""" + config.get('Scheduler','download_interval').replace('"','') +  """' />
						</td>
						<td>
							<label><b>Game List Update Interval</b></label>
							<br />
							<label><b>(In Seconds)</b></label>
							<br />
							<input style="width:250px" type="text" name="gameListUpdateInterval" id="gameListUpdateInterval" value='""" + config.get('Scheduler','game_list_update_interval').replace('"','') +  """' />
						</td>
						<td colspan="2">
							<br />
							<label><b>Gamez API Key</b></label>
							<br />
							<input style="width:520px" type="text" name="gamezApiKey" id="gamezApiKey" value='""" + config.get('SystemGenerated','api_key').replace('"','') +  """' />

						</td>
					</tr>
					<tr><td colspan="4"></td></tr>
					<tr>
						<td>
							<label><b>Default System for Search</b></label>
							<br />
							<select name="defaultSearch" id="defaultSearch" style="width:200px">""" + defaultSearch + """</select>
						</td>
					</tr>
				</table>
			</p>
			
		</div>
		<div id="downloaders-tab">
			<p>
				<table cellpadding="5" width="100%">
					<tr width="100%">
						<td  style="border:solid 1px" width="45%" valign="top">
							<label style="float:left"><b><u>Sabnzbd+</u></b></label>
							<div style="float:right">
							<input type="checkbox" name="sabnzbdEnabled" id="sabnzbdEnabled" value="sabnzbdEnabled" """ + sabChecked + """ />Enabled
							</div>
							<br />
							<table>
								<tr>
									<td>
										<label><b>SABnzbd+ Host</b></label>
										<br />
										<input style="width:200px" type="text" name="sabHost" id="sabHost" value='""" + config.get('Sabnzbd','host').replace('"','') +  """' />
									</td>
									<td>
										<label><b>SABnzbd+ Port</b></label>
										<br />
										<input style="width:200px" type="text" name="sabPort" id="sabPort" value='""" + config.get('Sabnzbd','port').replace('"','') +  """' />
									</td>
									<td>
										<label><b>SABnzbd+ Download Category</b></label>
										<br />
										<input style="width:225px" type="text" name="sabCategory" id="sabCategory" value='""" + config.get('Sabnzbd','category').replace('"','') +  """' />
									</td>
								</tr>
								<tr><td>&nbsp;</td></tr>
								<tr>
									<td colspan="3">
										<label><b>SABnzbd+ API Key</b></label>
										<br />
										<input style="width:400px" type="text" name="sabApi" id="sabApi" value='""" + config.get('Sabnzbd','api_key').replace('"','') +  """' />
									</td>
								</tr>
							</table>
						</td>
						<td width="10px">&nbsp;</td>
						<td style="border:solid 1px" valign="top">
							<legend><b><u>Blackhole</u></b></legend>
							<br />
							<label style="float:left"><b><u>NZB's</u></b></label>
							<div style="float:right">
								<input type="checkbox" name="nzbBlackholeEnabled" id="nzbBlackholeEnabled" value="nzbBlackholeEnabled" """ + nzbBlackholeChecked + """ />Enabled
							</div>
							<br />
							<table>
								<tr>
									<td>
										<label><b>NZB Blackhole Path</b></label>
										<br />
										<input style="width:400px" type="text" name="nzbBlackholePath" id="nzbBlackholePath" value='""" + config.get('Blackhole','nzb_blackhole_path').replace('"','') +  """' />
									</td>
								</tr>							
							</table>	
							<br />
							<label style="float:left"><b><u>BitTorrent</u></b></label>
								<div style="float:right">
									<input type="checkbox" name="torrentBlackholeEnabled" id="torrentBlackholeEnabled" value="torrentBlackholeEnabled" """ + torrentBlackholeChecked + """ />Enabled
								</div>
								<br />
								<table>
									<tr>
										<td>
											<label><b>BitTorrent Blackhole Path</b></label>
											<br />
											<input style="width:400px" type="text" name="torrentBlackholePath" id="torrentBlackholePath" value='""" + config.get('Blackhole','torrent_blackhole_path').replace('"','') +  """' />
										</td>
									</tr>							
							</table>	
						</td>						
					</tr>
				</table>
			</p>
		</div>
		<div id="searchproviders-tab">
			<p>
				<table cellpadding="5" width="100%">
					<tr width="100%">
						<td  style="border:solid 1px" width="45%" valign="top">
							<label style="float:left"><b><u>NZB Matrix</u></b></label>
								<div style="float:right">
									<input type="checkbox" name="nzbmatrixEnabled" id="nzbmatrixEnabled" value="nzbmatrixEnabled" """ + nzbmatrixChecked + """ />Enabled
								</div>
							<br />
							<table>
								<tr>
									<td>
										<label><b>NZB Matrix API Key</b></label>
										<br />
										<input style="width:400px" type="text" name="nzbMatrixApi" id="nzbMatrixApi" value='""" + config.get('NZBMatrix','api_key').replace('"','') +  """' />
									</td>
								</tr>
								<tr><td>&nbsp;</td></tr>
								<tr>
									<td>
										<label><b>NZB Matrix Username</b></label>
										<br />
										<input style="width:225px" type="text" name="nzbMatrixUsername" id="nzbMatrixUsername" value='""" + config.get('NZBMatrix','username').replace('"','') +  """' />
									</td>
								</tr>
							</table>
						</td>
						<td width="10px">&nbsp;</td>
						<td style="border:solid 1px" valign="top" rowspan="3">
							<label style="float:left"><b><u>Newznab</u></b></label>
								<div style="float:right">
									<input type="checkbox" name="newznabEnabled" id="newznabEnabled" value="newznabEnabled" """ + newznabChecked + """ />Enabled
								</div>
							<br />
							<table>
								<tr>
									<td>
										<label><b>Newznab Host</b></label>
										<br />
										<input style="width:225px" type="text" name="newznabHost" id="newznabHost" value='""" + config.get('Newznab','host').replace('"','') +  """' />
									</td>
									<td>
										<label><b>Newznab Port</b></label>
										<br />
										<input style="width:225px" type="text" name="newznabPort" id="newznabPort" value='""" + config.get('Newznab','port').replace('"','') +  """' />
									</td>
								</tr>
								<tr><td>&nbsp;</td></tr>
								<tr>
									<td>
										<label><b>Newznab Wii Category ID</b></label>
										<br />
										<input style="width:225px" type="text" name="newznabWiiCat" id="newznabWiiCat" value='""" + config.get('Newznab','wii_category_id').replace('"','') +  """' />
									</td>
									<td>
										<label><b>Newznab Xbox 360 Category ID</b></label>
										<br />
										<input style="width:225px" type="text" name="newznabXbox360Cat" id="newznabXbox360Cat" value='""" + config.get('Newznab','xbox360_category_id').replace('"','') +  """' />
									</td>
								</tr>
								<tr><td>&nbsp;</td></tr>
								<tr>
									<td colspan="2">
										<label><b>Newznab API Key</b></label>
										<br />
										<input style="width:400px" type="text" name="newznabApi" id="newznabApi" value='""" + config.get('Newznab','api_key').replace('"','') +  """' />
									</td>
								</tr>							
							</table>	
						</td>						
					</tr>
					<tr><td>&nbsp;</td></tr>
					<tr>
						<td  style="border:solid 1px" width="45%" valign="top">
							<label style="float:left"><b><u>BitTorrent</u></b></label>
							<br />
							<br />
							<input type="checkbox" name="katEnabled" id="katEnabled" value="katEnabled" """ + katChecked + """ />&nbsp;<b>KickAss Torrents</b>
						</td>
					</tr>
				</table>
			</p>
		</div>
		<div id="notifications-tab">
			<p>
				<table cellpadding="5" width="100%">
					<tr width="100%">
						<td  style="border:solid 1px" width="45%" valign="top">
							<label style="float:left"><b><u>Growl</u></b></label>
								<div style="float:right">
									<input type="checkbox" name="growlEnabled" id="growlEnabled" value="growlEnabled" """ + growlChecked + """ />Enabled
								</div>
							<br />	
							<table>
								<tr>
									<td>
										<label><b>Growl Host</b></label>
										<br />
										<input type="text" name="growlHost" id="growlHost" value='""" + config.get('Notifications','growl_host').replace('"','') +  """' />
									</td>
									<td>
										<label><b>Growl Port</b></label>
										<br />
										<input type="text" name="growlPort" id="growlPort" value='""" + config.get('Notifications','growl_port').replace('"','') +  """' />
									</td>
									<td>
										<label><b>Growl Password</b></label>
										<br />
										<input type="text" name="growlPassword" id="growlPassword" value='""" + config.get('Notifications','growl_password').replace('"','') +  """' />
									</td>
								</tr>
							</table>
						</td>
						<td width="10px">&nbsp;</td>
						<td style="border:solid 1px" valign="top">
							<label style="float:left"><b><u>Prowl</u></b></label>
								<div style="float:right">
									<input type="checkbox" name="prowlEnabled" id="prowlEnabled" value="prowlEnabled" """ + prowlChecked + """ />Enabled
								</div>
							<br />
							<table>
								<tr>
									<td>
										<label><b>Prowl API Key</b></label>
										<br />
										<input style="width:400px" type="text" name="prowlApi" id="prowlApi" value='""" + config.get('Notifications','prowl_api').replace('"','') +  """' />
									</td>
								</tr>							
							</table>	
						</td>						
					</tr>
					<tr><td>&nbsp;</td></tr>
					<tr width="100%">
						<td  style="border:solid 1px" width="45%" valign="top">
							<label style="float:left"><b><u>Notifo</u></b></label>
								<div style="float:right">
									<input type="checkbox" name="notifoEnabled" id="notifoEnabled" value="notifoEnabled" """ + notifoChecked + """ />Enabled
								</div>
							<br />	
							<table>
								<tr>
									<td>
										<label><b>Notifo Username</b></label>
										<br />
										<input type="text" name="notifoUsername" id="notifoUsername" value='""" + config.get('Notifications','notifo_username').replace('"','') +  """' />
									</td>
									<td>
										<label><b>Notifo API Key</b></label>
										<br />
										<input style="width:400px" type="text" name="notifoApi" id="notifoApi" value='""" + config.get('Notifications','notifo_apikey').replace('"','') +  """' />
									</td>
								</tr>
							</table>
						</td>
						<td width="10px">&nbsp;</td>						
					</tr>
				</table>
			</p>
		</div>	
		<div id="folders-tab">
			<p>
				NOTE: This page isn't implemented yet. The layout is merely here to implement in a future release
				<table cellpadding="5" width="100%">
					<tr width="100%">
						<td  style="border:solid 1px" width="45%" valign="top">
							<br />
							<input type="checkbox" name="processSabDirectoryEnabled" id="processSabDirectoryEnabled" value="processSabDirectoryEnabled" """ + sabDownloadProcessChecked + """ />
							<b>Post Process Sabnzbd Download Directory</b>
							<br /><br />
							<input type="checkbox" name="processTorrentsDirectoryEnabled" id="processTorrentsDirectoryEnabled" value="processTorrentsDirectoryEnabled" """ + torrentDownloadProcessChecked + """ />
							<b>Post Process Blackhole Torrents Directory</b>
							<br /><br />
							<input type="checkbox" name="processNzbsDirectoryEnabled" id="processNzbsDirectoryEnabled" value="processNzbsDirectoryEnabled" """ + nzbDownloadProcessChecked + """ />
							<b>Post Process Blackhole NZB's Directory</b>
							<br /><br />
							<input type="checkbox" name="processWiiEnabled" id="processWiiEnabled" value="processWiiEnabled" """ + downloadProcessWiiChecked + """ />
							<b>Post Process Wii Games</b>
							<br /><br />
							<input type="checkbox" name="processXbox360Enabled" id="processXbox360Enabled" value="processXbox360Enabled" """ + downloadProcessXbox360Checked + """ />
							<b>Post Process XBOX 360 Games</b>
						</td>
						<td width="10px">&nbsp;</td>
						<td style="border:solid 1px" valign="top">
							<legend><b><u>Folders</u></b></legend>
							<br />
							<table>
								<tr>
									<td>
										<label><b>Blackhole Torrent Download Directory</b></label>
										<br />
										<input style="width:400px" type="text" name="torrentBlackholeDownloadDirectory" id="torrentBlackholeDownloadDirectory" value='""" + config.get('Folders','torrent_completed').replace('"','').replace("\\\\","\\") +  """' />
									</td>
								</tr>	
								<tr>
									<td>
										<label><b>Blackhole NZB's Download Directory</b></label>
										<br />
										<input style="width:400px" type="text" name="nzbBlackholeDownloadDirectory" id="nzbBlackholeDownloadDirectory" value='""" + config.get('Folders','nzb_completed').replace('"','').replace("\\\\","\\") +  """' />
									</td>
								</tr>
								<tr>
									<td>
										<label><b>Sabnzbd Download Directory</b></label>
										<br />
										<input style="width:400px" type="text" name="sabDownloadDirectory" id="sabDownloadDirectory" value='""" + config.get('Folders','sabnzbd_completed').replace('"','').replace("\\\\","\\") +  """' />
									</td>
								</tr>
								<tr>
									<td>
										<label><b>Wii Destination Directory</b></label>
										<br />
										<input style="width:400px" type="text" name="wiiDestination" id="wiiDestination" value='""" + config.get('Folders','wii_destination').replace('"','').replace("\\\\","\\") +  """' />
									</td>
								</tr>	
								<tr>
									<td>
										<label><b>XBOX 360 Destination Directory</b></label>
										<br />
										<input style="width:400px" type="text" name="xbox360Destination" id="xbox360Destination" value='""" + config.get('Folders','xbox360_destination').replace('"','').replace("\\\\","\\") +  """' />
									</td>
								</tr>								
							</table>	
						</td>						
					</tr>
				</table>
			</p>
		</div>
		</div>
		<script>
			$(function(){$("#tabs").tabs();});
		</script>
                
		<br /><br />
		<div align="right" style="margin-right:20px">
			<button style="border:0; margin:0; padding:0;clear:both;margin-left:250px;width:125px;height:31px;background:#666666 url(img/button.png) no-repeat;text-align:center;line-height:31px;color:#FFFFFF;font-size:11px;font-weight:bold;" type="submit">Save Settings</button>
		</div>	
		</form>
                
                




          </body>
        </html>
        

               """
        return html;

    @cherrypy.expose
    def log(self,status_message='',version=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        defaultSearch = config.get('SystemGenerated','default_search').replace('"','')
        if(defaultSearch == "Wii"):
            defaultSearch = "<option>---</option><option selected>Wii</option><option>Xbox360</option>"
        elif(defaultSearch == "Xbox360"):
            defaultSearch = "<option>---</option><option>Wii</option><option selected>Xbox360</option>"
        else:
            defaultSearch = "<option selected>---</option><option>Wii</option><option>Xbox360</option>"              
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
                    <li class="parent">
                        <a href="/comingsoon">
                            Upcoming Releases
                        </a>
                    </li>                    
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <select id="systemDropDown">""" + defaultSearch + """</select>
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
                                var system = document.getElementById("systemDropDown").options[document.getElementById("systemDropDown").selectedIndex].value;
				if(system == "---")
				{
				    system = "";	
				}
                                document.location.href = "search?term=" + searchText + "&system=" + system;
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
	            oTable = $('#searchresults').dataTable({"bJQueryUI": true,"bSort":false,"bLengthChange":false,"iDisplayLength":25});});
              </script>
             """
        html = html + """
            </div>
          </body>
        </html>
        

               """
        return html;

    @cherrypy.expose
    def comingsoon(self):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        defaultSearch = config.get('SystemGenerated','default_search').replace('"','')
        if(defaultSearch == "Wii"):
            defaultSearch = "<option>---</option><option selected>Wii</option><option>Xbox360</option>"
        elif(defaultSearch == "Xbox360"):
            defaultSearch = "<option>---</option><option>Wii</option><option selected>Xbox360</option>"
        else:
            defaultSearch = "<option selected>---</option><option>Wii</option><option>Xbox360</option>"              
        html = """

        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
        <html>
          <head>
            <title>Gamez :: Upcoming Releases</title>
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
                    <li class="parent">
                        <a href="/comingsoon">
                            Upcoming Releases
                        </a>
                    </li>                    
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <select id="systemDropDown">""" + defaultSearch + """</select>
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
                                var system = document.getElementById("systemDropDown").options[document.getElementById("systemDropDown").selectedIndex].value;
				if(system == "---")
				{
				    system = "";	
				}
                                document.location.href = "search?term=" + searchText + "&system=" + system;
                            });
                        </script>
                    </div>
                </div>
            </div>
            <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
            <div id="container">"""
        db_result = GetUpcomingGames()
        if(db_result == ''):
            html  = html + """No Upcoming Games."""
        else:
            html = html + """
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                    <th>Download</th>
                    <th>Game Name</th>
                    <th>Release Date</th>
                    <th>System</th>
                  </tr>
                </thead>
                <tbody>"""
            html = html + db_result
            html = html + """
                </tbody>
              </table>
              <script>$(document).ready(function() {
	            oTable = $('#searchresults').dataTable({"bJQueryUI": true,"bSort":false,"bLengthChange":false,"iDisplayLength":25});});
              </script>
             """
        html = html + """
            </div>
          </body>
        </html>
        

               """
        return html;

    @cherrypy.expose
    def updatestatus(self,game_id='',status='',filePath=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        if(status <> ''):
            UpdateStatus(game_id,status)
        if(status == 'Downloaded'):
            ProcessDownloaded(game_id,status,filePath)
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
    def addgameupcoming(self,dbid): 
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        AddGameUpcomingToDb(dbid,'Wanted')
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
    def savesettings(self,cherrypyHost='', nzbMatrixUsername='', downloadInterval=3600, sabPort='', nzbMatrixApi='', sabApi='', cherrypyPort='', sabHost='',gamezApiKey='',newznabHost='',newznabPort='',newznabApi='',newznabWiiCat='',newznabXbox360Cat='',prowlApi='',gamezUsername='',gamezPassword='',gameListUpdateInterval='',sabCategory='',growlHost='',growlPort='',growlPassword='',sabnzbdEnabled='',nzbmatrixEnabled='',newznabEnabled='',growlEnabled='',prowlEnabled='',notifoEnabled='',notifoUsername='',notifoApi='',nzbBlackholeEnabled='',nzbBlackholePath='',torrentBlackholeEnabled='',torrentBlackholePath='',katEnabled='',defaultSearch='',wiiDestination='', xbox360Destination='', nzbBlackholeDownloadDirectory='', torrentBlackholeDownloadDirectory='', processTorrentsDirectoryEnabled='', sabDownloadDirectory='', processXbox360Enabled='', processWiiEnabled='', processNzbsDirectoryEnabled='', processSabDirectoryEnabled=''):
        cherrypyHost = '"' + cherrypyHost + '"'
        nzbMatrixUsername = '"' + nzbMatrixUsername + '"'
        nzbMatrixApi = '"' + nzbMatrixApi + '"'
        sabApi = '"' + sabApi + '"'
        sabHost = '"' + sabHost + '"'
        sabCategory = '"' + sabCategory + '"'
        gamezApiKey = '"' + gamezApiKey + '"'
        newznabHost = '"' + newznabHost + '"'
        newznabApi = '"' + newznabApi + '"'
        newznabWiiCat = '"' + newznabWiiCat + '"'
        newznabXbox360Cat = '"' + newznabXbox360Cat + '"'
        prowlApi = '"' + prowlApi + '"'
        gamezUsername = '"' + gamezUsername + '"'
        gamezPassword = '"' + gamezPassword + '"'
        growlHost = '"' + growlHost + '"'
        growlPassword = '"' + growlPassword + '"'
        notifoUsername = '"' + notifoUsername + '"'
        notifoApi = '"' + notifoApi + '"'
        nzbBlackholePath = '"' + nzbBlackholePath + '"'
        torrentBlackholePath = '"' + torrentBlackholePath + '"'
        wiiDestination = '"' + wiiDestination.replace("\\","\\\\") + '"'
        xbox360Destination = '"' + xbox360Destination.replace("\\","\\\\") + '"'
        nzbBlackholeDownloadDirectory = '"' + nzbBlackholeDownloadDirectory.replace("\\","\\\\") + '"'
        torrentBlackholeDownloadDirectory = '"' + torrentBlackholeDownloadDirectory.replace("\\","\\\\") + '"'
        sabDownloadDirectory = '"' + sabDownloadDirectory.replace("\\","\\\\") + '"'
        defaultSearch = '"' + defaultSearch + '"'
        if(sabnzbdEnabled == 'sabnzbdEnabled'):
            sabnzbdEnabled = "1"
        else:
            sabnzbdEnabled = "0"
        if(nzbmatrixEnabled == 'nzbmatrixEnabled'):
            nzbmatrixEnabled = "1"
        else:
            nzbmatrixEnabled = "0"
        if(newznabEnabled == 'newznabEnabled'):
            newznabEnabled = "1"
        else:
            newznabEnabled = "0"        
        if(growlEnabled == 'growlEnabled'):
            growlEnabled = "1"
        else:
            growlEnabled = "0" 
        if(prowlEnabled == 'prowlEnabled'):
            prowlEnabled = "1"
        else:
            prowlEnabled = "0"       
        if(notifoEnabled == 'notifoEnabled'):
            notifoEnabled = "1"
        else:
            notifoEnabled = "0"     
        if(nzbBlackholeEnabled == 'nzbBlackholeEnabled'):
            nzbBlackholeEnabled = "1"
        else:
            nzbBlackholeEnabled = "0"    
        if(torrentBlackholeEnabled == 'torrentBlackholeEnabled'):
            torrentBlackholeEnabled = "1"
        else:
            torrentBlackholeEnabled = "0"  
        if(katEnabled == 'katEnabled'):
            katEnabled = "1"
        else:
            katEnabled = "0"  
        if(processTorrentsDirectoryEnabled == 'processTorrentsDirectoryEnabled'):
            processTorrentsDirectoryEnabled = "1"
        else:
            processTorrentsDirectoryEnabled = "0"   
        if(processNzbsDirectoryEnabled == 'processNzbsDirectoryEnabled'):
            processNzbsDirectoryEnabled = "1"
        else:
            processNzbsDirectoryEnabled = "0"   
        if(processSabDirectoryEnabled == 'processSabDirectoryEnabled'):
            processSabDirectoryEnabled = "1"
        else:
            processSabDirectoryEnabled = "0"   
        if(processXbox360Enabled == 'processXbox360Enabled'):
            processXbox360Enabled = "1"
        else:
            processXbox360Enabled = "0"               
        if(processWiiEnabled == 'processWiiEnabled'):
            processWiiEnabled = "1"
        else:
            processWiiEnabled = "0"               
        config = ConfigParser.RawConfigParser()
        configFilePath = os.path.join(WebRoot.appPath,'Gamez.ini')
        config.read(configFilePath)
        config.set('global','server.socket_host',cherrypyHost)
        config.set('global','server.socket_port',cherrypyPort)
        config.set('global','user_name',gamezUsername)
        config.set('global','password',gamezPassword)
        config.set('NZBMatrix','username',nzbMatrixUsername)
        config.set('NZBMatrix','api_key',nzbMatrixApi)
        config.set('Sabnzbd','host',sabHost)
        config.set('Sabnzbd','port',sabPort)
        config.set('Sabnzbd','api_key',sabApi)
        config.set('Sabnzbd','category',sabCategory)
        config.set('Scheduler','download_interval',downloadInterval)
        config.set('Scheduler','game_list_update_interval',gameListUpdateInterval)
        config.set('SystemGenerated','api_key',gamezApiKey)
        config.set('SystemGenerated','sabnzbd_enabled',sabnzbdEnabled)
        config.set('SystemGenerated','nzbmatrix_enabled',nzbmatrixEnabled)
        config.set('SystemGenerated','newznab_enabled',newznabEnabled)  
        config.set('SystemGenerated','growl_enabled',growlEnabled)
        config.set('SystemGenerated','prowl_enabled',prowlEnabled)
        config.set('SystemGenerated','notifo_enabled',notifoEnabled)
        config.set('SystemGenerated','blackhole_nzb_enabled',nzbBlackholeEnabled)
        config.set('SystemGenerated','blackhole_torrent_enabled',torrentBlackholeEnabled)
        config.set('SystemGenerated','torrent_kat_enabled',katEnabled)
        config.set('SystemGenerated','default_search',defaultSearch)
        config.set('SystemGenerated','process_torrent_download_folder_enabled',processTorrentsDirectoryEnabled)
        config.set('SystemGenerated','nzb_completed',processNzbsDirectoryEnabled)
        config.set('SystemGenerated','process_sabnzbd_download_folder_enabled',processSabDirectoryEnabled)
        config.set('SystemGenerated','process_download_folder_xbox360_enabled',processXbox360Enabled)
        config.set('SystemGenerated','process_download_folder_wii_enabled',processWiiEnabled)
        config.set('Newznab','host',newznabHost)
        config.set('Newznab','port',newznabPort)
        config.set('Newznab','wii_category_id',newznabWiiCat)
        config.set('Newznab','xbox360_category_id',newznabXbox360Cat)
        config.set('Newznab','api_key',newznabApi)
        config.set('Notifications','prowl_api',prowlApi)
        config.set('Notifications','growl_host',growlHost)
        config.set('Notifications','growl_port',growlPort)
        config.set('Notifications','growl_password',growlPassword)
        config.set('Notifications','notifo_username',notifoUsername)
        config.set('Notifications','notifo_apikey',notifoApi)
        config.set('Blackhole','nzb_blackhole_path',nzbBlackholePath)
        config.set('Blackhole','torrent_blackhole_path',torrentBlackholePath)	
        config.set('Folders','torrent_completed',torrentBlackholeDownloadDirectory)	
        config.set('Folders','nzb_completed',nzbBlackholeDownloadDirectory)
        config.set('Folders','sabnzbd_completed',sabDownloadDirectory)
        config.set('Folders','xbox360_destination',xbox360Destination)
        config.set('Folders','wii_destination',wiiDestination)
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
            if(mode == 'SEARCH'):
                return ApiGetGamesFromTerm(term,system)
            elif(mode == 'UPDATEGAMELIST'):
            	try:
            	    AddWiiGamesIfMissing()
                    AddXbox360GamesIfMissing()
                    AddComingSoonGames()
                    return json.dumps({"Response":"Game list has been updated successfully"})
            	except:
            	    return json.dumps({"Error" : "Error Updating Game List"})
            elif(mode == 'GETREQUESTED'):
            	return ApiGetRequestedGames()
            elif(mode == 'ADDREQUESTED'):
            	response = {"Error" : mode + " Mode Not Implemented"}
            elif(mode == 'DELETEREQUESTED'):
            	response = {"Error" : mode + " Mode Not Implemented"}   
            elif(mode == 'UPDATEREQUESTEDSTATUS'):
            	response = {"Error" : mode + " Mode Not Implemented"}
            elif(mode == 'SEARCHUPCOMING'):
            	response = {"Error" : mode + " Mode Not Implemented"}     
            elif(mode == 'ADDUPCOMINGTOREQUESTED'):
            	response = {"Error" : mode + " Mode Not Implemented"}             	
            else:
                response = {"Error" : mode + " Mode Not Implemented"}
            return json.dumps(response)
        return json.dumps({"Error" : "Unkown Error"})     

    @cherrypy.expose
    def updategamelist(self):
        AddWiiGamesIfMissing()
        AddXbox360GamesIfMissing()
        AddComingSoonGames()
        status = "Game list has been updated successfully"
        raise cherrypy.InternalRedirect("/?status_message=" + status)
