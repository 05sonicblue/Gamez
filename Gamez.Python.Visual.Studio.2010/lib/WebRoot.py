import cherrypy
import json
from DBFunctions import GetAllWiiGames
test_data = GetAllWiiGames()
new_test_data = """
                    1::RXCED01::Super Mario Bros.
                """

def test_data_to_list(test_data=test_data):
    out_list = []
    for line in test_data.split('||'):
        if line: # skip blank lines
            line = line.split('::') # Turn the line into a list
            # Now turn any stringified integers back into integers for proper sorting
            for index, item in enumerate(line):
                try:
                    line[index] = int(item)
                except:
                    pass
            out_list.append(line)
    return out_list

def split_seq(seq, size):
        return [seq[i:i+size] for i in range(0, len(seq), size)]

def sortby(cells, field_index):
    cells.sort(lambda x,y:cmp(x[field_index], y[field_index]))
    return cells

def sortby_field(sort_field, header, cells):
    sorted_list = []
    for column in header:
        if sort_field == column:
            sorted_list = sortby(cells, header.index(column))
    return sorted_list

def jqgrid_format(header, cells, id_field_index=None):
    out_list = []
    for row in cells:
        if id_field_index:
            key = row[id_field_index] # Use this field as the 'id' field
        else:
            key = row[0] # Otherwise, just use the first field
        out_cells = []
        for item in row:
            out_cells.append(item)
        out_list.append({'id': key, 'cell': out_cells})
    return out_list

def search_cells(header, cells, search_string, search_field, search_type):
    out_list = []
    for item in cells:
        if search_type == "bw":
            if str(item[header.index(search_field)]).startswith(search_string):
                out_list.append(item)
        elif search_type == "ew":
            if str(item[header.index(search_field)]).endswith(search_string):
                out_list.append(item)
        elif search_type == "eq":
            if str(item[header.index(search_field)]) == search_string:
                out_list.append(item)
        elif search_type == "ne":
            if str(item[header.index(search_field)]) != search_string:
                out_list.append(item)
        elif search_type == "lt":
            if item[header.index(search_field)] < int(search_string):
                out_list.append(item)
        elif search_type == "le":
            if item[header.index(search_field)] <= int(search_string):
                out_list.append(item)
        elif search_type == "gt":
            if item[header.index(search_field)] > int(search_string):
                out_list.append(item)
        elif search_type == "ge":
            if item[header.index(search_field)] >= int(search_string):
                out_list.append(item)
        elif search_type == "cn":
            if search_string in item[header.index(search_field)]:
                out_list.append(item)
    return out_list

def jqgrid_json(self, cell_list, header, id_field_index=None, rows=None, sidx=None, _search=False, searchField=None, searchOper=None, searchString=None, page=None, sord=None):
    if not page:
        page = 1
    if sidx: # Sort by this field
        cell_list = sortby_field(sidx, header, cell_list)
        if sord == 'desc':
            cell_list.reverse()
    if _search == "true" or _search is True: # We're (also) doing a search
        cell_list = search_cells(header, cell_list, searchString, searchField, searchOper)
    line_count = len(cell_list)
    jqgrid_cells = jqgrid_format(header, cell_list, id_field_index)
    if rows: # Limit the results to the number represented by the 'rows' parameter
        # Divide up the results into chunks of 'rows' size...
        paginated_list = split_seq(jqgrid_cells,int(rows))
        total_pages = len(paginated_list)
        if total_pages == 0: # No records to return
            jqgrid_dict = { # Construct an empty (but valid) JSON dict
                'total': total_pages, # This will be 0
                'records': line_count, # Ditto
                'page': page, # Always going to be 1
                'rows': ''}
        else:
            # Make the first item empty so page 1 equals list[1] (for convenience)
            paginated_list.insert(0,'')
            jqgrid_dict = { # Construct a jqgrid json dict
                'total': total_pages,
                'records': line_count,
                'page': page,
                'rows': paginated_list[int(page)]}
    else: # Return all records (don't paginate)
        jqgrid_dict = { # Same as above but without pagination
        'total': line_count,
        'records': line_count,
        'page': page, # Everything is on page 1
        'rows': cell_list}
    return json.dumps(jqgrid_dict)

