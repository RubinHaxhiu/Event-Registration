var express = require('express');
var router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/signup', async function(req, res, next){
  const {email, username, password} = req.body;

try {
const result = await db.query(
  'INSERT INTO users(email, username, password) VALUES ($1, $2, $3) RETURNING *',
  [email, username, password]
)  

  const user = result.rows[0];
    const secretKey = 'secret';  
    const token = jwt.sign({ id: user.id }, secretKey);

res.json({ user: user, token: token });

} catch (err) {
  
console.error(err)
res.status(500).send('Internal Server Error')

}  
})


router.post('/login', async function(req, res, next){
  const {username, password} = req.body

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username])
    
    if (result.rows.length > 0) {
      const user = result.rows[0];

      if(user.password === password) {
        const token = jwt.sign({ id: user.id }, 'secret')
        res.json({ message: 'Logged in successfully', token, user: {id: user.id, username:username} })
      } else{
        res.status(401).json({ message: 'Incorrect password'})
      }
    } else{
      res.status(404).json('User not found')
    }
    
  } catch (err) {
    console.error(err)
    res.status(500).send('Internal Server Error')
  }

})

router.post('/api/events', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]
  const decoded = jwt.verify(token, 'secret')

  const {name, description, date, location} = req.body

  try {
    const newEvent = await db.query(
      "INSERT INTO events (name, description, date, location, organizer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, date, location, decoded.id]
    )

    res.json(newEvent.rows[0]);
    
  } catch (err) {
    console.log(err.message)
  }
})

router.get('/api/events', async (req, res) => {
  try {
    const allEvents = await db.query("SELECT * FROM events");
    res.json(allEvents.rows)
  } catch (err) {
    console.log(err.message);
  }
})

router.put('/api/events/:id', async (req, res) => {
  
    console.log('Received PUT request with ID:', req.params.id); // <= Add this
    console.log('Received PUT request with body:', req.body); // <= Add this

  const token = req.headers.authorization.split(' ')[1]
  const decoded = jwt.verify(token, 'secret')

  const{name, description, date, location} = req.body
  const id = req.params.id

  const eventResult = await db.query ('SELECT * FROM events WHERE event_id = $1', [id])
  const event = eventResult.rows[0]

  if(!event){
    return res.status(404).send('Event not found')
  }

  const organizer_id = event.organizer_id

  if(decoded.id !== organizer_id){
    return res.status(403).send('Unauthorized')
  }

  try {
    const updatedEvent = await db.query(
      "UPDATE events SET name = $1, description = $2, date = $3, location = $4 WHERE event_id = $5 RETURNING *",
      [name, description, date, location, id]
    )

    res.json(updatedEvent.rows[0])
    
  } catch (error) {
    console.log(err.message)
  }
})

router.delete('/api/events/:id', async (req, res)=> {
  const token = req.headers.authorization.split(' ')[1]
  const decoded = jwt.verify(token, 'secret')

  const id = req.params.id

  const eventResult = await db.query ('SELECT * FROM events WHERE event_id = $1', [id])
  const event = eventResult.rows[0]

  if (!event) {
    return res.status(404).send('Event not found')
  }

  const organizer_id = event.organizer_id

  if(decoded.id !== organizer_id){
    return res.status(403).send('Unathorized')
  }

  try {

    const deletedEvent = await db.query(
      "DELETE FROM events WHERE event_id = $1",
      [id]
    )

    res.json({message: 'Event deleted'})
    
  } catch (err) {
    console.log(err.message);
  }
})

router.get('/api/events/:id/attendees', async (req, res)=>{
  const id = req.params.id
  const token = req.headers.authorization.split(' ')[1]
  const decoded = jwt.verify(token, 'secret')
  const user_id = decoded.id

  const attendeesResult = await db.query(
    'SELECT users.username FROM  attendees INNER JOIN users ON attendees.user_id = users.id WHERE attendees.event_id =$1',
     [id]
     )
  const attendees = attendeesResult.rows

  const attendanceResult = await db.query('SELECT * FROM attendees WHERE user_id = $1 AND event_id = $2', [user_id, id])
  const isAttending = Boolean(attendanceResult.rows[0])
  
  res.json({attendees, isAttending})
})

router.post('/api/events/:id/attend', async (req, res) =>{
  const token = req.headers.authorization.split(' ')[1]
  const decoded = jwt.verify(token, 'secret')

  const id = req.params.id
  const user_id = decoded.id

  const attendanceResult = await db.query('SELECT * FROM attendees WHERE user_id = $1 AND event_id = $2', [user_id, id])
  const attendance = attendanceResult.rows[0]

  if (attendance) {

    await db.query('DELETE FROM attendees WHERE user_id = $1 AND event_id = $2', [user_id, id])
    
  } else {
    
    await db.query ('INSERT INTO attendees (user_id, event_id) VALUES ($1, $2) RETURNING *', [user_id, id])

  }

  
  res.json({message: 'Attendance updated'})

})

module.exports = router;
