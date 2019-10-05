import React, { Component, Fragment } from 'react';
import './MessagesContainer.css';
import openSocket from 'socket.io-client';
import {timeStampGenerator} from '../../../utilities/timeStampGenerator';
import { connect } from 'react-redux'
 
 class MessagesContainer extends Component {

    state = {
        messages: [],

        messageInput: '',
        userId: ''
       
    }

    componentDidMount(){

        this.setState({messages: this.props.messages, userId: this.props.userId},
            () => console.log('mounted',this.state.messages));

        const socket = openSocket('http://localhost:8000');


        socket.on('userSentMessage', data => {

            if(data.messageData.userId === this.state.userId){
                let url = "http://localhost:8000/messages/admin-update/" + this.state.userId;
                let method = "POST";

                let timeStamp = timeStampGenerator();

                    fetch(url, {
                        method: method,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            adminName: this.props.adminName,
                            timeStamp: timeStamp
                        })
                    })
                    .then( res => {
                        if(res.status !== 200)
                        throw new Error('Failed to fetch messages')

                        return res.json()
                    })
                    .then(resData => {
                        let lastposition = resData.messages.messages.length - 1
                        this.addMessages(resData.messages.messages[lastposition])    
                    })
                    .catch( err => {
                        console.log(err)
                    })
            }
        })
    }


    componentDidUpdate(prevProps){
        if(prevProps.userId !== this.props.userId){
            this.setState({messages: this.props.messages, userId: this.props.userId});
        }
    }
    

    messageChangeHandler = (e) => {
        this.setState({ messageInput: e.target.value})
    }


    handleKeyDown = (e) => {

        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`; 
        // In case you have a limitation
        // e.target.style.height = `${Math.min(e.target.scrollHeight, limit)}px`
      }

      keypress = e => {
        if(e.key === 'Enter'){
            e.preventDefault();
            this.sendMessageHandler()   
        }
      }

      sendMessageHandler = () => {
        let timeStamp = timeStampGenerator();

        let url = "http://localhost:8000/messages/admin/" + this.props.userId;
        let method = "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: this.props.adminName,
                message: this.state.messageInput,
                timeStamp: timeStamp
            })
        })
        .then( res => {
            console.log('sent baby');
            return res.json()

        })
        .then( resData => {
            this.addMessages(resData.data);
            this.setState({ messageInput: ''});
            this.props.updateNavbar(resData.data);

        })
        .catch( err => {
            console.log(err)
        })
      }


      


      addMessages = message => {
        this.setState(prevState => ({
            messages: [...prevState.messages, message]
        }), () => console.log(this.state.messages))

    }


    render() {

    
        return (
            <section className="messagesContainer">
                <div className="messagesContainer__body">
                {
                          this.state.messages.length !== 0 && this.state.messages.map( message => (


                                <div key={message._id}>
                                        <div className={`messagesContainer__body__chat messagesContainer__body__chat--${message.senderType === 'user' ? 'user' : 'admin'}`}>
                                            {message.message}
                                        </div>

                                        <div className="messagesContainer__body__chat__detail">
                                                {
                                                    message.senderType === 'user' && (
                                                        <Fragment>
                                                        <span>
                                                            {message.timeStamp}
                                                        </span>
                                                        <span>
                                                            Lu par {message.readBy} le {message.readByTimeStamp}
                                                        </span>
                                                        </Fragment>
                                                        
                                                    )
                                                }

                                                {
                                                    message.senderType === 'admin' && (
                                                        <Fragment>
                                                        <span>
                                                            {message.timeStamp} - {message.from}
                                                        </span> 
                                                        {
                                                            message.read === true && (
                                                                    <span>   Lu le {message.readByTimeStamp} </span>
                                                            )
                                                        }

                                                        {
                                                            message.read === false && (
                                                                    <span>Non lu</span>
                                                            )
                                                        }
                                                            
                                                        
                                                        </Fragment>
                                                        
                                                    )
                                                }
                                        </div>

                                </div>
                            ))
                        }
                </div>
                <div className="messagesContainer__input">
                    <textarea className="messagesContainer__textarea"
                             value={this.state.messageInput}
                             onChange={(e) => this.messageChangeHandler(e)}
                             placeholder='message'
                             onKeyDown={this.handleKeyDown}
                             onKeyPress={this.keypress}>
                             
                    </textarea>
                    
                </div>
                <div className="messagesContainer__cta">

                </div>
            </section>
        )
    }
} 


const mapStateToPros = state => {
    return {
        adminName: state.auth.adminName
    }
}

export default connect(mapStateToPros)(MessagesContainer);