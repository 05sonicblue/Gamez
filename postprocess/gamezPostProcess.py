#!/usr/bin/env python
import sys
import urllib
fields = str(sys.argv[3]).split("-")
gamezID = fields[0].replace("[","").replace("]","").replace(" ","")
status = str(sys.argv[7])
downloadStatus = 'Wanted'
if(status == '0'):
    downloadStatus = 'Downloaded'
url = "http://127.0.0.1:8085/updatestatus?game_id=" + gamezID + "&status=" + downloadStatus
responseObject = urllib.FancyURLopener({}).open(url)
responseObject.read()
responseObject.close()
print("Processing Completed Successfully")