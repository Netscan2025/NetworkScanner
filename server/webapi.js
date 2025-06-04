const express = require('express');
const con = require('./DB_connection');
const conf = require('./config');
const app = express();
const amqp = require('amqplib');
const Memcached = require('memcached');

const cache = new Memcached(conf.MEM_URL)

app.use(express.json());

const port = 3000;

let chnl;

app.listen(port,() => {
    try{

        conamq();
    }
    catch (err){
       console.error("Unbale to conenct to RabbitMQ server")
    }
    console.log("Server Listening on port:", port); 
} )

//-------------Connecting to RabbitMQ sever-------------------------//

async function conamq() {
    const con = await amqp.connect(conf.RBMQ_URL);
    chnl = await amqp.connect.createChannel();
    await chnl.assertQueue(scan_task,{ durable: true });
}

//----------------Polling Python Agent------------------------------//

//Web API to trigger the server
app.post("/api/scan_trigger",(req, res) =>{
    const { ip_range, community, unique_key } = req.body
    if (!ip_range || !unique_key){
        return res.status(400).json({error: 'Missing required fields.'});
    }

    try {
        const msg = JSON.stringify(req.body);
        chnl.sendToQueue(scan_task, Buffer.from(msg),{ persistent: true });
        return res.status(200).json({message: "Success"})
    }
    catch(err){
        res.status(500).json({error: "Failed to trigger"})
    }
});


//-----------------------API call for devices-----------------------//

//Web API to fetch all the Devices from the data
app.get("/devices",(req,res) => {
    cache.get('cached_device', (err, data) => {
        if (data) {
            return res.status(200).json(data);
        }
        else{

            con.query('select * from network_device',(err,rows) => {
                if(err){
                    res.status(500).json({error: err});
                }
                else{
                    res.status(200).json(rows);
                }
        
            });
        }    
    });   
});

//Web API to fetch specific device by ID
app.get("/device/:id",(req,res) => {
    const id = req.params.id;
    con.query('select * from network_device where id = ?',[id],(err,row) =>{
        if(err){
            res.status(500).json({error: "Internal Server Error!"})
        }
        else if(row.affectedRows == 0){
            res.status(404).json({error: "Device with provided ID does not exist"});
        }
        else{
            res.status(200).json(rows);
        }
    });
});

//Add new device with API
app.post("/device",(req,res) => {
    const ip = req.body.ip;
    const hostname = req.body.hostname;
    const device_type = req.body.device_type;
    const os = req.body.operating_system;
    const mac = req.body.mac_addr;
    const vendor = req.body.vendor;

    con.query('INSERT INTO network_device (ip_addr,hostname,device_type,operating_system,mac_addr,vendor) VALUES (?,?,?,?,?,?)',[ip],[hostname],[device_type],[os],[mac],[vendor],(err,row) =>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
        }
    });
});

//API to update the existing device
app.patch("/device/:id",(req,res) => {
    const id = req.params.id
    const ip = req.body.ip;
    const hostname = req.body.hostname;
    const device_type = req.body.device_type;
    const os = req.body.operating_system;
    const mac = req.body.mac_addr;
    const vendor = req.body.vendor;

    let data = [];
    let values = [];

    if (ip) {
        data.push("ip_addr = ?");
        values.push(ip);
    }
    if (hostname) {
        data.push("hostname = ?");
        values.push(hostname);
    }
    if (device_type) {
        data.push("device_type = ?");
        values.push(device_type);
    }
    if (mac) {
        data.push("mac_addr = ?");
        values.push(mac);
    }
    if (vendor) {
        data.push("vendor = ?");
        values.push(vendor);
    }

    //Data check

    if (data.length == 0) {
        return res.status(400).json({error: "no valid data provided to update!"})
    }

    con.query('Update network_device (ip_addr,hostname,device_type,operating_system,mac_addr,vendor) SET ${data.join(", ")} where id = ?',[id],(err,row) =>{
        if(err){
            res.status(500).json({error: err});
        }
        else if(row.affectedRows == 0){
            res.status(404).json({error: "Device not found"})

        }
        else{
            res.status(200).json({message: "Device updated successfully!"});
        }
    });
});

//API to Purge/Delete the device
app.delete("/device/:id",(req,res) => {
    const id = req.params.id;
    con.query('delete * from network_device where id = ?',[id],(err,row) =>{
        if(err){
            res.status(500).json({error: "Internal Server Error!"})
        }
        else if(row.affectedRows == 0){
            res.status(404).json({error: "Device with provided ID does not exist"});
        }
        else{
            res.status(200).json({message: "Device was successfully deleted!"});
        }
    });
});

//-------------------------API call for Users-------------------------//