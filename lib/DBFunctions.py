import os
import sqlite3
import sys

def GetAllWiiGames():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = 'SELECT game_name,ID,game_id FROM wii_games order by game_name asc'
    data = ""
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            game_name = str(record[0])
            game_name.replace("'","''")
            id = str(record[1])
            game_id = str(record[2])
            rowdata = id + "::" + game_id + "::" + game_name + "\r\n"
            data = data + rowdata + "||"
            #{db_id:"1", nintendo_id:"RVDX01", game_title:"Super Mario Bros."},
        except:
            continue
    cursor.close()
    data = data[:-2]
    return data



def GetWiiGameList():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = 'SELECT distinct game_name FROM wii_games order by game_name asc'
    data = ""
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            game_name = str(record[0])
            game_name.replace("'","''")
            id = str(record[1])
            game_id = str(record[2])
            rowdata = id + "::" + game_id + "::" + game_name + "\r\n"
            data = data + rowdata + "||"
            #{db_id:"1", nintendo_id:"RVDX01", game_title:"Super Mario Bros."},
        except:
            continue
    cursor.close()
    data = data[:-2]
    return data

#Below are the only ones currently used

def GetWiiGamesFromTerm(term):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT distinct game_name FROM wii_games where game_name like '%" + term.replace("'","''") + "%' order by game_name asc"
    data = ""
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            game_name = str(record[0])
            rowdata = '{"value":"' + game_name + '"},'
            data = data + rowdata
        except:
            continue
    cursor.close()
    data = data[:-1]
    data = "[" + data + "]"
    return data

def GetWiiGameDataFromTerm(term):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT game_name,game_id,id FROM wii_games where game_name like '%" + term.replace("'","''") + "%' order by game_name asc"
    data = ''
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            #<tr><td>Trident</td><td>Internet Explorer 4.0</td><td>Win 95+</td></tr>
            game_name = str(record[0])
            game_id = str(record[1])
            db_id = str(record[2])
            rowdata = "<tr><td><a href='addgame?dbid=" + db_id + "'>Download</a></td><td>" + game_name + "</td><td>" + game_id + "</td></tr>"
            data = data + rowdata
        except:
            continue
    cursor.close()
    return data

def AddWiiGameToDb(db_id,status):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "insert into requested_games(WiiGameID,status) select '" + db_id + "','" + status + "' where not exists(select 1 from requested_games where WiiGameID='" + db_id + "')"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def GetRequestedGames():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT wii_games.id,game_name,game_id,status FROM requested_games inner join wii_games on requested_games.WiiGameID = wii_games.ID"
    data = ''
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    for record in result:
        try:
            db_id = str(record[0])
            game_name = str(record[1])
            game_id = str(record[2])
            status = str(record[3])
            rowdata = "<tr><td><a href='removegame?dbid=" + db_id + "'>Delete</a></td><td>" + game_name + "</td><td>" + game_id + "</td><td>" + status + "</td></tr>"
            data = data + rowdata
        except:
            continue
    cursor.close()
    return data

def RemoveWiiGameFromDb(db_id):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "delete from requested_games where WiiGameID='" + db_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return

def GetRequestedGamesAsArray():
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "SELECT game_name,WiiGameID FROM requested_games inner join wii_games on requested_games.WiiGameID = wii_games.ID WHERE status='Wanted'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchall()
    cursor.close()
    return result

def UpdateStatus(game_id,status):
    db_path = os.path.join(os.path.abspath(""),"Gamez.db")
    sql = "update requested_games set status='" + status + "' where WiiGameID='" + game_id + "'"
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    cursor.execute(sql)
    connection.commit()
    cursor.close()
    return