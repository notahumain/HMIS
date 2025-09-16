import jwt from 'jsonwebtoken'
import cfg from '../config.js'
export function auth(req,res,next){
  const h=req.headers.authorization||''
  const t=h.startsWith('Bearer ')?h.slice(7):null
  if(!t)return res.status(401).json({error:'unauthorized'})
  try{
    const p=jwt.verify(t,cfg.jwtSecret)
    req.user=p
    next()
  }catch(e){
    res.status(401).json({error:'unauthorized'})
  }
}