import React from 'react';
type State = {
    chatEntryText:string,
};
class Chatroom extends React.Component<{}, State> {
    private d_websocket:WebSocket;
    constructor(props) {
        super(props);
        this.state = {
            chatEntryText: "",
        };
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.d_websocket = new WebSocket("ws://localhost:9000/api/chatroom/subscribe");
        this.setupWebsocket();
    }

    render() {
        return (
            <div>
                <ul className="chat-messages">
                </ul>
                <footer className="chat-footer">
                    <form className="message-form" onSubmit={this.handleSendMessage}>
                    <input
                        type="text"
                        name="chatEntry"
                        className="message-input"
                        placeholder="Type your message and hit ENTER to send"
                        onChange={this.handleChatEntryChange.bind(this)}
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
        this.d_websocket.send(JSON.stringify({
            chatText: this.state.chatEntryText
        }));
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