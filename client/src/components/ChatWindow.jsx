import { useState, useRef, useLayoutEffect } from 'react'
import axios from 'axios'
import './styling/ChatWindow.css'

export default function ChatWindow() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [chatDialogue, setChatDialogue] = useState([]);

    const baseServerUrl = 'https://pdf-bot-lake.vercel.app/'

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
    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0])
    }

    const handleUpload = () => {
        const formData = new FormData()
        formData.append('file', selectedFile)

        axios.post(baseServerUrl + '/upload', formData)
            .then(res => {
                console.log(res.data)
            })
            .catch(err => console.log(`Error uploading PDF file : ${err}`))
            
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const chatDialogueElements = chatDialogue.map((text, index) => {
        const chatType = index % 2 == 0 ? 'human-chat' : 'ai-chat'
        const classes = "chat-bubble " + chatType
        
        return <div key={index} className={classes}>{text}</div>
    })

    return (
        <main>
            <section className="chat-container">
                <div className="chat-header">
                    <p>Summar<b>AI</b>zer: PDF Query Bot</p>
                </div>
                <div className="chat-conversation-container" ref={divRef}>
                    { chatDialogueElements }
                </div>
                <div className="user-container">
                    <form action={submitUserChat} className="chat-input-container">
                        <input name="user-input" type="text" id="user-input" required />
                        <button id="submit" className="submit-button">
                            <svg viewBox="0 0 27 33" className="submit-icon">
                                <path d="M4.53248 16.0788L2.0004 30.7978L24.7891 16.0788L2.00041 1.35974L4.53248 16.0788ZM4.53248 16.0788L14.6608 16.0788" strokeWidth="2.53207" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </form>
                    <div className="file-upload-container">
                        <input type="file" accept=".pdf" onChange={handleFileChange} ref={fileInputRef}/>
                        <button onClick={handleUpload}>Upload PDF</button>
                    </div>
                </div>
            </section>
        </main>
    )
}