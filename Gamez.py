#!/usr/bin/env python

import cherrypy
import os
from lib.WebRoot import WebRoot
import sys
import sched
import time
import threading
import thread
import datetime
import lib.GameTasks
import ConfigParser
import cherrypy.process.plugins
from cherrypy.process.plugins import Daemonizer
from lib.ConfigFunctions import CheckConfigForAllKeys
from lib.DBFunctions import ValidateDB,AddWiiGamesIfMissing,AddXbox360GamesIfMissing,AddComingSoonGames
from lib.Logger import LogEvent
import cherrypy.lib.auth_basic

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
        config = ConfigParser.RawConfigParser()
	config.read('Gamez.ini')
        username = config.get('global','user_name').replace('"','')
        password = config.get('global','password').replace('"','')
        useAuth = False
        if(username <> "" or password <> ""):
            useAuth = True          	
        userPassDict = {username:password}  
        checkpassword = cherrypy.lib.auth_basic.checkpassword_dict(userPassDict)
        conf = {
        	'/':{'tools.auth_basic.on':useAuth,'tools.auth_basic.realm':'Gamez','tools.auth_basic.checkpassword':checkpassword},
                '/css': {'tools.staticdir.on':True,'tools.staticdir.dir':css_path},
                '/js':{'tools.staticdir.on':True,'tools.staticdir.dir':js_path},
                '/css/redmond':{'tools.staticdir.on':True,'tools.staticdir.dir':theme_path},
                '/css/redmond/images':{'tools.staticdir.on':True,'tools.staticdir.dir':theme_images_path},
                '/css/navigation_images':{'tools.staticdir.on':True,'tools.staticdir.dir':navigation_images_path},
                '/css/datatables_images':{'tools.staticdir.on':True,'tools.staticdir.dir':datatables_images_path},
            }
        
        if(isToDaemonize == 1):
            LogEvent("Preparing to run in daemon mode")  
            daemon = Daemonizer(cherrypy.engine)
            daemon.subscribe()        
        isSabEnabled = config.get('SystemGenerated','sabnzbd_enabled').replace('"','')
        if(isSabEnabled == "1"):
            LogEvent("Generating Post Process Script")
            GenerateSabPostProcessScript()
        RunGameTask()

        LogEvent("Getting download interval from config file and invoking scheduler")
        config = ConfigParser.RawConfigParser()
        config.read('Gamez.ini')
        interval = config.get('Scheduler','download_interval').replace('"','')
        updateGameListInterval = config.get('Scheduler','game_list_update_interval').replace('"','')
        fInterval = float(interval)
        fUpdateGameListInterval = float(updateGameListInterval)
	#thread.start_new_thread(ScheduleGameTasks,(fInterval,))
        #workerTask = cherrypy.process.plugins.BackgroundTask(fInterval,RunGameTask)
        #gameListUpdaterWorkTask = cherrypy.process.plugins.BackgroundTask(fUpdateGameListInterval,RunGameListUpdaterTask)
        try:
            LogEvent("Setting up download scheduler")
            gameTasksScheduler = cherrypy.process.plugins.Monitor(cherrypy.engine,RunGameTask,fInterval)
	    gameTasksScheduler.subscribe()
	    LogEvent("Setting up game list update scheduler")
	    gameListUpdaterScheduler = cherrypy.process.plugins.Monitor(cherrypy.engine,RunGameListUpdaterTask,fUpdateGameListInterval)
	    gameListUpdaterScheduler.subscribe()
            LogEvent("Starting the Gamez web server")
            cherrypy.quickstart(WebRoot(app_path),'/',config=conf)
        except KeyboardInterrupt:
            LogEvent("Shutting down Gamez")
            if(isToDaemonize == 1):    
                daemon.unsubscribe()
            sys.exit()
        
def GenerateSabPostProcessScript():
    config = ConfigParser.RawConfigParser()
    config.read(os.path.join(app_path,'Gamez.ini'))
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
        sabnzbdCategory = config.get('Sabnzbd','category').replace('"','')
        newznabWiiCat = config.get('Newznab','wii_category_id').replace('"','')
        newznabXbox360Cat = config.get('Newznab','xbox360_category_id').replace('"','')
        newznabApi = config.get('Newznab','api_key').replace('"','')
        newznabHost = config.get('Newznab','host').replace('"','')
        newznabPort = config.get('Newznab','port').replace('"','')
        isSabEnabled = config.get('SystemGenerated','sabnzbd_enabled').replace('"','')
        isNzbMatrixEnabled = config.get('SystemGenerated','nzbmatrix_enabled').replace('"','')
        isNewznabEnabled = config.get('SystemGenerated','newznab_enabled').replace('"','')
        isNzbBlackholeEnabled = config.get('SystemGenerated','blackhole_nzb_enabled').replace('"','')
        nzbBlackholePath = config.get('Blackhole','nzb_blackhole_path').replace('"','')
        LogEvent("Searching for games")
        lib.GameTasks.GameTasks().FindGames(nzbMatrixUser,nzbMatrixApi,sabnzbdApi,sabnzbdHost,sabnzbdPort,newznabWiiCat,newznabApi,newznabHost,newznabPort,newznabXbox360Cat,sabnzbdCategory,isSabEnabled,isNzbMatrixEnabled,isNewznabEnabled,isNzbBlackholeEnabled,nzbBlackholePath)
    except:
        errorMessage = "Major error occured when running scheduled tasks"
        for message in sys.exc_info():
            errorMessage = errorMessage + " - " + str(message)
        LogEvent(errorMessage)

def RunGameListUpdaterTask():
    try:
        LogEvent("Updating Game Lists")
        AddWiiGamesIfMissing()
        LogEvent("Wii Game List Updated")
        AddXbox360GamesIfMissing()
        LogEvent("XBOX 360 Game List Updated")
        AddComingSoonGames
        LogEvent("Coming Soon Game List Updated")
    except:
        errorMessage = "Major error occured when running Update Game List scheduled tasks"
        for message in sys.exc_info():
            errorMessage = errorMessage + " - " + str(message)
        LogEvent(errorMessage)

if __name__ == '__main__':
    app_path = sys.path[0]
    ValidateDB()
    LogEvent("Checking config file for completeness")
    CheckConfigForAllKeys(app_path)
    isToDaemonize = 0
    params = sys.argv
    for param in params:
        if(param == "-d"):
            isToDaemonize = 1

    RunApp().RunWebServer(isToDaemonize)