const express = require('express');
const con = require('./DB_connection');
const conf = require('../client_server/netscan/src/config');
const app = express();
const amqp = require('amqplib');
const Memcached = require('memcached');
const cors = require('cors')

const cache = new Memcached(conf.MEM_URL)

app.use(cors());
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

            con.query('select * from devices',(err,rows) => {
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
    con.query('select d.*, df.device_ip, df.device_mac from devices d LEFT JOIN device_interface df on df.device_id = d.id where d.id = ?',[id],(err,row) =>{
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
           return res.status(500).json({error: err});
        }
        else{
            return res.status(200).json({message: "Success"});
            return res.json(rows)
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
<<<<<<< HEAD
           return res.status(500).json({error: err})
=======
           return res.status(500).json({error: err});
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
        }
        else if(row.affectedRows == 0){
           return res.status(404).json({error: "Device not found"})

        }
        else{
<<<<<<< HEAD
            return res.status(200).json({message: "Device updated successfully!"})
=======
            return res.status(200).json({message: "Device updated successfully!"});
            return res.json(rows)
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
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

//API to Login User

app.post('/login',(req,res) => {
    const email = req.body.email
    const password = req.body.password
<<<<<<< HEAD
    con.query('select * from users where email = ? and password = ?',[email],[password],(err,row)=>{
=======
    con.query('select * from users where username = ? and password = ?',[email],[password],(err,row)=>{
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
        if(err){
            res.status(500).json({error: err})
        }
        else if(row.affectedRows == 0){
            res.status(403).json({error: "Forbidden: User does not exist. Please Sign Up!"});
        }
        else{
            res.status(200).json(rows);
        }
    })
})

//API for Signing Up the User

app.post('/signup',(req,res) => {
<<<<<<< HEAD
    const fn = req.body.first_name
    const ln = req.body.last_name
    const email = req.body.email
    const password = req.body.password
    con.query('Insert into users (first_name,last_name,email,password) values (?,?,?)',[fn],[ln],[email],[password],(err,row)=>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});

        }
    })
})

//create user from the UI

//All users
app.get('/users',(res) =>{

    con.query('select * from users',(err,rows)=>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
            return res.json(rows)
        }
    })
})

//Specific user by ID

app.get('/users/:id',(req,res) =>{
    const id =  req.body.id
    con.query('select * from users where id = ?',[id],(err,row)=>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
            return res.json(row)
        }
    })
})

//Add user into NetScan

app.post('/users',(req,res) =>{
    const fn = req.body.first_name
    const ln = req.body.last_name
    const email = req.body.email
    const password = req.body.password
    con.query('Insert into users (first_name,last_name,email,password) values (?,?,?)',[fn],[ln],[email],[password],(err,row)=>{
=======
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    con.query('Insert into users (full_name,email,password) values (?,?,?)',[name],[email],[password],(err,row)=>{
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
        }
    })
})
<<<<<<< HEAD

//Update users

app.patch('/users/:id',(req,res) =>{
    const id =  req.body.id
    const fn = req.body.first_name
    const ln = req.body.last_name
    const email = req.body.email
    const password = req.body.password
   let data = [];
    let values = [];

    if (first_name) {
        data.push("first_name = ?");
        values.push(fn);
    }
    if (last_name) {
        data.push("last_name = ?");
        values.push(ln);
    }
    if (email) {
        data.push("email = ?");
        values.push(email);
    }
    if (password) {
        data.push("user_password = ?");
        values.push(password);
    }

    //Data check

    if (data.length == 0) {
        return res.status(400).json({error: "no valid data provided to update!"})
    }

    con.query('Update users (first_name.last_name,email,user_password,) SET ${data.join(", ")} where id = ?',[id],[fn],[ln],[email],[password],(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
           return res.status(200).json({message: "Success"});
        }
    })
})

//Site update via API

app.get('/sites',(res) =>{

    con.query('select * from sites',(err,rows)=>{
        if(err){
          return res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
            return res.json(rows)
        }
    })
})

//Specific user by ID

app.get('/sites/:id',(req,res) =>{
    const id =  req.body.id
    con.query('select * from sites where id = ?',[id],(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
            return res.json(row)
        }
    })
})

//Add user into NetScan

app.post('/sites',(req,res) =>{
    const name = req.body.name
    const type = req.body.type
    const status = req.body.status
    const desc = req.body.description
    const agent_id = req.body.agent_id
    const ip_range = req.body.ip_range
    con.query('Insert into sites (site_name,site_type,site_status,site_description,agent_id,ip_range) values (?,?,?,?,?,?)',[name],[type],[status],[desc],[agent_id],[ip_range],(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
            return res.status(200).json({message: "Success"});
        }
    })
})

//Update users

app.patch('/sites/:id',(req,res) =>{
    const name = req.body.name
    const type = req.body.type
    const status = req.body.status
    const desc = req.body.description
    const agent_id = req.body.agent_id
    const ip_range = req.body.ip_range

    let data = [];
    let values = [];

    if (name) {
        data.push("site_name = ?");
        values.push(name);
    }
    if (type) {
        data.push("site_type = ?");
        values.push(type);
    }
    if (status) {
        data.push("site_status = ?");
        values.push(status);
    }
    if (desc) {
        data.push("site_description = ?");
        values.push(desc);
    }
    if (agent_id) {
        data.push("agent_id = ?");
        values.push(agent_id);
    }
        if (ip_range) {
        data.push("ip_range = ?");
        values.push(ip_range);
    }

    //Data check

    if (data.length == 0) {
        return res.status(400).json({error: "no valid data provided to update!"})
    }

    con.query('Update sites (site_name,site_type,site_status,site_description,agent_id,ip_range) SET ${data.join(", ")} where id = ?',[name],[type],[status],[desc],[agent_id],[ip_range],(err,row)=>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
            return res.json(row)
        }
    })
})


//Account settings

app.get('/settings/:id',(req,res) =>{

    const id = req.body.id;

    con.query('select * from account_settings where id = ?',[id],(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
            return res.json(row)
        }
    })
})

//Add user into NetScan

app.post('/account_settings',(req,res) =>{
    const name = req.body.name
    const api_key = req.body.api_key
    const alert = req.body.alert

    con.query('Insert into sites (name, api_key,global_alert) values (?,?,?)',[name],[api_key],[alert],(err)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
            return res.status(200).json({message: "Success"});
        }
    })
})

//Update users

app.patch('/sites/:id',(req,res) =>{
    const name = req.body.name
    const api_key = req.body.api_key
    const alert = req.body.alert

    let data = [];
    let values = [];

    if (name) {
        data.push("company_name = ?");
        values.push(name);
    }
    if (api_key) {
        data.push("api_key = ?");
        values.push(api_key);
    }
    if (alert) {
        data.push("global_alert = ?");
        values.push(alert);
    }


    //Data check

    if (data.length == 0) {
        return res.status(400).json({error: "no valid data provided to update!"})
    }

    con.query('Update sites (company_name,api_key,global_alert) SET ${data.join(", ")} where id = ?',[name],[api_key],[alert],(err,row)=>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});
            return res.json(row)
        }
    })
})
=======
>>>>>>> 6f3e63ad2f66092ef80a1a0e0f644d4da0a5303a