class WebRoot:
    @cherrypy.expose
    def index(self):
        return """
                <hmtl>
                    <head>
                        <title>Gamez</title>
                        <link rel="stylesheet" type="text/css" href="css/navigation.css" />
                        <link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-1.8.16.custom.css" />
                        <script type="text/javascript" src="js/jquery-1.6.2.min.js"></script>
                        <script type="text/javascript" src="js/jquery-ui-1.8.16.custom.min.js"></script>
                        <script type="text/javascript" src="scripts/menu.js"></script>
                    </head>
                    <body>
                        <div id="menu">
                            <ul class="menu">
                                <li class="parent">
                                    <a href="/">
                                        Home
                                    </a>
                                </li>
                            </ul>
                            <div style="text-align:right;margin-top:5px;margin-right:20px">
                                <div class=ui-widget>
                                    <LABEL for=search>Search: </LABEL>
                                    <INPUT id=search />
                                    <input id=searchButton value="Search" style="height:5px" type="submit" />
                                    <script>
                                        var results = ["test","test1","test2","test","test1","test2"];
                                        $("#search").autocomplete({source:results});
                                        $("#searchButton").button();
                                    </script>
                                </div>
                            </div>
                        </div>
                        <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
                    </body>
                </html>
               """

    @cherrypy.expose
    def wii(self):
        return """
                <html>
                    <head>
                        <title>Gamez :: Wii</title>
                        <link rel="stylesheet" type="text/css" href="css/styles.css" />
                        <link rel="stylesheet" type="text/css" media="screen" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/black-tie/jquery-ui.css" />
                        <link rel="stylesheet" type="text/css" media="screen" href="css/ui.jqgrid.css" />
                        <script type="text/javascript" src="scripts/jquery-1.5.2.min.js"></script>
                        <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js" type="text/javascript"></script>
                        <script type="text/javascript" src="scripts/grid.locale-en.js"></script>
                        <script type="text/javascript" src="scripts/jquery.jqGrid.min.js"></script>
                        <script type="text/javascript" src="scripts/menu.js"></script>
                     </head>
                    <body>
                        <div id="menu">
                            <ul class="menu">
                                <li class="parent">
                                    <a href="/">
                                        Home
                                    </a>
                                </li>
                                <li class="parent">
                                    <a href="/wii">
                                        Wii (Browse)
                                    </a>
                                </li>
                                <li class="parent">
                                    <a href="/">
                                        Search
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div style="visibility:hidden"><a href="http://apycom.com/">jQuery Menu by Apycom</a></div>
                    
                        
                        <center>
                            <!--- Grid Goes Here-->
                            <table id="wiigames" class="scroll" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>
                            <div id="wiigamespager" class="scroll" style="text-align:center;height:40px"></div>

                            <script type="text/javascript">
                               jQuery('#wiigames').jqGrid(
                               {
                                    url: '/wii_games_json',
                                    datatype: "json",
                                    colNames:['ID','Game ID','Game Title'],
                                    colModel:[{name:'ID',index:'id',width:150},{name:'game_id',index:'game_id',width:150},{name:'game_title',index:'game_title',width:400}],
                                    rowNum:15,
                                    multiselect:false,
                                    width:700,
                                    height: "400",
                                    pager: jQuery('#wiigamespager'),
                                    //sortname: 'game_title',
                                    viewrecords: true,
                                    sortorder: "asc",
                                    caption: "Wii Games"
                               //}).navGrid('#wiigames',{view:true, del:false},{},{},{},{},{closeOnEscape:true});
                               }).navGrid('#wiigames',{edit:true,add:true,del:true,view:true,search:true},{},{width:350},{});
                            </script>




                        </center>
                    </body>
                </html>
               """

    @cherrypy.expose
    def wii_games_json(self, rows=None, sidx=None, _search=None, searchField=None,searchOper=None, searchString=None, page=None, sord=None, nd=None): # 1 line
        header = ["id", "game_id", "game_title"]
        wii_game_list = test_data_to_list(test_data)
        return jqgrid_json(self, wii_game_list, header, rows=rows, sidx=sidx, _search=_search,searchField=searchField, searchOper=searchOper, searchString=searchString, page=page, sord=sord)

    @cherrypy.expose
    def search(self):
        return GetAllWiiGames()



