import cherrypy
import json
from DBFunctions import GetAllWiiGames

class WebRoot:
    @cherrypy.expose
    def index(self):
        return """
                <hmtl>
                    <head>
                        <title>Gamez</title>
                        <link rel="stylesheet" type="text/css" href="css/navigation.css" />
                        <script type="text/javascript" src="scripts/jquery.js"></script>
                        <script type="text/javascript" src="scripts/menu.js"></script>
                    </head>
                    <body>
                        <div id="menu">
                            <ul class="menu">
                                <li class="parent">
                                    <a href="/">
                                        Home
                                    </a>
                                </li>
                                <li class="parent">
                                    <a href="/wii">
                                        Wii (Browse)
                                    </a>
                                </li>
                                <li class="parent">
                                    <a href="/">
                                        Search
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
                    </body>
                </html>
               """

    @cherrypy.expose
    def wii(self):
        return """
                <html>
                    <head>
                        <title>Gamez :: Wii</title>
                        <script src="http://yui.yahooapis.com/3.5.0pr1/build/yui/yui-min.js"></script>
                        <link rel="stylesheet" type="text/css" href="css/navigation.css" />
                        <script type="text/javascript" src="scripts/jquery.js"></script>
                        <script type="text/javascript" src="scripts/menu.js"></script>
                     </head>
                    <body>
                        <div id="menu">
                            <ul class="menu">
                                <li class="parent">
                                    <a href="/">
                                        Home
                                    </a>
                                </li>
                                <li class="parent">
                                    <a href="/wii">
                                        Wii (Browse)
                                    </a>
                                </li>
                                <li class="parent">
                                    <a href="/">
                                        Search
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
                    
                        
                        <center><div id="wiigamestable" class="yui3-skin-sam dt-example"></div></center>
                        <script type="text/javascript">
                        YUI().use("datatable-base", function (Y) {
                            cols = [
                                {key:"db_id", label:"Wii Game DB ID", abbr:"ID"},
                                {key:"nintendo_id", label:"Nintendo Game ID", abbr:"NintendoID"},
                                {key:"game_title", label:"Game Title", abbr:"Title"}
                            ],
                            data = """ + GetAllWiiGames() + """,
                            dataTable = new Y.DataTable.Base({columnset:cols, recordset:data, summary:"Price sheet for inventory parts", caption:"Wii Games"}).render("#wiigamestable");
                        });
                        </script>
                    </body>
                </html>
               """

    @cherrypy.expose
    def wiiapi(self):
        cherrypy.response.headers['Content-Type'] = "application/json"
        response = {"message" : "Response"}
        return json.dumps(response) 

    @cherrypy.expose
    def search(self):
        return GetAllWiiGames()

