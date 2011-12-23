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
            rowdata = id + "::" + game_id + "::" + game_name + "\r\n"
            data = data + rowdata + "||"
            #{db_id:"1", nintendo_id:"RVDX01", game_title:"Super Mario Bros."},
        except:
            continue
    cursor.close()
    data = data[:-2]
    return data


