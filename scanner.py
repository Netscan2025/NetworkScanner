import nmap # pip install python3-nmap
import socket #import socket to pull hostname
from pysnmp.hlapi import * #import SNMP
from concurrent.futures import ThreadPoolExecutor,as_completed
import logging
import logging.handlers as handlers
import datetime as dt
from scheduler import Scheduler

#Defining logger to log the info:

logger = logging.getLogger('net_scan')
logger.setLevel(logging.INFO) #logging information
format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
loghandler = handlers.RotatingFileHandler(filename='netscan.log',mode='a',maxBytes=20000000,backupCount=3)
loghandler.setLevel(logging.INFO)
loghandler.setFormatter(format)
logger.addHandler(loghandler)

#Run SNMPWalk
def snmpwalk(ip,community,std_oid):
        oid = {}
        for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(SnmpEngine(),CommunityData(community),UdpTransportTarget((ip, 161)),ContextData(),ObjectType(ObjectIdentity(std_oid)),lexicographicMode=False):
            if errorIndication or errorStatus:
                continue
            for varBind in varBinds:
                oid_str, value = varBind
                oid[str(oid_str)] = value.prettyprint()
        return oid

#Get interface
def get_interface(ip, community):

    #Mac Addr to Port num
    mac_to_port = '1.3.6.1.2.1.17.4.3.1.2'
    mac_table = snmpwalk(ip, community, mac_to_port)

    #Port number to Interface index
    port_to_ifindex= '1.3.6.1.2.1.17.1.4.1.2'
    port_table = snmpwalk(ip, community, port_to_ifindex)

    #Interface index to Interface name
    ifindex_to_name = '1.3.6.1.2.1.2.2.1.2'
    ifindex_table = snmpwalk(ip, community, ifindex_to_name)

    #Local Device MAC
    dev_mac_oid = '1.3.6.1.2.1.2.2.1.6'
    dev_mac_table = snmpwalk(ip,community,dev_mac_oid)

    connection = []

    if not mac_table or not port_table or not ifindex_table:
        logger.warning(f"SNMP disabled on {ip}")
        return None
    
    if not connection:
        for mac_oid, port_num in mac_table.items():
            try:
                #get the MAC of the connected device
                raw_addr = mac_oid.split('.')[-6:]
                mac = ':'.join(f"{int(m):02x}"for m in raw_addr).upper()

                #Get the port device is connected on
        
                ifindex = port_table.get(f'1.3.6.1.2.1.17.1.4.1.2.{port_num}', 'Unknown')
                iface = ifindex_table.get(f'1.3.6.1.2.1.2.2.1.2.{ifindex}', 'Unknown')
                dev_mac = dev_mac_table.get(f'1.3.6.1.2.1.2.2.1.6.{ifindex}', 'Unknown')
                connection.append({
                    'mac': mac,
                    'port': port_num,
                    'interface': iface,
                    'dev_mac': dev_mac
                })
            except Exception as e:
                logger.warning(f"failed to extract interface for {ip}: {e}")

        if not connection:
            logger.warning(f"No valid SNMP interfaces found on {ip}")
            return None   

        logger.info(f"interfaces for {ip}: {connection}")
        return connection

def scan_net(data, ns, community):
        ip = ns[data]['addresses'].get("ipv4",data)
        hostname = "Unknown"
        os = "Unknown"
        mac = "Unknown"
        vendor = "Unknown"
        interfaces = []
        
        #Hostname
        hostnames = ns[data].hostname()
        if not hostnames:
            try:
                hostname = socket.gethostbyaddr(ip)[0]
                logger.info(f"Pulled hostname for {ip}: {hostname}")
            except (socket.herror, socket.gaierror):
                hostname = "Unknown"
                logger.info(f"Unable to resolve hostname for {ip}: {hostname}")

        #OS
        try:
            if 'osmatch' in ns[data] and ns[data]['osmatch']:
                os = ns[data]['osmatch'][0]['name']

            #Vendor
                if 'osclass' in ns[data]['osmatch'][0] and ns[data]['osmatch'][0]['osclass']:
                    vendor = ns[data]['osmatch'][0]['osclass'][0].get('vendor', 'Unknown')
        except Exception as e:
            logger.warning(f"Could not resolve OS for {ip}: {e}")

        #get MAC with SNMP data if SNMP is enabled on the device
        try:
            interfaces = get_interface(ip,community)
            logger.info(f"Pulled MAC Addresses for {ip}: {interfaces}")
            if interfaces is None:
                mac = ns[data]['addresses'].get("mac", 'Unknown')
                logger.info(f"Could not pull MAC Address for {ip}: {mac}")
        except Exception as e:
            logger.warning(f"Unable to pull MAC: {e}")
        #Extract the info and add the infor to the Dictionary
        return {

            'ip': ip,
            'hostname': hostname,
            'os': os,
            'mac': mac,
            'interface': interfaces,
            'vendor': vendor
        }

#Main function being call
def discovery(ip_range, community):
    ns = nmap.PortScanner() #Scanning all the actvie hosts in the network range
    ns.scan(hosts=ip_range, arguments='-O -T4')

    assets = []
    
#For each active host retrieve the OS, Hostname, IP and MAC
    with ThreadPoolExecutor(max_workers=20) as runner:
        jobs = [runner.submit(scan_net, data, ns, community) for data in ns.all_hosts()]

        for job in as_completed(jobs):
            try:
                result = job.result()
                assets.append(result)
                logger.info(f"Scanned: {result}")
            except Exception as e:
                logger.warning(f"Error occurred when scanning: {e}")
    logger.info(f"Scan Completed! Pushing information to the Database")
    return assets

#Call the function and specify the IP range
community = "public"
ip_range = "192.168.1.0/24"
assets = discovery(ip_range)
schedule = Scheduler()
schedule.daily(dt.time(hour=00,minute=1), discovery)

#Print result
for device in assets:
    print(f"IP: {device['ip']}")
    print(f"Hostname: {device['hostname']}")
    print(f"OS: {device['os']}")
    print(f"Mac: {device['mac']}")
    print(f"Interfaces:")
    if device['interfaces']:
        for intr in device['interfaces']:
            print(f" Interface: {intr['interface']} -> Dev_MAC: {intr['dev_mac']} -> Port: {intr['port']} -> MAC: {intr['mac']} ")
    print(f"Vendor: {device['vendor']}")
    print("-" * 30)
