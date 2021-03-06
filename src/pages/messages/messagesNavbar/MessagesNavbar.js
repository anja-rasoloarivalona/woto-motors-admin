import React, { Component } from 'react'
import './MessagesNavbar.css';
import openSocket from 'socket.io-client'



class MessagesNavbar extends Component {

    state = {
        messages: [],
        requestedMessageUserId: ''
    }

    
    componentDidUpdate(prevProps){

        if(prevProps.messages[0]._id !== this.props.messages[0]._id){
            this.setState({ messages: this.props.messages })
        }
    }

    componentWillUnmount() {
        this._ismounted = false;
     }

    componentDidMount(){
        this._ismounted = true;
        this.setState({ messages: this.props.messages, requestedMessageUserId: this.props.requestedMessageUserId});
        const socket = openSocket('https://africauto.herokuapp.com');

            socket.on('userSentMessage', data => {
            if(this._ismounted === true){
                let messageData = data.messageData;
                let userId = messageData.userId;
                //find the user discussion to be updated and pull it 
                let convoToBeUpdated = this.state.messages.filter( i => i._id === userId)[0];
                //update the last message of that discussion
                convoToBeUpdated.messages[0] = messageData
               
                this.checkIfAdminIsOnTheConvoToBeUpdated(userId, convoToBeUpdated)
            }
            else return        
        })
    }

    checkIfAdminIsOnTheConvoToBeUpdated = (userId, convoToBeUpdated) => {
        let check = userId === this.state.requestedMessageUserId;
        let data = convoToBeUpdated;
        //delete the previous discussion
        let newState = this.state.messages.filter( i => i._id !== userId);
        if(check){
            data.messages[0].read = true
        } 
        this.setState({
            messages: [data, ...newState]
        }, () => console.log(this.state.messages))

    }

    
    onChangeConvoHandler = userId => { 
        //find the user discussion to be updated and pull it 
        let convoToBeUpdated = this.state.messages.filter( i => i._id === userId)[0];
        let convoToBeUpdatedIndex = this.state.messages.findIndex(i => i._id === userId);

        if(convoToBeUpdated.messages.length > 0){
            //update the last message of that discussion
            convoToBeUpdated.messages[0].read = true;
            let newMessages = [...this.state.messages];
            newMessages[convoToBeUpdatedIndex] = convoToBeUpdated;
            this.setState({ requestedMessageUserId: userId, messages: newMessages});
        } else {
            this.setState({ requestedMessageUserId: userId });
        }
        this.props.onchangeConvoHandler(userId);
    }
    render() {

        const {messages } = this.state;

        return (
            <nav className="messagesNavbar">
            <ul className="messagesNavbar__list">
                {messages && messages.map(message => {
                        if(message.messages.length > 0){
                            return (
                                <li className={`messagesNavbar__list__item
                                                ${this.state.requestedMessageUserId === message._id ? 'active': ''}
                                                ${message.messages[0].read === true || message.messages[0].senderType === 'admin' ? '' : 'not-read'}   
                                    `}
                                    key={message._id}
                                    onClick={() => this.onChangeConvoHandler(message._id)}>
                                    <div className="messagesNavbar__list__item__avatar">
                                        {`${message.firstName.slice(0, 1)}${message.lastName.slice(0, 1)}`}
                                    </div>  
                                    <div className="messagesNavbar__list__item__message">
                                            <div className="messagesNavbar__list__item__message__name">{`${message.firstName} ${message.lastName}`}</div>
                                            {message.messages[0].senderType === 'admin' && (
                                                    <span>admin: {
                                                        message.messages[0].message.slice(0, 25)}...
                                                    </span>
                                            )}
                                            {message.messages[0].senderType === 'user' && (
                                                    <span>{message.messages[0].message.slice(0, 25)}...</span>
                                            )}
                                    </div>                                   
                                </li>
                            )
                        } else {
                            return (
                                <li className={`messagesNavbar__list__item
                                                ${this.state.requestedMessageUserId === message._id ? 'active': '' }`}
                                    key={message._id}
                                    onClick={() => this.onChangeConvoHandler(message._id)}>
                                    <div className="messagesNavbar__list__item__avatar">
                                        {`${message.firstName.slice(0, 1)}${message.lastName.slice(0, 1)}`}
                                    </div>
                                    <div className="messagesNavbar__list__item__message">
                                            <div className="messagesNavbar__list__item__message__name">{`${message.firstName} ${message.lastName}`}</div >
                                    </div>
                                </li>
                            )
                          }
                })}
            </ul>
        
        </nav>
        )
    }
}


export default MessagesNavbar;



                           
