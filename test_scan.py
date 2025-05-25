import nmap # pip install python3-nmap
import socket

def discovery(ip_range):
    ns = nmap.PortScanner() #Scanning all the actvie hosts in the network range
    ns.scan(hosts=ip_range, arguments='-O -T4')

    assets = []

#For each active host retrieve the OS, Hostname, IP and MAC

    for data in ns.all_hosts(): 

        ip = ns[data]['addresses'].get("ipv4",data)
        hostname = "Unknown"
        os = "Unknown"
        mac = "Unknown"
        vendor = "Unknown"

        #Hostname
        hostname = ns[data]['hostname'][0]['name']
        if not hostname:
            try:
                hostname = socket.gethostbyaddr(ip)[0]
            except (socket.herror, socket.gaierror):
                hostname = "Unknown"

        #OS
        if 'osmatch' in ns[data] and ns[data]['osmatch']:
            os = ns[data]['osmatch'][0]['name']

            #Vendor
            if 'osclass' in ns[data]['osmatch'][0] and ns[data]['osmatch'][0]['osclass']:
                vendor = ns[data]['osmatch'][0]['osclass'][0].get('vendor', 'Unknown')

        #MAC Address
        mac = ns[data]['addresses'].get("mac", 'Unknown')

        


        #Extract the info and add the infor to the Dictionary
        assets.append({
            'ip': ip,
            'hostname': hostname,
            'os': os,
            'mac': mac,
            'vendor': vendor
        })

    return assets

#Call the function and specify the IP range

ip_range = "192.168.1.0/24"
assets = discovery(ip_range)

#Print result
for device in assets:
    print(f"IP: {device['ip']}")
    print(f"Hostname: {device['hostname']}")
    print(f"OS: {device['os']}")
    print(f"MAC: {device['mac']}")
    print(f"vendor: {device['vendor']}")
    print("-" * 30)