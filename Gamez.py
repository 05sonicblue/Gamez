#!/usr/bin/env python

import cherrypy
import os
from lib.WebRoot import WebRoot
from lib.WebBrowseWii import WebBrowseWii
from lib.Daemonize import Daemon
import sys
import sched
import time
import threading
import lib.scheduler
import datetime
import lib.GameTasks
import ConfigParser
import cherrypy.process.plugins
from cherrypy.process.plugins import Daemonizer

app_path = os.path.dirname(os.path.abspath("__FILE__"))
config_path = os.path.join(app_path,'Gamez.ini')

class RunApp():
    def RunWebServer(self,isToDaemonize):
        cherrypy.config.update(config_path)
        css_path = os.path.join(app_path,'css')
        images_path = os.path.join(app_path,'images')
        css_images_path = os.path.join(css_path,'images')
        scripts_path = os.path.join(app_path,'scripts')
        js_path = os.path.join(app_path,'js')
        theme_path = os.path.join(css_path,'redmond')
        theme_images_path = os.path.join(theme_path,'images')
        grid_theme_path = os.path.join(css_path,'grid')
        grid_theme_images_path = os.path.join(grid_theme_path,'images')
        conf = {
                '/css': {'tools.staticdir.on':True,'tools.staticdir.dir':css_path},
                '/images': {'tools.staticdir.on':True,'tools.staticdir.dir':images_path},
                '/scripts':{'tools.staticdir.on':True,'tools.staticdir.dir':scripts_path},
                '/js':{'tools.staticdir.on':True,'tools.staticdir.dir':js_path},
                '/css/images':{'tools.staticdir.on':True,'tools.staticdir.dir':css_images_path},
                '/css/redmond':{'tools.staticdir.on':True,'tools.staticdir.dir':theme_path},
                '/css/redmond/images':{'tools.staticdir.on':True,'tools.staticdir.dir':theme_images_path},
                '/css/grid':{'tools.staticdir.on':True,'tools.staticdir.dir':grid_theme_images_path},
                '/css/grid/images':{'tools.staticdir.on':True,'tools.staticdir.dir':grid_theme_images_path}
            }
        daemon = Daemonizer(cherrypy.engine)
        
        if(isToDaemonize == 1):    
            daemon.subscribe()        
        
        GenerateSabPostProcessScript()
        RunGameTask()
        config = ConfigParser.RawConfigParser()
        config.read('Gamez.ini')
        interval = config.get('Scheduler','download_interval').replace('"','')
        fInterval = float(interval)
        workerTask = cherrypy.process.plugins.BackgroundTask(fInterval,RunGameTask)
        try:
            workerTask.start()            
            cherrypy.quickstart(WebRoot(app_path),'/',config=conf)
        except KeyboardInterrupt:
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
    config = ConfigParser.RawConfigParser()
    config.read('Gamez.ini')
    nzbMatrixUser = config.get('NZBMatrix','username').replace('"','')
    nzbMatrixApi = config.get('NZBMatrix','api_key').replace('"','')
    sabnzbdHost = config.get('Sabnzbd','host').replace('"','')
    sabnzbdPort = config.get('Sabnzbd','port').replace('"','')
    sabnzbdApi = config.get('Sabnzbd','api_key').replace('"','')
    lib.GameTasks.GameTasks().FindGames(nzbMatrixUser,nzbMatrixApi,sabnzbdApi,sabnzbdHost,sabnzbdPort)

if __name__ == '__main__':
    isToDaemonize = 0
    params = sys.argv
    for param in params:
        if(param == "-d"):
            isToDaemonize = 1

    RunApp().RunWebServer(isToDaemonize)