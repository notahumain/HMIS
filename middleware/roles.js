export function allow(...roles){
  return (req,res,next)=>{
    if(!req.user||!roles.includes(req.user.role))return res.status(403).json({error:'forbidden'})
    next()
  }
}