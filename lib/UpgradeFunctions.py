import urllib
import json
from distutils.version import LooseVersion
from Constants import VersionNumber
import ConfigParser
import os
import urllib2
import tarfile
import shutil

def CheckForNewVersion(app_path):
    newVersionAvailable = False
    currentVersion = VersionNumber()
    mostRecentVersion = GetLatestVersion()
    config = ConfigParser.RawConfigParser()
    config.read(os.path.join(app_path,'Gamez.ini'))
    isToDeferUpgrade = config.get('SystemGenerated','is_to_ignore_update').replace('"','')
    ignoredVersion = config.get('SystemGenerated','ignored_version').replace('"','')
    if(LooseVersion(mostRecentVersion) > LooseVersion(currentVersion)):
        if(isToDeferUpgrade == '0'):
            newVersionAvailable = True
    if(isToDeferUpgrade == '1'):
        if(LooseVersion(mostRecentVersion) > LooseVersion(ignoredVersion)):
            newVersionAvailable = True
    return newVersionAvailable

def GetLatestVersion():
    mostRecentVersion = '0.0.0.0'
    url = 'https://api.github.com/repos/mdlesk/Gamez/tags'
    opener = urllib.FancyURLopener({})
    responseObject = opener.open(url)
    response = responseObject.read()
    responseObject.close()
    jsonObject = json.loads(response)
    for val in jsonObject:
        name = val['name']
        tagVersion = name.replace("v","").replace("'","")
        tagVersion = str(tagVersion)
        try:
            if(LooseVersion(tagVersion) > LooseVersion(mostRecentVersion)):
                mostRecentVersion = tagVersion
        except:
            continue
    return mostRecentVersion

def IgnoreVersion(app_path):
    versionToIgnore = GetLatestVersion()
    config = ConfigParser.RawConfigParser()
    configFilePath = os.path.join(app_path,'Gamez.ini')
    config.read(configFilePath)
    if(config.has_section('SystemGenerated') == False):
        config.add_section('SystemGenerated')
    config.set('SystemGenerated','is_to_ignore_update','1')
    config.set('SystemGenerated','ignored_version','"versionToIgnore"')
    with open(configFilePath,'wb') as configFile:
        config.write(configFile)

def UpdateToLatestVersion(app_path):
    filesToIgnore = ["Gamez.ini","Gamez.db"]
    filesToIgnoreSet     = set(filesToIgnore)
    updatePath = os.path.join(app_path,"update")
    if not os.path.exists(updatePath):     
        os.makedirs(updatePath)
    latestVersion = GetLatestVersion()
    tagUrl = "https://github.com/mdlesk/Gamez/tarball/v" + latestVersion
    data = urllib2.urlopen(tagUrl)
    downloadPath = os.path.join(app_path,data.geturl().split('/')[-1])
    downloadedFile = open(downloadPath,'wb')
    downloadedFile.write(data.read())
    downloadedFile.close()
    tarredFile = tarfile.open(downloadPath)
    tarredFile.extractall(updatePath)
    tarredFile.close()
    os.remove(downloadPath)
    contentsDir = [x for x in os.listdir(updatePath) if os.path.isdir(os.path.join(updatePath, x))]
    updatedFilesPath = os.path.join(updatePath,contentsDir[0])
    for dirname, dirnames, filenames in os.walk(updatedFilesPath):
        dirname = dirname[len(updatedFilesPath)+1:]
        for file in filenames:
            src = os.path.join(updatedFilesPath,dirname,file)
            dest = os.path.join(app_path,dirname,file)
            if((file in filesToIgnoreSet) == True):
                continue
            if(os.path.isfile(dest)):
                os.remove(dest)
            os.renames(src,dest)
    shutil.rmtree(updatePath) 
    config = ConfigParser.RawConfigParser()
    configFilePath = os.path.join(app_path,'Gamez.ini')
    config.read(configFilePath)
    if(config.has_section('SystemGenerated') == False):
        config.add_section('SystemGenerated')
    config.set('SystemGenerated','is_to_ignore_update','0')
    config.set('SystemGenerated','ignored_version','"versionToIgnore"')
    with open(configFilePath,'wb') as configFile:
        config.write(configFile)
    return "Successfully Upgraded to Version " + latestVersion