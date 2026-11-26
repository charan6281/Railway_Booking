require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Station = require('../models/Station');
const Train = require('../models/Train');
const Schedule = require('../models/Schedule');
const Admin = require('../models/Admin');
const TrainRoute = require('../models/TrainRoute');

const stations = [
 ['HYB','Hyderabad Deccan','Hyderabad'],['SC','Secunderabad Junction','Secunderabad'],
 ['VSKP','Visakhapatnam','Visakhapatnam'],['BZA','Vijayawada Junction','Vijayawada'],
 ['MAS','Chennai Central','Chennai'],['NDLS','New Delhi','Delhi'],
 ['MMCT','Mumbai Central','Mumbai'],['SBC','Bangalore City','Bengaluru']
];
const trains = [
 ['12727','Godavari Express','HYB','VSKP','17:30','05:50','12h 20m',[['SL',420,500],['3A',1150,180],['2A',1650,90],['1A',2800,24]]],
 ['12728','Godavari Express','VSKP','HYB','17:20','05:40','12h 20m',[['SL',420,500],['3A',1150,180],['2A',1650,90],['1A',2800,24]]],
 ['12760','Charminar Express','HYB','MAS','18:00','08:15','14h 15m',[['SL',390,450],['3A',1050,160],['2A',1500,80],['1A',2500,20]]],
 ['12604','Chennai Express','HYB','MAS','16:45','07:10','14h 25m',[['SL',400,450],['3A',1100,160],['2A',1550,80]]],
 ['12709','Simhapuri Express','SC','VSKP','22:00','09:10','11h 10m',[['SL',380,400],['3A',1050,150],['2A',1500,70]]],
 ['12706','Intercity Express','SC','BZA','06:00','10:15','4h 15m',[['SL',160,350],['3A',450,90],['2A',650,40]]],
 ['12723','Telangana Express','HYB','NDLS','06:00','06:30','24h 30m',[['SL',650,500],['3A',1750,180],['2A',2450,90],['1A',4200,24]]],
 ['12295','Sanghamitra Express','SBC','NDLS','09:00','18:30','33h 30m',[['SL',800,500],['3A',2100,180],['2A',2900,90]]],
 ['12164','Chennai Express','MAS','MMCT','18:20','22:00','27h 40m',[['SL',700,500],['3A',1900,180],['2A',2600,90]]],
 ['12702','Hussainsagar Express','HYB','MMCT','21:50','10:30','12h 40m',[['SL',450,500],['3A',1250,180],['2A',1750,90]]]
];
async function seed() {
  await connectDB();
  await Promise.all([Station.deleteMany({}), Train.deleteMany({}), Schedule.deleteMany({}), TrainRoute.deleteMany({})]);
  const docs = await Station.insertMany(stations.map(([code,name,city]) => ({code,name,city})));
  const byCode = Object.fromEntries(docs.map(s => [s.code,s]));
  for (const row of trains) {
    const [number,name,src,dst,departureTime,arrivalTime,duration,classes] = row;
    const train = await Train.create({ number,name,source:byCode[src]._id,destination:byCode[dst]._id,departureTime,arrivalTime,duration,classes:classes.map(([code,fare,totalSeats])=>({code,fare,totalSeats})) });
    await TrainRoute.insertMany([{train:train._id,station:byCode[src]._id,sequence:1,departure:departureTime},{train:train._id,station:byCode[dst]._id,sequence:2,arrival:arrivalTime}]);
    for (let i=1;i<=30;i++) {
      const date = new Date(); date.setUTCHours(0,0,0,0); date.setUTCDate(date.getUTCDate()+i);
      await Schedule.create({train:train._id,journeyDate:date,availability:classes.map(([code,,totalSeats])=>({code,seats:totalSeats}))});
    }
  }
  const email = (process.env.ADMIN_EMAIL || 'admin@railway.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  await Admin.deleteMany({email});
  await Admin.create({name:'Railway Admin',email,password:await bcrypt.hash(password,12)});
  console.log('Seed complete: 8 stations, 10 trains, 30 days of schedules, admin account.');
  console.log(`Admin login: ${email} / ${password}`);
  await mongoose.disconnect();
}
seed().catch(e=>{console.error(e);process.exit(1);});
