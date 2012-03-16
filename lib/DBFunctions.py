import os
import sqlite3
import sys
import datetime
from Logger import LogEvent
import urllib
import json
import Notifications

def GetGamesFromTerm(term):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT GAME_NAME,SYSTEM FROM GAMES where game_name like '%" + term.replace("'","''") + "%' ORDER BY GAME_NAME ASC"
    data = ""
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            game_name = str(record[0])
            system = str(record[1])
            rowdata = '{"value":"' + game_name + '"},'
            data = data + rowdata
        except:
            continue
    cursor.close()
    data = data[:-1]
    data = "[" + data + "]"
    return data

def GetGameDataFromTerm(term,system):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT game_name,game_type,id,system,cover FROM games where game_name like '%" + term.replace("'","''") + "%' AND system like '%" + system + "%' order by game_name asc"
    data = ''
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            game_name = str(record[0])
            game_type = str(record[1])
            db_id = str(record[2])
            system = str(record[3])
            cover = str(record[4])
            rowdata = "<tr align='center'><td><a href='addgame?dbid=" + db_id + "'>Download</a></td><td><img width='85' height='120'  src='" + cover + "' /></td><td>" + game_name + "</td><td>" + game_type + "</td><td>" + system + "</td></tr>"
            data = data + rowdata
        except:
            continue
    cursor.close()
    return data

def AddGameToDb(db_id,status):
    LogEvent("Adding game in 'Wanted' status")
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "select game_name,system,game_type,cover from games where ID = '" + db_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()[0]
    game_name = str(result[0])
    system = str(result[1])
    game_type = str(result[2])
    cover = str(result[3])
    cursor.close()
    sql = "insert into requested_games(GAME_NAME,SYSTEM,GAME_TYPE,status,cover) values('" + game_name.replace("'","''") + "','" + system + "','" + game_type + "','" + status + "','" + cover + "')"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def AddGameUpcomingToDb(db_id,status):
    LogEvent("Adding game in 'Wanted' status")
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "select GameTitle,system from comingsoon where ID = '" + db_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()[0]
    game_name = str(result[0])
    system = str(result[1])
    game_type = "Game"
    cover = "/css/navigation_images/no-cover.jpg"
    cursor.close()
    sql = "insert into requested_games(GAME_NAME,SYSTEM,GAME_TYPE,status,cover) values('" + game_name.replace("'","''") + "','" + system + "','" + game_type + "','" + status + "','" + cover + "')"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return    
    comingsoon

def GetRequestedGames(filter=''):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    if(filter <> ''):
        sql = "SELECT id,game_name,game_type,status,system,cover FROM requested_games Where status='" + filter + "' order by game_name asc"
    else:        
    	sql = "SELECT id,game_name,game_type,status,system,cover FROM requested_games order by game_name asc"
    data = ''
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            db_id = str(record[0])
            game_name = str(record[1])
            game_type = str(record[2])
            status = str(record[3])
            system = str(record[4])
            cover = str(record[5])
            rowdata = "<tr align='center'><td><a href='removegame?dbid=" + db_id + "'>Delete</a>&nbsp;|&nbsp;<a href='forcesearch?dbid=" + db_id + "'>Force Search</a></td><td><center><img width='85' height='120'  src='" + cover + "' /></center></td><td>" + game_name + "</td><td>" + game_type + "</td><td>" + system + "</td><td>" + status + "</td><td><select id=updateSatusSelectObject class=ui-widget onchange=UpdateGameStatus(this.options[this.selectedIndex].value,'" + db_id + "')>"
            if(status == "Snatched"):
                rowdata = rowdata + "<option>Downloaded</option><option selected=true>Snatched</option><option>Wanted</option>"
            elif(status == "Downloaded"):
                rowdata = rowdata + "<option selected=true>Downloaded</option><option>Snatched</option><option>Wanted</option>"
            elif(status == "Wanted"):
                   rowdata = rowdata + "<option>Downloaded</option><option>Snatched</option><option selected=true>Wanted</option>"
            rowdata = rowdata + "</select></td></tr>"
            data = data + rowdata
        except:
            continue
    cursor.close()
    return data

