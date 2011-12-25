#!/usr/bin/env python

import cherrypy
import os
from lib.WebRoot import WebRoot
from lib.WebBrowseWii import WebBrowseWii
import sys
import sched
import time
import threading
import datetime
import lib.GameTasks
import ConfigParser
import cherrypy.process.plugins
from cherrypy.process.plugins import Daemonizer
from lib.ConfigFunctions import CheckConfigForAllKeys
from lib.DBFunctions import ValidateDB
from lib.Logger import LogEvent

app_path = os.path.dirname(os.path.abspath("__FILE__"))
config_path = os.path.join(app_path,'Gamez.ini')

class RunApp():
    def RunWebServer(self,isToDaemonize):
        LogEvent("Generating CherryPy configuration")
        cherrypy.config.update(config_path)
        css_path = os.path.join(app_path,'css')
        images_path = os.path.join(app_path,'images')
        navigation_images_path = os.path.join(css_path,'navigation_images')
        datatables_images_path = os.path.join(css_path,'datatables_images')
        js_path = os.path.join(app_path,'js')
        theme_path = os.path.join(css_path,'redmond')
        theme_images_path = os.path.join(theme_path,'images')
        conf = {
                '/css': {'tools.staticdir.on':True,'tools.staticdir.dir':css_path},
                '/js':{'tools.staticdir.on':True,'tools.staticdir.dir':js_path},
                '/css/redmond':{'tools.staticdir.on':True,'tools.staticdir.dir':theme_path},
                '/css/redmond/images':{'tools.staticdir.on':True,'tools.staticdir.dir':theme_images_path},
                '/css/navigation_images':{'tools.staticdir.on':True,'tools.staticdir.dir':navigation_images_path},
                '/css/datatables_images':{'tools.staticdir.on':True,'tools.staticdir.dir':datatables_images_path}
            }
        daemon = Daemonizer(cherrypy.engine)
        
        if(isToDaemonize == 1):
            LogEvent("Preparing to run in daemon mode")    
            daemon.subscribe()        
        
        LogEvent("Generating Post Process Script")
        GenerateSabPostProcessScript()
        RunGameTask()

        LogEvent("Getting download interval from config file and invoking scheduler")
        config = ConfigParser.RawConfigParser()
        config.read('Gamez.ini')
        interval = config.get('Scheduler','download_interval').replace('"','')
        fInterval = float(interval)
        workerTask = cherrypy.process.plugins.BackgroundTask(fInterval,RunGameTask)
        try:
            workerTask.start()            

            LogEvent("Starting the Gamez web server")
            cherrypy.quickstart(WebRoot(app_path),'/',config=conf)
        except KeyboardInterrupt:
            LogEvent("Shutting down Gamez")
            workerTask.cancel()
            if(isToDaemonize == 1):    
                daemon.unsubscribe()
        
def GenerateSabPostProcessScript():
    config = ConfigParser.RawConfigParser()
    config.read('Gamez.ini')
    gamezWebHost = config.get('global','server.socket_host').replace('"','')
    gamezWebport = config.get('global','server.socket_port').replace('"','')
    gamezBaseUrl = "http://" + gamezWebHost + ":" + gamezWebport + "/"
    postProcessPath = os.path.join(app_path,'postprocess')
    postProcessScript = os.path.join(postProcessPath,'gamezPostProcess.py')
    file = open(postProcessScript,'w')
    file.write('#!/usr/bin/env python')
    file.write("\n")
    file.write('import sys')
    file.write("\n")
    file.write('import urllib')
    file.write("\n")
    file.write('fields = str(sys.argv[3]).split("-")')
    file.write("\n")
    file.write('gamezID = fields[0].replace("[","").replace("]","").replace(" ","")')
    file.write("\n")
    file.write("status = str(sys.argv[7])")
    file.write("\n")
    file.write("downloadStatus = 'Wanted'")
    file.write("\n")
    file.write("if(status == '0'):")
    file.write("\n")
    file.write("    downloadStatus = 'Downloaded'")
    file.write("\n")
    file.write('url = "' + gamezBaseUrl + 'updatestatus?game_id=" + gamezID + "&status=" + downloadStatus')
    file.write("\n")
    file.write('responseObject = urllib.FancyURLopener({}).open(url)')
    file.write("\n")
    file.write('responseObject.read()')
    file.write("\n")
    file.write('responseObject.close()')
    file.write("\n")
    file.write('print("Processing Completed Successfully")')
    file.close

def RunGameTask():
    try:
        config = ConfigParser.RawConfigParser()
        config.read('Gamez.ini')
        nzbMatrixUser = config.get('NZBMatrix','username').replace('"','')
        nzbMatrixApi = config.get('NZBMatrix','api_key').replace('"','')
        sabnzbdHost = config.get('Sabnzbd','host').replace('"','')
        sabnzbdPort = config.get('Sabnzbd','port').replace('"','')
        sabnzbdApi = config.get('Sabnzbd','api_key').replace('"','')
        LogEvent("Searching for games")
        lib.GameTasks.GameTasks().FindGames(nzbMatrixUser,nzbMatrixApi,sabnzbdApi,sabnzbdHost,sabnzbdPort)
    except:
        print(sys.exc_info()[0])

if __name__ == '__main__':
    LogEvent("Checking config file for completeness")
    CheckConfigForAllKeys(app_path)
    LogEvent("Checking to make sure all tables exist in the database")
    ValidateDB()
    isToDaemonize = 0
    params = sys.argv
    for param in params:
        if(param == "-d"):
            isToDaemonize = 1

    RunApp().RunWebServer(isToDaemonize)