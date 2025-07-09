import 'reflect-metadata'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { configureDI } from './core/infrastructure/di/container'

// Setup dependency injection before rendering
configureDI();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
