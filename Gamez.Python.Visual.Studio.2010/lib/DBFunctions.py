import os
import sqlite3
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
            rowdata = '{db_id:"' + id + '",nintendo_id:"' + game_id + '",game_title:"' + game_name + '"},'
            data = data + rowdata
            #{db_id:"1", nintendo_id:"RVDX01", game_title:"Super Mario Bros."},
        except:
            continue
    cursor.close()
    data = data[:-1]
    data = '{"recordsReturned": 6001,"totalRecords":6001,"startIndex":0,"sort":null,"dir":"asc","records":[' + data + "]}"
    return data


