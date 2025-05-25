import nmap # pip install python3-nmap
import socket #import socket to pull hostname
from pysnmp.hlapi import * #import SNMP
from concurrent.futures import ThreadPoolExecutor,as_completed
import logging
import logging.handlers as handlers
import datetime as dt
from scheduler import Scheduler
import sqlite3
import os

#Defining logger to log the info:

logger = logging.getLogger('net_scan')
logger.setLevel(logging.INFO) #logging information
format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
loghandler = handlers.RotatingFileHandler(filename='netscan.log',mode='a',maxBytes=20000000,backupCount=3)
loghandler.setLevel(logging.INFO)
loghandler.setFormatter(format)
logger.addHandler(loghandler)

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

def scan_net(data, ns, community):

    ip = ns[data]['addresses'].get("ipv4",data)
    hostname = "Unknown"
    os = "Unknown"
    mac = "Unknown"
    vendor = "Unknown"
    interfaces = []
        
    #Hostname
    hostname = ns[data]['hostnames'][0]['name']
    
    if not hostname:
        try:
            hostname = socket.gethostbyaddr(ip)[0]
        except (socket.herror, socket.gaierror):
            hostname = "Unknown"
    logger.info(f"Pulled hostname for {ip}: {hostname}")

    #get interfaces with SNMP data if SNMP is enabled on the device

    try:
        interfaces = get_interface(ip,community)
        #fetching Mac if unable to pull interface
    except Exception as e:
        interfaces = []
        logger.warning(f"Unable to pull interfaces for device with {ip}: {e}. Please make sure SNMP is enabled ")

    if interfaces == []:
        try:    
            mac = ns[data]['addresses'].get("mac", 'Unknown')
            logger.info(f"Pulled MAC Address for {ip}: {mac}")
        except Exception as e:
            logger.warning(f"Unable to pull MAC: {e}")

    #OS
    try:
        if 'osmatch' in ns[data] and ns[data]['osmatch']:
            os = ns[data]['osmatch'][0]['name']
            logger.info(f"Pulled operating system for {ip}: {os}")

        #Vendor & Device Type
            #Vendor
            if 'osclass' in ns[data]['osmatch'][0] and ns[data]['osmatch'][0]['osclass']:
                vendor = ns[data]['osmatch'][0]['osclass'][0].get('vendor', 'Unknown')
                if vendor == "Linux":
                    ns[data]['addresses'].get(mac,data)
                else:
                    vendor == vendor
                logger.info(f"Pulled Vendor for {ip}: {vendor}")

                #Device Type
                dev_type = ns[data]['osmatch'][0]['osclass'][0].get('type',"Unknown")
                if dev_type == "media device" or dev_type is None:
                    dev_type = ns[data]['osmatch'][0]['osclass'][0].get('osfamily',data)
                elif dev_type == "general purpose":
                    dev_type = "WorkStation"
                else:
                    dev_type = dev_type
                logger.info(f"Pulled Device type for {ip}: {dev_type}")
        

    except Exception as e:
        logger.warning(f"Could not resolve OS for {ip}: {e}")


    #Extract the info and add the infor to the Dictionary
    return {

        'ip': ip,
        'hostname': hostname,
        'device_type': dev_type,
        'os': os,
        'mac': mac,
        'interface': interfaces,
        'vendor': vendor
    }

#initiate DB creation
def sqllite_db():
    try:
        con = sqlite3.connect("netscan.db")
        logger.info(f"Successfully created database!")
    except Exception as e:
        logger.warning(f"failed to create Database {e}")
    cur = con.cursor()
    #Table to add the Devices
    try:
        cur.execute("CREATE TABLE IF NOT EXISTS network_device(id INTEGER PRIMARY KEY AUTOINCREMENT, ip_addr TEXT NOT NULL, hostname TEXT NOT NULL, device_type TEXT NOT NULL, operating_system TEXT NOT NULL, mac_addr TEXT NOT NULL, vendor TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        logger.info("Successfully created database table network_device")
    except Exception as e:
        logger.warning(f"Unabled to create network_device table: {e}")

    #Table to add interfaces
    try:
        cur.execute("CREATE TABLE IF NOT EXISTS Device_interfaces(id INTEGER PRIMARY KEY AUTOINCREMENT, device_id INTEGER NOT NULL, interface TEXT, mac_addr TEXT, port TEXT, dev_mac_addr TEXT, FOREIGN KEY (device_id) REFERENCES network_device(id) ON DELETE RESTRICT)")
        logger.info("Successfully created database table device_interfaces table")
    except Exception as e:
        logger.warning(f"Unable to create device_interface table: {e}")

    con.commit()
    con.close()

def clean_up():
    #clean previous scan records
    try:
        if os.path.exists("netscan.db"):
            os.remove("netscan.db")
            logger.info(f"Removed old database!")
    except (PermissionError,OSError) as e:
        print(f"Unable to remove previous database: {e}")
    #removing previous logs 
    try:   
        if os.path.exists("netscan.log"):
            os.remove("netscan.log")
            logger.info(f"Removed old log file!")
    except (PermissionError,OSError) as e:
        print(f"Unable to remove old log file: {e}")
#Main function being call
def discovery(ip_range, community):
    ns = nmap.PortScanner() #Scanning all the actvie hosts in the network range
    ns.scan(hosts=ip_range, arguments='-O -T4')

    assets = []
    #calling clean up function
    clean_up()

    #Calling database creation function
    sqllite_db()

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

        logger.info(f"Scan Completed!")
        if not assets:
            logger.warning(f"No devices found within the IP Range provided. Please change or update the IP Range")
        else:
            try:
                logger.info(f"Pushing information to the Database")
                insert_output(assets)
                logger.info(f"Data insertion successfully completed!")
            except Exception as e:
                logger.warning(f"Unable to insert the discovery into the database: {e}")

#Inserting result in the database
def insert_output(assets):
    con = sqlite3.connect("netscan.db")
    cur = con.cursor()
    for device in assets:
        
        #Inserting into Network Device table
        try:
            cur.execute("INSERT INTO network_device (ip_addr,hostname,device_type,operating_system,mac_addr,vendor) VALUES (?,?,?,?,?,?)",(device['ip'],device['hostname'],device['device_type'],device['os'],device['mac'],device['vendor']))
            logger.info(f"Inserting records in the Database - IP: {device['ip']} -> Hostname: {device['hostname']} -> OS: {device['os']} -> Mac: {device['mac']}")
        except Exception as e:
            logger.warning(f"Issues inserting values into network_device table: {e}")

        #Inserting into Device interface table
        if device['interface']:
            for intr in device['interface']:  
                try:
                    device_id = cur.lastrowid
                    cur.execute("INSERT INTO Device_interfaces (device_id,interface,mac_addr,port,dev_mac_addr) VALUES (?,?,?,?,?)",(device_id,intr['interface'],intr['mac'],intr['port'],intr['dev_mac']))
                    logger.info(f"Successfully inserted interface into table - Interface: {intr['interface']} -> Dev_MAC: {intr['dev_mac']} -> Port: {intr['port']} -> MAC: {intr['mac']} ")
                except Exception as e:
                    logger.warning(f"Issues inserting data into interface table: {e}")
    con.commit()
    con.close()

#Call the function and specify the IP range
community = "public" #Add your Community string
ip_range = "192.168.1.0/24" #Add your IP ranges here
discovery(ip_range,community)
schedule = Scheduler()
schedule.daily(dt.time(hour=00,minute=1), discovery)