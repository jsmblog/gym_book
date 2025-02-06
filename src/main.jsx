import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './Context/UserContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <App />
    </AuthProvider>
)
