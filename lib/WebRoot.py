import cherrypy
import json
import os
from DBFunctions import GetWiiGamesFromTerm, GetWiiGameDataFromTerm, AddWiiGameToDb, GetRequestedGames, RemoveWiiGameFromDb,UpdateStatus


class WebRoot:
    appPath = ''

    def __init__(self,app_path):
        WebRoot.appPath = app_path

    @cherrypy.expose
    def index(self):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        html = """

        <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
        <html>
          <head>
            <link rel="stylesheet" type="text/css" href="css/navigation.css" />
            <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.16.custom.css" />
            <link rel="stylesheet" type="text/css" href="css/demo_page.css" />
            <link rel="stylesheet" type="text/css" href="css/demo_table.css" />
            <link rel="stylesheet" type="text/css" href="css/jquery.ui.override.css" />
            <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
            <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
            <script type="text/javascript" src="scripts/menu.js"></script>
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
                </ul>
                <div style="text-align:right;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <button style="margin-top:8px" id="searchButton" class="ui-widget" style="font-size:15px" name="searchButton" type="submit">Search</button> 
                        <script>
                            $("#search").autocomplete(
                                {
                                    source:"/get_wii_game_list/",
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
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Game Name</th>
                    <th>Game ID</th>
                    <th>Status</th>
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
            <link rel="stylesheet" type="text/css" href="css/navigation.css" />
            <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.16.custom.css" />
            <link rel="stylesheet" type="text/css" href="css/demo_page.css" />
            <link rel="stylesheet" type="text/css" href="css/demo_table.css" />
            <link rel="stylesheet" type="text/css" href="css/jquery.ui.override.css" />
            <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
            <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
            <script type="text/javascript" src="scripts/menu.js"></script>
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
                </ul>
                <div style="text-align:right;margin-top:5px;margin-right:20px">
                    <div class=ui-widget>
                        <INPUT id=search />
                        &nbsp;
                        <button id="searchButton" class="ui-widget" style="font-size:16px" name="searchButton" type="submit">Search</button> 
                        <script>
                            $("#search").autocomplete(
                                {
                                    source:"/get_wii_game_list/",
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
        db_result = GetWiiGameDataFromTerm(term)
        if(db_result == ''):
            html  = html + """No Results Found. Try Searching Again"""
        else:
            html = html + """
              <table cellpadding="0" cellspacing="0" border="0" class="display" id="searchresults">
                <thead>
                  <tr>
                    <th>Download</th>
                    <th>Game Name</th>
                    <th>Game ID</th>
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
    def updatestatus(self,game_id='',status=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        if(status <> ''):
            UpdateStatus(game_id,status)
        raise cherrypy.InternalRedirect('/')

    @cherrypy.expose
    def get_wii_game_list(self,term=''):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        return GetWiiGamesFromTerm(term)

    @cherrypy.expose
    def addgame(self,dbid):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        AddWiiGameToDb(dbid,'Wanted')
        raise cherrypy.InternalRedirect('/')

    @cherrypy.expose
    def removegame(self,dbid):
        if(os.name <> 'nt'):
            os.chdir(WebRoot.appPath)
        RemoveWiiGameFromDb(dbid)
        raise cherrypy.InternalRedirect('/')
