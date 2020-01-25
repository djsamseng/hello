import React from 'react';


type Message = {
    id:string,
    senderId:string,
    message:string,
    updateTime:Date,
};
type State = {
    chatEntryText:string,
    messages:Array<Message>,
};

class Chatroom extends React.Component<{}, State> {
    private d_websocket:WebSocket;
    constructor(props) {
        super(props);
        this.state = {
            chatEntryText: "",
            messages: [],
        };
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.d_websocket = new WebSocket("ws://localhost:9000/api/chatroom/subscribe");
        this.setupWebsocket();
    }

    render() {
        const messages = this.state.messages.map(message => {
            return (
                <li className="message" key={message.id}>
                    <div>
                        <span className="user-id">{message.senderId}</span>
                        <span>{message.message}</span>
                    </div>
                    <span className="message-time">{`${message.updateTime}`}</span>
                </li>
            )
        });
        return (
            <div>
                <ul className="chat-messages">
                    { messages }
                </ul>
                <footer className="chat-footer">
                    <form className="message-form" onSubmit={this.handleSendMessage}>
                    <input
                        type="text"
                        name="chatEntry"
                        className="message-input"
                        placeholder="Type your message and hit ENTER to send"
                        onChange={this.handleChatEntryChange.bind(this)}
                        value={this.state.chatEntryText}
                    />
                    </form>
                </footer>

            </div>
        );
    }

    private handleChatEntryChange(evt) {
        this.setState({
            chatEntryText: evt.target.value,
        });
    }

    private async handleSendMessage(evt) {
        evt.preventDefault();
        const newMessages = this.state.messages.concat([{
            id: `${Math.floor(Math.random() * 10000)}`,
            senderId: "Sam",
            message: this.state.chatEntryText,
            updateTime: new Date(),
        }]);
        this.d_websocket.send(JSON.stringify({
            chatText: this.state.chatEntryText
        }));

        this.setState({
            messages: newMessages,
            chatEntryText: "",
        });
    }

    private async setupWebsocket() {
        this.d_websocket.onopen = (evt) => {
            console.log("Open websocket sending request to open server side");
            // this.test();
            // Required for server to receive / open
            this.d_websocket.send("Open websocket");
        };
        this.d_websocket.onmessage = (message) => {
            console.log("RECEIVE:", message.data);
        };
    }
}

export default Chatroom;