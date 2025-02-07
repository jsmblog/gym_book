import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider} from './Context/UserContext.jsx'
import { DarkModeProvider } from './Context/DarkMode.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <DarkModeProvider>
        <App />
        </DarkModeProvider>
    </AuthProvider>
)
