import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { Button, Form, Modal, Card } from "react-bootstrap"
import { useState } from "react"
import { useEffect } from "react"

const Home = () => {

const navigate = useNavigate()
const location = useLocation()
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token')


if(!token || !user) {
    navigate('/login')    
}

const [showModal, setShowModal] = useState(false)
const [eventName, setEventName] = useState("")
const [eventDescription, setEventDescription] = useState("")
const [eventDate, setEventDate] = useState("")
const [eventLocation, setEventLocation] = useState("")
const [events, setEvents] = useState([])

const handleOpenModal = () => setShowModal(true)
const handleCloseModal = () => setShowModal(false)

const handleAddEvent = (e) =>{
    e.preventDefault();

    const event ={
        name: eventName,
        description: eventDescription,
        date: eventDate,
        location: eventLocation,
    }

    axios.post('http://localhost:5000/users/api/events', event, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res=> {
        console.log(res.data)
    })
    .catch(err =>{
        console.error(err)
    })

    handleCloseModal()

}

useEffect(() => {
    axios.get('http://localhost:5000/users/api/events', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {
        setEvents(res.data)
    })
}, [])

const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem('user');
    navigate('/login')

    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function(event) {
        window.history.go(1);
    };
}

return(
    <div>
        <div>
        <h1>Hello {user.username}</h1>
        <Button onClick={handleLogout}>Log Out</Button>
        </div>

        <Button onClick={handleOpenModal}>Create a new event</Button>

        <Modal show={showModal} onHide={handleCloseModal}>
            <Form onSubmit={handleAddEvent}>
                
                <Form.Group controlId="eventName">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control type="text" value={eventName} onChange={e => setEventName(e.target.value)}/>
                </Form.Group>

                <Form.Group controlId="eventDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} value={eventDescription} onChange={e => setEventDescription(e.target.value)}/>
                </Form.Group>

                <Form.Group controlId="eventDate">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}/>
                </Form.Group>

                <Form.Group controlId="eventLocation">
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" value={eventLocation} onChange={e => setEventLocation(e.target.value)}/>
                </Form.Group>

                <Button variant="primary" type="submit">Submit</Button>

            </Form>
        </Modal>

        {events.map(event => (
            <EventCard key={event.event_id} event={event} token={token} user={user} />
        ))}

    </div>
)

}

const EventCard = ({event, token, user}) =>{
    
    console.log('Event object:', event)
    
    const [showEditModal, setShowEditModal] = useState(false)
    const [editedEvent, setEditedEvent] = useState(event)

    const [updatedName, setUpdatedName] = useState(event.name);
    const [updatedDescription, setUpdatedDescription] = useState(event.description);
    const [updatedDate, setUpdatedDate] = useState(event.date)
    const [updatedLocation, setUpdatedLocation] = useState(event.location)

    const [isAttending, setIsAttending] = useState(false)

    const [attendees, setAttendees] = useState([])

    useEffect(()=>{
        axios.get(`http://localhost:5000/users/api/events/${event.event_id}/attendees` , {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            setAttendees(res.data.attendees)
            setIsAttending(res.data.isAttending)
        })
        .catch(err=>{
            console.error(err)
        })
    }, [event.event_id])

    const handleAttend = () =>{
        axios.post(`http://localhost:5000/users/api/events/${event.event_id}/attend`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            console.log(res.data)

            axios.get(`http://localhost:5000/users/api/events/${event.event_id}/attendees`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            .then(res => {
                setAttendees(res.data.attendees);
                setIsAttending(res.data.isAttending)
                setIsAttending(!isAttending)
            })
            .catch(err => {
                console.error(err)
            })
        })
        .catch(err =>{
            console.error(err)
        })
    }

    const handleOpenEditModal = () => {
        setShowEditModal(true)
        setEditedEvent(event)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false);
      }
      

    const handleEdit = (id) => {


       const eventDetails = {
            name: updatedName,
            description: updatedDescription,
            date: updatedDate,
            location: updatedLocation,
        }

        setEditedEvent(eventDetails);

        axios.put(`http://localhost:5000/users/api/events/${id}`, eventDetails, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            
        })
        .then(res => {
            console.log(res.data);
        })
        .catch(err => {
            console.error(err);
        });
        
    }

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/users/api/events/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            console.log(res.data);
        })
        .catch(err => {
            console.error(err);
        });
    }

    console.log('User ID:', user.id);
    console.log('Organizer ID:', event.organizer_id);
    console.log(user)

    return(

    <Card style={{ width:'18rem' }}>
        <Card.Body>
            <Card.Title>{event.name}</Card.Title>
            <Card.Text>{event.description}</Card.Text>
            <Card.Text>{event.date}</Card.Text>
            <Card.Text>{event.location}</Card.Text>
            
            {user.id === event.organizer_id && (
              <div>
                <Button variant="warning" onClick = {handleOpenEditModal} >Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(event.event_id)}>Delete</Button>
              </div>
            )}

            {user.id !== event.organizer_id && (
                <Button variant="success" onClick={ handleAttend}>{isAttending ? 'Cancel Attendance' : 'Attend'}</Button>
            )}

            {user.id === event.organizer_id && (
                <div>
                    <h3>Attendees:</h3>
                    <ul>
                        {attendees.map((attendee, index) => (
                            <li key={index}>{attendee.username}</li>
                        ))}
                    </ul>
                </div>
            )}

                <Modal show={showEditModal} onHide={handleCloseEditModal}> 
                    <Form onSubmit={() => handleEdit(event.event_id)}> 
                        
                        <Form.Group controlId="eventName">
                            <Form.Label>Event Name</Form.Label>
                            <Form.Control type="text" value={updatedName} onChange={e => setUpdatedName(e.target.value)}/>
                        </Form.Group>

                        <Form.Group controlId="eventDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} value={updatedDescription} onChange={e => setUpdatedDescription(e.target.value)}/>
                        </Form.Group>

                        <Form.Group controlId="eventDate">
                            <Form.Label>Date</Form.Label>
                            <Form.Control type="date" value={updatedDate} onChange={e => setUpdatedDate(e.target.value)}/>
                        </Form.Group>

                        <Form.Group controlId="eventLocation">
                            <Form.Label>Location</Form.Label>
                            <Form.Control type="text" value={updatedLocation} onChange={e => setUpdatedLocation(e.target.value)}/>
                        </Form.Group>

                        <Button variant="primary" type="submit">Submit</Button>

                    </Form>
                </Modal>

        </Card.Body>
    </Card>
)
}

export default Home