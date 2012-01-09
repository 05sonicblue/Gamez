import ConfigParser
import os
import prowlpy
from Logger import LogEvent

def HandleNotifications(status,message,appPath):
    config = ConfigParser.RawConfigParser()
    configFilePath = os.path.join(appPath,'Gamez.ini')
    config.read(configFilePath)
    prowlApi = config.get('Notifications','prowl_api').replace('"','')
    if(prowlApi <> ""):
        SendNotificationToProwl(status,message,prowlApi)    
    return
    
def SendNotificationToProwl(status,message,prowlApi):
    prowl = prowlpy.Prowl(prowlApi)
    try:
    	prowl.add('Gamez',status,message,1,None,"http://www.prowlapp.com/")
    	LogEvent("Prowl Notification Sent")
    except Exception,msg:
    	LogEvent("Prowl Notification Error: " + msg)
    return