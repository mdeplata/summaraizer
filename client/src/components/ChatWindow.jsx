import { useState } from 'react'
import './styling/ChatWindow.css'

export default function ChatWindow() {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0])
    }

    const handleUpload = () => {

    }

    return (
        <main>
            <section className="chat-container">
                <div className="chat-header">
                    <h3>SummarAI: PDF Query Bot</h3>
                </div>
                <div className="chat-conversation-container">
                    <div className="chat-bubble human-chat">What is ...?</div>
                    <div className="chat-bubble ai-chat">AI response...</div>
                </div>
                <div className="user-container">
                    <form className="chat-input-container">
                        <input name="user-input" type="text" id="user-input" required />
                        <button id="submit" className="submit-button">
                            <svg viewBox="0 0 27 33" className="submit-icon">
                                <path d="M4.53248 16.0788L2.0004 30.7978L24.7891 16.0788L2.00041 1.35974L4.53248 16.0788ZM4.53248 16.0788L14.6608 16.0788" stroke-width="2.53207" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </form>
                    <div className="file-upload-container">
                        <input type="file" accept=".pdf" onChange={handleFileChange} />
                        <button onClick = {handleUpload}>Upload PDF</button>
                    </div>
                </div>
            </section>
        </main>
    )
}