def RemoveGameFromDb(db_id):
    LogEvent("Removing game")
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "delete from requested_games where ID='" + db_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def GetRequestedGamesAsArray(manualSearchGame):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    if(manualSearchGame <> ''):
        sql = "SELECT game_name,ID,system FROM requested_games WHERE id='" + manualSearchGame + "' order by game_name asc"
    else:
        sql = "SELECT game_name,ID,system FROM requested_games WHERE status='Wanted' order by game_name asc"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    cursor.close()
    return result

def UpdateStatus(game_id,status):
    LogEvent("Update status of game to " + status)
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    game_name = ""
    system = ""
    sql = "select game_name,system from requested_games where ID='" + game_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    tables = list()
    for record in result:
        game_name = str(record[0])
        system = str(record[1])
    cursor.close()    
    sql = "update requested_games set status='" + status + "' where game_name = '" + game_name.replace("'","''") + "' and system = '" + system + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    message = "Gamez Notification: " + system + " Game: " + game_name + " has been " + status
    appPath = os.path.abspath("")
    Notifications.HandleNotifications(status,message,appPath)
    return

def ValidateDB():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "select name from sqlite_master where type='table'"
    logTableExists = False
    oldWiiGamesTableExists = False
    comingSoonTableExists = False
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    tables = list()
    for record in result:
        tableName = str(record[0])
        if(tableName == 'gamez_log'):
            logTableExists = True
        elif(tableName == 'wii_games'):
            oldWiiGamesTableExists = True
        elif(tableName == 'comingsoon'):
            comingSoonTableExists = True
    cursor.close()
    if(logTableExists == False):
        sql = "create table gamez_log(ID INTEGER NOT NULL PRIMARY KEY UNIQUE,message TEXT(255) NOT NULL,created_date DATE)"
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()
        cursor.close()
    sql = "PRAGMA table_info(requested_games);"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    isRequestedGamesOldFormat = False
    for record in result:
        if(str(record[1]) == "WiiGameID"):
            isRequestedGamesOldFormat = True
    cursor.close()
    if(isRequestedGamesOldFormat):
        sql = "select wii_games.game_name,requested_games.status from requested_games inner join wii_games on requested_games.WiiGameID = wii_games.ID"
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        cursor.execute(sql)
        result = cursor.fetchall()
        cursor.close()
        sql = "drop table requested_games"
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()
        cursor.close()
        sql = "CREATE TABLE REQUESTED_GAMES (ID INTEGER PRIMARY KEY,GAME_NAME TEXT,SYSTEM TEXT,GAME_TYPE TEXT,STATUS TEXT,COVER TEXT)"
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()
        cursor.close()
        for record in result:
            game_name = str(record[0])
            status = str(record[1])
            sql = "insert into requested_games (game_name,game_type,system,status) values ('" + game_name.replace("'","''") + "','Game','Wii','" + status + "')"
            connection = sqlite3.connect(db_path)
            cursor = connection.cursor()
            cursor.execute(sql)
            connection.commit()
            cursor.close()
    
    if(oldWiiGamesTableExists):
        print "Upgrading database. This may take a few moments"
        sql = "drop table wii_games"
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()
        cursor.close()
        sql = "CREATE TABLE GAMES (ID INTEGER PRIMARY KEY,GAME_NAME TEXT,SYSTEM TEXT,GAME_TYPE TEXT,COVER TEXT)"
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()
        cursor.close()
        AddWiiGamesIfMissing()
        print "Database upgrade complete"
	
    try:
        sql = "alter table games add column cover text"
	connection = sqlite3.connect(db_path)
	cursor = connection.cursor()
	cursor.execute(sql)
	connection.commit()
	cursor.close()
    except:
	status = "Do Nothing"
	
    try:
        sql = "alter table requested_games add column cover text"
	connection = sqlite3.connect(db_path)
	cursor = connection.cursor()
	cursor.execute(sql)
	connection.commit()
	cursor.close()
    except:
	status = "Do Nothing"	
    
    #loop requested games where cover is null
    sql = "select game_name,cover,system from requested_games where cover is null"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    cursor.close()
    for record in result:
	game_name = str(record[0])
	cover = str(record[1])
	system = str(record[2])
	sql = "update requested_games set cover = (Select cover from games where game_name = '" + game_name + "' and system = '" + system + "') Where game_name = '" + game_name + "' and system = '" + system + "'"
        connection = sqlite3.connect(db_path)
	cursor = connection.cursor()
	cursor.execute(sql)
	connection.commit()
	cursor.close()
		
    if(comingSoonTableExists == False):
	sql = "create table comingsoon(ID INTEGER NOT NULL PRIMARY KEY UNIQUE,GameTitle TEXT(255),ReleaseDate DATE,System TEXT(255))"
	connection = sqlite3.connect(db_path)
	cursor = connection.cursor()
	cursor.execute(sql)
	connection.commit()
        cursor.close()
        AddComingSoonGames()  
    	
