import express from 'express'
import {pool} from '../db.js'
import {auth} from '../middleware/auth.js'
import {allow} from '../middleware/roles.js'
const r=express.Router()
r.get('/',auth,async(req,res)=>{
  const [rows]=await pool.query('SELECT b.id,b.patient_id,b.amount,b.status,b.created_at,p.name patient FROM bills b JOIN patients p ON b.patient_id=p.id ORDER BY b.id DESC')
  res.json(rows)
})
r.post('/',auth,allow('admin','receptionist'),async(req,res)=>{
  const {patient_id,items}=req.body
  if(!patient_id||!Array.isArray(items)||!items.length)return res.status(400).json({error:'bad_request'})
  const conn=await pool.getConnection()
  try{
    await conn.beginTransaction()
    const total=items.reduce((s,i)=>s+(Number(i.price)*Number(i.qty||1)),0)
    const [b]=await conn.query('INSERT INTO bills (patient_id,amount) VALUES (?,?)',[patient_id,total])
    const bid=b.insertId
    for(const i of items){
      await conn.query('INSERT INTO bill_items (bill_id,item,price,qty) VALUES (?,?,?,?)',[bid,i.item,i.price,i.qty||1])
    }
    await conn.commit()
    res.json({id:bid,amount:total})
  }catch(e){
    await conn.rollback()
    res.status(400).json({error:'failed'})
  }finally{
    conn.release()
  }
})
r.put('/:id/pay',auth,allow('admin','receptionist'),async(req,res)=>{
  await pool.query('UPDATE bills SET status="paid" WHERE id=?',[req.params.id])
  res.json({ok:true})
})
r.get('/:id/items',auth,async(req,res)=>{
  const [rows]=await pool.query('SELECT * FROM bill_items WHERE bill_id=?',[req.params.id])
  res.json(rows)
})
export default r