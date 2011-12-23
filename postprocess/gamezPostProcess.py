#!/usr/bin/env python
import sys
fields = str(sys.argv[3]).split("-")
gamezID = fields[0].replace("[","").replace("]","").replace(" ","")
status = str(sys.argv[7])
downloadStatus = 'Wanted'
if(status == '0'):
    downloadStatus = 'Downloaded'
url = "http://localhost:85/updatestatus&game_id=" + gamezID + "&status=" + status
responseObject = urllub.FancyURLopener({}).open(url)
responseObject.read()
responseObject.close()