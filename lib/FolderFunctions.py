from Logger import *
import os
from DBFunctions import *
import shutil
import ConfigParser

def ProcessDownloaded(game_id,status,filePath):
    game_name = GetRequestedGameName(game_id)
    system = GetRequestedGameSystem(game_id)
    confFile = os.path.join(os.path.dirname(os.path.abspath("__FILE__")),'Gamez.ini')
    config = ConfigParser.RawConfigParser()
    config.read(confFile)
    destPath = ""
    if(system == "Wii"):
        if(config.get('SystemGenerated','process_download_folder_wii_enabled').replace('"','') == "0"):
            LogEvent("Skipping Post Processing because settings is to not post process Wii downloads")
            return
        destPath = config.get('Folders','wii_destination').replace('"','')
    elif(system == "Xbox360"):
        if(config.get('SystemGenerated','process_download_folder_xbox360_enabled').replace('"','') == "0"):
            LogEvent("Skipping Post Processing because settings is to not post process Xbox360 downloads")
            return
        destPath = config.get('Folders','xbox360_destination').replace('"','')
    for subdir,dirs,files in os.walk(filePath):
        for file in files:
            LogEvent(file)
            if ".iso" in file or ".img" in file:
                src = filePath + os.sep + file
                LogEvent("Game Image Found: " + src)
                try:
                    if(destPath <> ""):
                        LogEvent("Renaming and Moving Game")
                        if(destPath.endswith(os.sep) == False):
                            destPath = destPath + os.sep
                        extension = os.path.splitext(file)[1]
                        newFileName = game_name + extension
                        dest = destPath + os.sep + newFileName
                        LogEvent("Moving File")
                        shutil.move(src,dest)
                        LogEvent(game_name + " Processed Successfully")
                    else:
                        LogEvent("Destination Folder Not Set")
                except:
                    LogEvent("Unable to rename and move game: " + src + ". Please process manually")
    return

def ScanFoldersToProcess():
    confFile = os.path.join(os.path.dirname(os.path.abspath("__FILE__")),'Gamez.ini')
    config = ConfigParser.RawConfigParser()
    config.read(confFile)
    processSabFolder = config.get('SystemGenerated','process_sabnzbd_download_folder_enabled').replace('"','')
    processNzbFolder = config.get('SystemGenerated','process_nzb_download_folder_enabled').replace('"','')
    processTorrentFolder = config.get('SystemGenerated','process_torrent_download_folder_enabled').replace('"','')
    sabFolder = config.get('Folders','sabnzbd_completed').replace('"','').replace("\\\\","\\")
    nzbFolder = config.get('Folders','nzb_completed').replace('"','').replace("\\\\","\\")
    torrentFolder = config.get('Folders','torrent_completed').replace('"','').replace("\\\\","\\")
    if(processSabFolder == "1"):
        ProcessFolder(sabFolder)
    if(processNzbFolder == "1"):
        ProcessFolder(nzbFolder)
    if(processTorrentFolder == "1"):
        ProcessFolder(torrentFolder)
    return

def ProcessFolder(folderPath):
    confFile = os.path.join(os.path.dirname(os.path.abspath("__FILE__")),'Gamez.ini')
    config = ConfigParser.RawConfigParser()
    config.read(confFile)
    for subdir,dirs,files in os.walk(folderPath):
        for file in files:
            moveFile = False
            if ".iso" in file or ".img" in file:
                LogEvent("Image Found: " + file + ". Trying to match to a valid requested game")
                processFile = False
                game_name = ""
                system = ""
                for record in GetRequestedGamesForFolderProcessing():
                    game_name = record[0]
                    system = record[1]
                    LogEvent("Trying to match on Game Name: " + game_name)
                    allPartsMatched = True
                    for gameNamePart in game_name.split(" "):
                        if gameNamePart.upper() not in subdir.upper() and gameNamePart.upper() not in file.upper():
                            allPartsMatched = False
                    if(allPartsMatched):
                        processFile = True
                        break
                if(processFile):
                    if(CheckForSameGame(game_name)):
                        processForWii = False
                        processForXbox360 = False
                        if("WII" in subdir.upper() or "WII" in file.upper()):
                            processForWii = True
                        if("XBOX360" in subdir.upper() or "XBOX360" in file.upper() or "360" in subdir.upper() or "360" in file.upper()):
                            processForXbox360 = True
                        if(processForWii):
                            system = "Wii"
                            moveFile = True
                        elif(processForXbox360):
                            system = "Xbox360"
                            moveFile = True
                        else:
                            LogEvent("Same game name found for multiple systems and unable to parse system from file name. Skipping Image File")
                    else:
                        moveFile = True
                else:
                    LogEvent("No Match Found. Skipping Image File")
                if(moveFile):
                    LogEvent("Match Found. Renaming and Moving [" + system + "] Game")
                    destPath = ""
                    if(system == "Wii"):
                        if(config.get('SystemGenerated','process_download_folder_wii_enabled').replace('"','') == "0"):
                            LogEvent("Skipping Post Processing because settings is to not post process Wii downloads")
                            return
                        destPath = config.get('Folders','wii_destination').replace('"','').replace("\\\\","\\")
                    elif(system == "Xbox360"):
                        if(config.get('SystemGenerated','process_download_folder_xbox360_enabled').replace('"','') == "0"):
                            LogEvent("Skipping Post Processing because settings is to not post process Xbox360 downloads")
                            return
                        destPath = config.get('Folders','xbox360_destination').replace('"','').replace("\\\\","\\")
                    #Copy File
                    if(destPath <> ""):
                        if(destPath.endswith(os.sep) == False):
                            destPath = destPath + os.sep
                        extension = os.path.splitext(file)[1]
                        newFileName = game_name + extension
                        dest = destPath + os.sep + newFileName
                        src = subdir + os.sep + file
                        LogEvent("Moving File " + src + " to " + dest)
                        try:
                            shutil.move(src,dest)
                            #Update status to wanted
                            if(game_name <> "" and system <> ""):
                                UpdateStatusForFolderProcessing(game_name,system,'Downloaded')
                        except:
                            LogEvent("Error Moving File")
                        LogEvent(game_name + " Processed Successfully")
                    else:
                        LogEvent("Destination Folder Not Set")
    return