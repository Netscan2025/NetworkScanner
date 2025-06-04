import win32serviceutil, win32service, win32event, servicemanager, requests, socket, pika, json
from scanner import discovery, logger

url = {}
with open('../server.txt','r') as file: #read the server.txt file
    for line in file:
        if "=" in line:
            key, val = line.split("=",1)
            key = key.strip()
            val = val.strip().strip('"')
            url[key] = val

RMQ_URL = url.get("RMQ_URL")
BES_URL = url.get("BES_URL")

def polling(chnl,method,properties,body):
    try:
        data = json.loads(body.decode())
        logger.info("Receuved scan job")

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
                    requests.post(Backend_URL, data={'message': "Scan started!"},headers={'x-agent-key': uni_key}) #Sending message to the Backend API
                    discovery(ip_rnge,com) #calling discovery function
                    requests.post(Backend_URL,data={'message': "Scan Completed!"},headers={'x-agent-key': uni_key})
                    logger.info(f"manual scan completed!")
                except Exception as e:
                    requests.post(Backend_URL,data={'message': "Unable to trigger a manual scan"},headers={'x-agent-key': uni_key})
            else:
                logger.warning("Invalid unique!")
            chnl.basic_ack(del_tag=method.delivery_tag)                
    except Exception as e:
        requests.post(Backend_URL,data={'message': "Unable to communicate with server: {e}"},headers={'x-agent-key': uni_key})
        chnl.basic_ack(del_tag=method.delivery_tag, requeue=False)

def consumer():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue=scan_task, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=scan_task, on_message_callback=polling)
    channel.start_consuming()

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
        consumer()

if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(Netscan)
