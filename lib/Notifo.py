# 
#   License
#   =======
#   Creative Commons Attribution-Share Alike 3.0
#   http://creativecommons.org/licenses/by-sa/3.0/us/
#
#   Simply give original credit and a link to http://jrfom.com/
#
import urllib
import urllib2

class Notifo:
    """
        This class implements an interface to the Notifo public webservice.
        
        See https://api.notifo.com/ for information on this service.

        Keyword variables:
        apiusername -- Defaults to -1. Must be set to the username of the Notifo user.
        apikey -- Defaults to -1. Must be set to the API key of the Notifo user.
        
        Author: James Sumners
    """
    apiusername = -1
    apikey = -1

    __apiroot = "api.notifo.com"
    __apiver = "v1"
    __api_subscribe_user = "subscribe_user"
    __api_send_notification = "send_notification"

    def __init__(self, user = -1, ak = -1):
        """
            Create the Notifo object, optionally defining the Notifo user and API key.

            Keyword arguments:
            user -- (optional) The username of the Notifo user.
            ak -- (optional) The API key for the Notifo user.

        """

        self.apiusername = user
        self.apikey = ak

    def sendNotification(self, d={}):
        """
            Send a notification to the Notifo server.
            
            Keyword arguments:
            d -- A dictionary of parameters to pass to the server. See https://api.notifo.com/.

            Return:
            -1 if the parameters dictionary is empty,
            -2 if the apiusername property is not set,
            -3 if the apikey property is not set,
            the Notifo response text otherwise.

        """

        if len(d) == 0:
            return -1

        if self.apiusername == -1:
            return -2

        if self.apikey == -1:
            return -3

        params = urllib.urlencode(d)
    
        return self.__sendRequest(self.__api_send_notification, params)

    def subscriptUser(self, user):
        """
            Subscribe a user to our Notifo service.

            Keyword arguments:
            user -- The user to register. See https://api.notifo.com/.

            Return:
            -1 if a user is not specified,
            the Notifo response text otherwise.

        """

        if len(user) == 0:
            return -1

        params = "username=%s" % user

        return self.__sendRequest(self.__api_subscribe_user, params)

    def __sendRequest(self, method, data):
        """
            This is a private method that talks with the remote web service.

        """

        if len(method) == 0:
            return -1
        if len(data) == 0:
            return -1
            
        url = "https://%(base)s/%(version)s/%(method)s" % {"base": self.__apiroot, "version": self.__apiver, "method": method}
        
        credentials = "%(user)s:%(key)s" % {"user": self.apiusername, "key": self.apikey}
        basic = "Basic %s" % credentials.encode("base64").strip()
        headers = {"Authorization": basic}

        request = urllib2.Request(url, data, headers)
        return urllib2.urlopen(request).read()