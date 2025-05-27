import win32serviceutil
import win32service
import win32event
import servicemanager
import requests
import socket
import time
from scanner import discovery, logger


BASE_URL = "http://localhost:3000/api/scan_trigger"

def server_polling(URL,interval):
    while True:
        try:
            response = requests.get(URL)
            response.raise_for_status() #Server connection check
            data = response.json()

            if 'ip_range' in data: #Keep checking for incoming command every one sec
                with open('unique_key.conf','r') as key: #read the 
                    cmp_key = key.read().strip()

                    ip_rnge = data.get('ip_range')
                    com = data.get('community')
                    uni_key = data.get('unique_key')

                #comparing the keys
                if cmp_key == uni_key:
                    try:
                        logger.info(f"triggering a manual scan")
                        requests.post(URL, data={'message': "Scan started!"}) #Sending message to the Backend API
                        discovery(ip_rnge,com) #calling discovery function
                        requests.post(URL,data={'message': "Scan Completed!"})
                        logger.info(f"manual scan completed!")
                    except Exception as e:
                        requests.post(URL,data={'message': "Unable to trigger a manual scan"})
                        
        except Exception as e:
            requests.post(URL,data={'message': "Unable to communicate with server: {e}"})
        time.sleep(interval)

class Netscan (win32serviceutil.ServiceFramework):
    _svc_name_ = "Network Scanner"
    _svc_display_name_ = "Network Scanner"

    def __init__(self,args):
        win32serviceutil.ServiceFramework.__init__(self,args)
        self.hWaitStop = win32event.CreateEvent(None,0,0,None)
        socket.setdefaulttimeout(60)

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)

    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_,''))
        self.main()

    def main(self):
        server_polling(BASE_URL,interval=1)

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(Netscan)
