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

    if(config.has_section('Blackhole') == False):
        config.add_section('Blackhole')
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
     
    if(config.has_section('Notifications') == False):
        config.add_section('Notifications')
        changesMade = True
     
    if(config.has_option('global','server.socket_host') == False):
        config.set('global','server.socket_host','"127.0.0.1"')
        changesMade = True

    if(config.has_option('global','server.socket_port') == False):
        config.set('global','server.socket_port','8085')
        changesMade = True

    if(config.has_option('global','user_name') == False):
        config.set('global','user_name','""')
        changesMade = True
        
    if(config.has_option('global','password') == False):
        config.set('global','password','""')
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

    if(config.has_option('Sabnzbd','category') == False):
        config.set('Sabnzbd','category','')
        changesMade = True

    if(config.has_option('Scheduler','download_interval') == False):
        config.set('Scheduler','download_interval','60')
        changesMade = True
        
    if(config.has_option('Scheduler','game_list_update_interval') == False):
        config.set('Scheduler','game_list_update_interval','86400')
        changesMade = True

    if(config.has_option('SystemGenerated','is_to_ignore_update') == False):
        config.set('SystemGenerated','is_to_ignore_update','0')
        changesMade = True

    if(config.has_option('SystemGenerated','ignored_version') == False):
        config.set('SystemGenerated','ignored_version','""')
        changesMade = True

    if(config.has_option('SystemGenerated','sabnzbd_enabled') == False):
        config.set('SystemGenerated','sabnzbd_enabled','0')
        changesMade = True
        
    if(config.has_option('SystemGenerated','nzbmatrix_enabled') == False):
        config.set('SystemGenerated','nzbmatrix_enabled','0')
        changesMade = True
        
    if(config.has_option('SystemGenerated','newznab_enabled') == False):
        config.set('SystemGenerated','newznab_enabled','0')
        changesMade = True        

    if(config.has_option('SystemGenerated','prowl_enabled') == False):
        config.set('SystemGenerated','prowl_enabled','0')
        changesMade = True   
        
    if(config.has_option('SystemGenerated','growl_enabled') == False):
        config.set('SystemGenerated','growl_enabled','0')
        changesMade = True   
        
    if(config.has_option('SystemGenerated','notifo_enabled') == False):
        config.set('SystemGenerated','notifo_enabled','0')
        changesMade = True   
        
    if(config.has_option('SystemGenerated','blackhole_nzb_enabled') == False):
        config.set('SystemGenerated','blackhole_nzb_enabled','0')
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

    if(config.has_option('Newznab','xbox360_category_id') == False):
        config.set('Newznab','xbox360_category_id','"1050"')
        changesMade = True

    if(config.has_option('Newznab','host') == False):
        config.set('Newznab','host','""')
        changesMade = True

    if(config.has_option('Newznab','port') == False):
        config.set('Newznab','port','')
        changesMade = True

    if(config.has_option('Notifications','prowl_api') == False):
	config.set('Notifications','prowl_api','""')
	changesMade = True

    if(config.has_option('Notifications','growl_host') == False):
	config.set('Notifications','growl_host','""')
	changesMade = True

    if(config.has_option('Notifications','growl_port') == False):
	config.set('Notifications','growl_port','23053')
	changesMade = True
	
    if(config.has_option('Notifications','growl_password') == False):
	config.set('Notifications','growl_password','""')
	changesMade = True	
	
    if(config.has_option('Notifications','notifo_username') == False):
	config.set('Notifications','notifo_username','""')
	changesMade = True	
	
    if(config.has_option('Notifications','notifo_apikey') == False):
	config.set('Notifications','notifo_apikey','""')
	changesMade = True
	
    if(config.has_option('Blackhole','nzb_blackhole_path') == False):
	config.set('Blackhole','nzb_blackhole_path','""')
	changesMade = True	

    if(config.has_option('Blackhole','torrent_blackhole_path') == False):
	config.set('Blackhole','torrent_blackhole_path','""')
	changesMade = True	
	
    if(changesMade):
        with open(configFilePath,'wb') as configFile:
            config.write(configFile)
