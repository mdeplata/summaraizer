import { useState, useRef, useLayoutEffect } from 'react';
import { Upload, FileText, X, Send } from 'lucide-react';
import axios from 'axios';
import './styling/ChatWindow.css';

export default function ChatWindow() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [chatDialogue, setChatDialogue] = useState([]);

    const baseServerUrl = 'https://pdf-bot-lake.vercel.app'

    const divRef = useRef(null)
    const fileInputRef = useRef(null)

    useLayoutEffect(() => {
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }, [chatDialogue])

    const submitUserChat = (formData) => {
        const userInput = formData.get("user-input")
        if (userInput) {

            console.log(userInput)

            setChatDialogue(prevChatDialogue => [...prevChatDialogue, userInput])

            const userQuery = {
                userQuery : userInput,
                convHistory : chatDialogue
            }

            axios.post(baseServerUrl + '/vector', userQuery)
                .then(res => {
                    console.log('Querying vector store...')
                    console.log(res.data.aiResponse)
                    setChatDialogue(prevChatDialogue => [...prevChatDialogue, res.data.aiResponse])
                })
                .catch(err => {
                    console.log(`Error querying vector store : ${err}`)
                })
        }
    }

    const handleUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            console.log("uploading file")
            const formData = new FormData()
            formData.append('file', file)
            
            axios.post(baseServerUrl + '/upload', formData)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => console.log(`Error uploading PDF file : ${err}`))
            setSelectedFile(file)
            setChatDialogue([`PDF file uploaded. You can now ask questions about this document.`])
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setChatDialogue([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const chatDialogueElements = chatDialogue.map((text, index) => {
        const chatType = index % 2 == 0 ? 'ai-chat' : 'human-chat'
        const classes = "chat-bubble " + chatType + (index == 0 ? ' italic' : '');
        
        return <div key={index} className={classes}>{text}</div>
    })

    return (
        <main>
            {!selectedFile ? (
                <section>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="upload-box"
                    >
                        <div className="upload-bubble">
                            <Upload className="upload-icon" />
                        </div>
                        <h3 className="upload-text">Upload your PDF</h3>
                        <p>Click to browse or drag and drop your PDF document here.</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleUpload}
                        className="upload-input"
                    />
                </section>
            ) : (
                <section className="chat-container">
                    <div className="file-info-banner">
                        <FileText className="file-icon" />
                        <span className="file-name">{selectedFile.name}</span>
                        <button onClick={handleRemoveFile} className="close-button">
                            <X className="file-close" />
                        </button>
                    </div>
                    <div className="chat-conversation-container" ref={divRef}>
                        { chatDialogueElements }
                    </div>
                    <form action={submitUserChat} className="chat-input-container">
                        <input name="user-input" type="text" id="user-input" required />
                        <button id="submit" className="submit-button">
                            <Send className="submit-icon" />
                            Send
                        </button>
                    </form>
                </section>
            )}
        </main>
    )
}