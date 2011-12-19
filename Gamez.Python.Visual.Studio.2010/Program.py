import cherrypy
import os
from lib.WebRoot import WebRoot
from lib.WebBrowseWii import WebBrowseWii

app_path = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(app_path,'Gamez.ini')

if __name__ == '__main__':
    cherrypy.config.update(config_path)
    css_path = os.path.join(app_path,'css')
    css_images_path = os.path.join(css_path,'images')
    scripts_path = os.path.join(app_path,'scripts')
    conf = {
            '/css': {'tools.staticdir.on':True,'tools.staticdir.dir':css_path},
            '/scripts':{'tools.staticdir.on':True,'tools.staticdir.dir':scripts_path},
            '/css/images':{'tools.staticdir.on':True,'tools.staticdir.dir':css_images_path}}
    cherrypy.quickstart(WebRoot(),'/',config=conf)