def AddEventToDB(message):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    createdDate = datetime.datetime.now()
    sql = "INSERT INTO gamez_log (message,created_date) values('" + message.replace("'","''") + "',datetime())"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def GetLog():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT message,created_date FROM gamez_log order by created_date desc,id desc limit 1000"
    data = ''
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            message = str(record[0])
            created_date = str(record[1])
            rowdata = "<tr><td>" + message + "</td><td>" + created_date + "</td></tr>"
            data = data + rowdata
        except:
            continue
    cursor.close()
    return data

def ClearDBLog():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    createdDate = datetime.datetime.now()
    sql = "delete from gamez_log"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def ClearGames(system):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "delete from games where system = '" + system + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def AddWiiGamesIfMissing():
        wiiWebServiceUrl = "http://www.gamezapp.org/webservice/wii"
        response = ''
        try:
            responseObject = urllib.FancyURLopener({}).open(wiiWebServiceUrl)
            response = responseObject.read()
            responseObject.close()
        except:
            LogEvent("Unable to connect to web service: " + wiiWebServiceUrl)
            return
        json_data = json.loads(response)
        ClearGames("Wii")
        for data in json_data:
            game_name = data['GameTitle']
            game_type = data['GameType'] 
            game_cover = data['GameCover']
            db_path = os.path.join(os.path.abspath(""),"Gamez.db")
            sql = "SELECT count(ID) from games where game_name = '" + game_name.replace("'","''") + "' AND system='Wii'"
            connection = sqlite3.connect(db_path)
            cursor = connection.cursor()
            cursor.execute(sql)
            result = cursor.fetchall()    
            recordCount = result[0][0] 
            cursor.close()
            if(str(recordCount) == "0"):
                LogEvent("Adding Wii Game [" + game_name.replace("'","''") + "] to Game List")
                sql = "INSERT INTO games (game_name,game_type,system,cover) values('" + game_name.replace("'","''") + "','" + game_type + "','Wii','" + game_cover + "')"
                cursor = connection.cursor()
                cursor.execute(sql)
                connection.commit()
                cursor.close()       
        return

def AddXbox360GamesIfMissing():
    url = "http://www.gamezapp.org/webservice/xbox360"
    response = ''
    try:
        responseObject = urllib.FancyURLopener({}).open(url)
        response = responseObject.read()
        responseObject.close()
    except:
        LogEvent("Unable to connect to web service: " + url)
        return
    json_data = json.loads(response)
    ClearGames("Xbox360")
    for data in json_data:
        game_name = data['GameTitle']
        game_type = data['GameType'] 
        game_cover = data['GameCover']
        db_path = os.path.join(os.path.abspath(""),"Gamez.db")
        sql = "SELECT count(ID) from games where game_name = '" + game_name.replace("'","''") + "' AND system='Xbox360'"
        connection = sqlite3.connect(db_path)
        cursor = connection.cursor()
        cursor.execute(sql)
        result = cursor.fetchall()    
        recordCount = result[0][0] 
        cursor.close()
        if(str(recordCount) == "0"):
            LogEvent("Adding XBOX 360 Game [" + game_name.replace("'","''") + "] to Game List")
            sql = "INSERT INTO games (game_name,game_type,system,cover) values('" + game_name.replace("'","''") + "','" + game_type + "','Xbox360','" + game_cover + "')"
            cursor = connection.cursor()
            cursor.execute(sql)
            connection.commit()
            cursor.close()       
    return

