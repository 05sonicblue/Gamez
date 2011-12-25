import DBFunctions

def LogEvent(message):
        DBFunctions.AddEventToDB(message)
        return

def ClearLog():
    ClearDBLog()
    return