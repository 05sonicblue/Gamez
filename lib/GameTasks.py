from DBFunctions import GetRequestedGamesAsArray,UpdateStatus
import sys
import urllib
import urllib2
import os
import shutil
import stat
from subprocess import call
from Logger import LogEvent

class GameTasks():

    def FindGames(self, nzbmatrixusername, nzbmatrixapi,sabnzbdApi,sabnzbdHost,sabnzbdPort,newznabWiiCat,newznabApi,newznabHost,newznabPort,newznabXbox360Cat):
        GameTasks().CheckIfPostProcessExistsInSab(sabnzbdApi,sabnzbdHost,sabnzbdPort)
        nzbmatrixusername = nzbmatrixusername.replace('"','')
        nzbmatrixapi = nzbmatrixapi.replace('"','')
        newznabApi = newznabApi.replace('"','')     
        newznabWiiCat = newznabWiiCat.replace('"','')  
        games = GetRequestedGamesAsArray()
        for game in games:
            try:
                game_name = str(game[0])
                game_id = str(game[1])
                system = str(game[2])
                LogEvent("Searching for game: " + game_name)
                isDownloaded = False

                if(nzbmatrixusername <> '' and nzbmatrixapi <> ''):
                    LogEvent("Checking for game [" + game_name + "] on NZB Matrix")
                    isDownloaded = GameTasks().FindGameOnNZBMatrix(game_name,game_id,nzbmatrixusername,nzbmatrixapi,sabnzbdApi,sabnzbdHost,sabnzbdPort,system)
                
                if(newznabWiiCat <> '' and newznabXbox360Cat <> '' and newznabApi <> '' and newznabHost <> '' and newznabPort <> ''):
                    if(isDownloaded == False):
                        LogEvent("Checking for game [" + game_name + "] on Newznab")
                        isDownloaded = FindGameOnNewznabServer(game_name,game_id,sabnzbdApi,sabnzbdHost,sabnzbdPort,newznabWiiCat,newznabApi,newznabHost,newznabPort,system,newznabXbox360Cat)
            except:
                continue
        return

    def FindGameOnNZBMatrix(self,game_name,game_id,username,api,sabnzbdApi,sabnzbdHost,sabnzbdPort,system):
        if(system == "Wii"):
            catToUse = "44"
        elif(systyem == "Xbox360"):
            catToUse = "14"
        else:
            LogEvent("Unrecognized System")
            return False
        url = "http://api.nzbmatrix.com/v1.1/search.php?search=" + game_name + "&num=1&cat=" + catToUse + "&username=" + username + "&apikey=" + api
        try:
            opener = urllib.FancyURLopener({})
            responseObject = opener.open(url)
            response = responseObject.read()
            responseObject.close()
        except:
            LogEvent("Unable to connect to NZBMatrix Server: " + url)
            return False
        try:
            responseData = response.split("\n")
            fieldData = responseData[0].split(":")
            nzbID = fieldData[1]
            nzbID = nzbID.replace(";","")

            if(nzbID <> "nothing_found"):
                LogEvent("Game found on NZB Matrix")
                nzbUrl = "http://api.nzbmatrix.com/v1.1/download.php?id=" + nzbID
                result = GameTasks().AddNZBToSab(nzbUrl,game_name,sabnzbdApi,sabnzbdHost,sabnzbdPort,game_id)
                if(result):
                    UpdateStatus(game_id,"Snatched")
                    return True
            return False
        except:
            LogEvent("Error getting game [" + game_name + "] from NZB Matrix")
            return False

    def FindGameOnNewznabServer(self,game_name,game_id,sabnzbdApi,sabnzbdHost,sabnzbdPort,newznabWiiCat,newznabApi,newznabHost,newznabPort,system,newznabXbox360Cat):
        if(system == "Wii"):
            catToUse = newznabWiiCat
        elif(system == "Xbox360"):
            catToUse = newznabXbox360Cat
        else:
            LogEvent("Unrecognized System")
            return False
        url = "http://" + newznabHost + ":" + newznabPort + "/api?apikey=" + newznabApi + "&t=search&cat=" + catToUse + "&q=" + game_name + "&o=json"
        try:
            opener = urllib.FancyURLopener({})
            responseObject = opener.open(url)
            response = responseObject.read()
            responseObject.close()
        except:
            LogEvent("Unable to connect to Newznab Server: " + url)
            return False
        try:
            jsonObject = json.loads(response)
            for item in jsonObject:
                nzbID = item["guid"]
                nzbUrl = "http://" + newznabHost + ":" + newznabPort + "/api?apikey=" + newznabApi + "&t=get&id=" + nzbID
                result = GameTasks().AddNZBToSab(nzbUrl,game_name,sabnzbdApi,sabnzbdHost,sabnzbdPort,game_id)
                if(result):
                    UpdateStatus(game_id,"Snatched")
                    return True
            return False
        except:
            LogEvent("Error getting game [" + game_name + "] from Newznab")
            return False

    def AddNZBToSab(self,nzbUrl,game_name,sabnzbdApi,sabnzbdHost,sabnzbdPort,game_id):
        url = "http://" + sabnzbdHost + ":" +  sabnzbdPort + "/sabnzbd/api?mode=addurl&pp=3&apikey=" + sabnzbdApi + "&script=gamezPostProcess.py&name=" + nzbUrl + "&nzbname=[" + game_id + "] - "+ game_name
        try:
            responseObject = urllib.FancyURLopener({}).open(url)
            responseObject.read()
            responseObject.close()
        except:
            LogEvent("Unable to connect to Sanzbd: " + url)
            return False
        LogEvent("NZB added to Sabnzbd")
        return True

    def CheckIfPostProcessExistsInSab(self,sabnzbdApi,sabnzbdHost,sabnzbdPort):
        
        path = os.path.abspath("postprocess")
        srcPath = os.path.join(path,"gamezPostProcess.py")
        url = "http://" + sabnzbdHost + ":" + sabnzbdPort + "/sabnzbd/api?mode=get_config&apikey=" + sabnzbdApi + "&section=misc&keyword=script_dir"
        try:
            opener = urllib.FancyURLopener({})
            responseObject = opener.open(url)
            response = responseObject.read()
            responseObject.close()
            scriptDir = response.split(":")[2].replace("'","").replace(" ","").replace("{","").replace("}","").replace("\n","")
            destPath = os.path.join(scriptDir,"gamezPostProcess.py")
            try:
                LogEvent("Copying post process script to Sabnzbd scripts folder")
                shutil.copyfile(srcPath,destPath)
            except:
                LogEvent("Unable to copy post process script to Sab folder")
                return
            try:
                LogEvent("Setting permissions on post process script")
                cmd = "chmod +x '" + destPath + "'"
                os.system(cmd)
            except:
                LogEvent("Unable to set permissions on post process script")
                return
        except:
            LogEvent("Unable to connect to Sanzbd: " + url)
            return
        return