import React from 'react';

type State = {

};
class Chatroom extends React.Component<{}, State> {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.handleSendMessage = this.handleSendMessage.bind(this);
    }

    render() {
        return (
            <div>
                <aside className="sidebar left-sidebar"></aside>
                <section className="chat-screen">
                    <header className="chat-header"></header>
                    <ul className="chat-messages"></ul>
                    <footer className="chat-footer">
                        <form className="message-form" onSubmit={this.handleSendMessage}>
                        <input
                            type="text"
                            name="newMessage"
                            className="message-input"
                            placeholder="Type your message and hit ENTER to send"
                        />
                        </form>
                    </footer>
                </section>
                <aside className="sidebar right-sidebar"></aside>
            </div>
        );
    }

    private async handleSendMessage(evt) {
        evt.preventDefault();
    }
}

export default Chatroom;