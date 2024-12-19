import express, { Application, Request, Response } from "express";


const app: Application = express()

app.use(express.json())

// error handler
app.use( (err:Error, req: Request, res:Response):void  =>{
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    console.log(err, 'error')
    res.status(500);
     res.json({
      message: err.message,
      error: err
    });
  });

  export default app 