def ClearComingSoonGames():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "delete from comingsoon"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return
    
def AddComingSoonGames():
        comingSoonWebServiceUrl = "http://www.gamezapp.org/webservice/comingsoon"
        response = ''
        try:
            responseObject = urllib.FancyURLopener({}).open(comingSoonWebServiceUrl)
            response = responseObject.read()
            responseObject.close()
        except:
            LogEvent("Unable to connect to web service: " + comingSoonWebServiceUrl)
            return
        json_data = json.loads(response)
        ClearComingSoonGames()
        for data in json_data:
            game_name = data['GameTitle']
            release_date = data['ReleaseDate'] 
            system = data['System']
            db_path = os.path.join(os.path.abspath(""),"Gamez.db")
            sql = "SELECT count(ID) from comingsoon where gametitle = '" + game_name.replace("'","''") + "' AND system='" + system + "'"
            connection = sqlite3.connect(db_path)
            cursor = connection.cursor()
            cursor.execute(sql)
            result = cursor.fetchall()    
            recordCount = result[0][0] 
            cursor.close()
            if(str(recordCount) == "0"):
                LogEvent("Adding " + system + " Game [" + game_name.replace("'","''") + "] to Coming Soon Game List")
                sql = "INSERT INTO comingsoon (gametitle,releasedate,system) values('" + game_name.replace("'","''") + "','" + release_date + "','" + system + "')"
                cursor = connection.cursor()
                cursor.execute(sql)
                connection.commit()
                cursor.close()       
        return    
        
def GetUpcomingGames():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT gametitle,strftime('%m/%d/%Y',releasedate),system,id FROM comingsoon order by releasedate asc"
    data = ''
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            gametitle = str(record[0])
            releasedate = str(record[1])
            system = str(record[2])
            db_id = str(record[3])
            rowdata = "<tr><td><a href='addgameupcoming?dbid=" + db_id + "'>Download</a></td><td>" + gametitle + "</td><td>" + releasedate + "</td><td>" + system + "</td></tr>"
            data = data + rowdata
        except:
            continue
    cursor.close()
    return data

def GetRequestedGameName(db_id):
    game_name = "[" + db_id + "]"
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "select Game_name from requested_games where ID = '" + db_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()[0]
    game_name = str(result[0])
    cursor.close()
    return game_name

def GetRequestedGameSystem(db_id):
    system = ""
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "select System from requested_games where ID = '" + db_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()[0]
    system = str(result[0])
    cursor.close()
    return system

def GetRequestedGamesForFolderProcessing():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "select Game_name,system from requested_games"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    cursor.close()
    return result

def CheckForSameGame(game_name):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "select count(ID) from requested_games where Game_name = '" + game_name + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()[0][0]
    cursor.close()
    if(int(result) == 1):
        return False
    else:
        return True

def UpdateStatusForFolderProcessing(game_name,system,status):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "update requested_games set status='" + status + "' where game_name='" + game_name + "' and system='" + system + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def ApiGetGamesFromTerm(term,system):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT GAME_NAME,SYSTEM,COVER FROM GAMES where game_name like '%" + term.replace("'","''") + "%' AND SYSTEM LIKE '%" + system + "%' ORDER BY GAME_NAME ASC"
    data = ""
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            game_name = str(record[0])
            system = str(record[1])
            cover = str(record[2])
            rowdata = '{"GameTitle":"' + game_name + '","System":"' + system + '","GameCover":"' + cover + '"},'
            data = data + rowdata
        except:
            continue
    cursor.close()
    data = data[:-1]
    data = '["Games":' + data + ']'
    return data
    
def ApiGetRequestedGames():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT GAME_NAME,SYSTEM,COVER FROM REQUESTED_GAMES ORDER BY GAME_NAME ASC"
    data = ""
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            game_name = str(record[0])
            system = str(record[1])
            cover = str(record[2])
            rowdata = '{"GameTitle":"' + game_name + '","System":"' + system + '","GameCover":"' + cover + '"},'
            data = data + rowdata
        except:
            continue
    cursor.close()
    data = data[:-1]
    if(data == ""):
    	data = '"None"'
    data = '["Games":' + data + ']'
    return data
    
      