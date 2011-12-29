import ConfigParser
import os
import base64
import hashlib
import random

def CheckConfigForAllKeys(app_path):
    changesMade = False
    config = ConfigParser.RawConfigParser()
    configFilePath = os.path.join(app_path,'Gamez.ini')
    config.read(configFilePath)

    if(config.has_section('global') == False):
        config.add_section('global')
        changesMade = True

    if(config.has_section('NZBMatrix') == False):
        config.add_section('NZBMatrix')
        changesMade = True

    if(config.has_section('Sabnzbd') == False):
        config.add_section('Sabnzbd')
        changesMade = True

    if(config.has_section('Scheduler') == False):
        config.add_section('Scheduler')
        changesMade = True

    if(config.has_section('SystemGenerated') == False):
        config.add_section('SystemGenerated')
        changesMade = True

    if(config.has_section('Newznab') == False):
        config.add_section('Newznab')
        changesMade = True
     
    if(config.has_option('global','server.socket_host') == False):
        config.set('global','server.socket_host','"127.0.0.1"')
        changesMade = True

    if(config.has_option('global','server.socket_port') == False):
        config.set('global','server.socket_port','8085')
        changesMade = True

    if(config.has_option('NZBMatrix','username') == False):
        config.set('NZBMatrix','username','""')
        changesMade = True

    if(config.has_option('NZBMatrix','api_key') == False):
        config.set('NZBMatrix','api_key','""')
        changesMade = True

    if(config.has_option('Sabnzbd','api_key') == False):
        config.set('Sabnzbd','api_key','""')
        changesMade = True

    if(config.has_option('Sabnzbd','host') == False):
        config.set('Sabnzbd','host','"127.0.0.1"')
        changesMade = True

    if(config.has_option('Sabnzbd','port') == False):
        config.set('Sabnzbd','port','')
        changesMade = True

    if(config.has_option('Scheduler','download_interval') == False):
        config.set('Scheduler','download_interval','60')
        changesMade = True

    if(config.has_option('SystemGenerated','is_to_ignore_update') == False):
        config.set('SystemGenerated','is_to_ignore_update','0')
        changesMade = True

    if(config.has_option('SystemGenerated','ignored_version') == False):
        config.set('SystemGenerated','ignored_version','""')
        changesMade = True

    if(config.has_option('SystemGenerated','api_key') == False):
        apiKey = base64.b64encode(hashlib.sha256( str(random.getrandbits(256)) ).digest(), random.choice(['rA','aZ','gQ','hH','hG','aR','DD'])).rstrip('==')
        config.set('SystemGenerated','api_key','"' + apiKey + '"')
        changesMade = True

    if(config.has_option('Newznab','api_key') == False):
        config.set('Newznab','api_key','""')
        changesMade = True

    if(config.has_option('Newznab','wii_category_id') == False):
        config.set('Newznab','wii_category_id','"1030"')
        changesMade = True

    if(config.has_option('Newznab','host') == False):
        config.set('Newznab','host','""')
        changesMade = True

    if(config.has_option('Newznab','port') == False):
        config.set('Newznab','port','')
        changesMade = True

    if(changesMade):
        with open(configFilePath,'wb') as configFile:
            config.write(configFile)
