const express = require('express');
const con = require('./DB_connection.js');
const conf = require('../server/config.js');
const app = express();
//const amqp = require('amqplib');
//const Memcached = require('memcached');
const cors = require('cors')

//const cache = new Memcached(conf.MEM_URL)

app.use(cors());
app.use(express.json());

const port = 8000;

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

//async function conamq() {
//    const con = await amqp.connect(conf.RBMQ_URL);
//    chnl = await amqp.connect.createChannel();
//    await chnl.assertQueue(scan_task,{ durable: true });
//}

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

    con.query('INSERT INTO network_device (ip_addr,hostname,device_type,operating_system,mac_addr,vendor) VALUES (?,?,?,?,?,?)',[ip,hostname,device_type,os,mac,vendor],(err,row) =>{
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
           return res.status(500).json({error: err});
        }
        else if(row.affectedRows == 0){
           return res.status(404).json({error: "Device not found"})

        }
        else{
            return res.status(200).json({message: "Device updated successfully!"});
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
    con.query('select * from users where email = ? and password = ?',[email,password],(err,row)=>{
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
    const fn = req.body.first_name
    const ln = req.body.last_name
    const email = req.body.email
    const password = req.body.password
    con.query('Insert into users (first_name,last_name,email,user_password) values (?,?,?,?)',[fn,ln,email,password],(err,row)=>{
        if(err){

            if (err.code === 'ER_DUP_ENTRY'){

                return res.status(409).json({error: "Email or username already exist"})
            }
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success"});

        }
    })
})

//create user from the UI

//All users
app.get('/users',(req, res) => {

    con.query('select * from users',(err,row)=>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success", data: row });

        }
    })
});

//Specific user by ID

app.get('/user/:id',(req,res) =>{
    const id =  req.params.id
    con.query('select * from users where id = ?',[id],(err,row)=>{
        if(err){
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success", data: row });
        }
    })
})

//Add user into NetScan

app.post('/user',(req,res) => {
    const fn = req.body.first_name
    const ln = req.body.last_name
    const email = req.body.email
    const password = req.body.user_password
    con.query('Insert into users (first_name,last_name,email,user_password) values (?,?,?,?)',[fn,ln,email,password],(err,row)=>{
        if(err){
            
            if (err.code === 'ER_DUP_ENTRY'){

                return res.status(409).json({error: "Email or username already exist"})
            }
            res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success", data: row });

        }
    })
});

//Update users

app.patch('/user/:id',(req,res) =>{
    const id =  req.params.id
    const fn = req.body.first_name
    const ln = req.body.last_name
    const email = req.body.email
    const password = req.body.password
   let data = [];
    let values = [];

    if (fn) {
        data.push("first_name = ?");
        values.push(fn);
    }
    if (ln) {
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

    values.push(id);

    const sql = `Update users SET ${data.join(", ")} where id = ?`;

    con.query(sql, values ,(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
           return res.status(200).json({message: "Success"});
        }
    })
})

//Delete user

app.delete("/user/:id",(req,res) => {
    const id = req.params.id;
    con.query('delete from users where id = ?',[id],(err,row) =>{
        if(err){
            res.status(500).json({error: err})
        }
        else if(row.affectedRows == 0){
            res.status(404).json({error: "User does not exist"});
        }
        else{
            res.status(200).json({message: "User was successfully deleted!"});
        }
    });
});


//Site update via API

app.get('/sites',(req,res) =>{

    con.query('select * from sites',(err,row)=>{
        if(err){
          return res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success",data: row});
        }
    })
})

//Specific user by ID

app.get('/site/:id',(req,res) =>{
    const id =  req.params.id
    con.query('select * from sites where id = ?',[id],(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success", data: row});

        }
    })
})

//Add user into NetScan

app.post('/site',(req,res) =>{
    const name = req.body.name
    const type = req.body.type
    const status = req.body.status
    const desc = req.body.description
    const agent_id = req.body.agent_id
    const ip_range = req.body.ip_range
    con.query('Insert into sites (site_name,site_type,site_status,site_description,agent_id,ip_range) values (?,?,?,?,?,?)',[name,type,status,desc,agent_id,ip_range],(err,row)=>{
        if(err){
            if (err.code === 'ER_DUP_ENTRY') {

                return res.status(400).json({message: "Site already exists!"});
            }
            return res.status(500).json({error: err});
        }
        else{
            return res.status(200).json({message: "Success"});
        }
    })
})

//Update users

app.patch('/site/:id',(req,res) =>{
    const id =  req.params.id
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

     if (data.length == 0) {
        return res.status(400).json({error: "no valid data provided to update!"})
    }

    values.push(id);

    const sql = `Update sites SET ${data.join(", ")} where id = ?`;

    con.query(sql, values ,(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
           return res.status(200).json({message: "Success"});
        }
    })
})

//Delete site

app.delete("/site/:id",(req,res) => {
    const id = req.params.id;
    con.query('delete from sites where id = ?',[id],(err,row) =>{
        if(err){
            res.status(500).json({error: err})
        }
        else if(row.affectedRows == 0){
            res.status(404).json({error: "Site does not exist"});
        }
        else{
            res.status(200).json({message: "Site was successfully deleted!"});
        }
    });
});


//Account settings

app.get('/settings/:id',(req,res) =>{

    const id = req.params.id;

    con.query('select * from account_settings where id = ?',[id],(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
            res.status(200).json({message: "Success", data: row});
        
        }
    })
})

//Add account settings into NetScan

app.post('/settings',(req,res) =>{
    const name = req.body.company_name
    const api_key = req.body.api_key
    const alert = req.body.global_alert

    con.query('Insert into account_settings (company_name,api_key,global_alert) values (?,?,?)',[name,api_key,alert],(err)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
            return res.status(200).json({message: "Success"});
        }
    })
})

//Update users

app.patch('/settings/:id',(req,res) =>{
    const id =  req.params.id
    const name = req.body.company_name
    const api_key = req.body.api_key
    const alert = req.body.global_alert

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

     if (data.length == 0) {
        return res.status(400).json({error: "no valid data provided to update!"})
    }

    values.push(id);

    const sql = `Update account_settings SET ${data.join(", ")} where id = ?`;

    con.query(sql, values ,(err,row)=>{
        if(err){
            return res.status(500).json({error: err});
        }
        else{
           return res.status(200).json({message: "Success"});
        }
    })
})
