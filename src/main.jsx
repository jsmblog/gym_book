import { createRoot } from 'react-dom/client'
import './index.css'
import { UserProvider } from './Context/UserContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <UserProvider>
        <App />
    </UserProvider>
)
