// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Pega tu clave publicable de Stripe aquí
const STRIPE_PUBLIC_KEY = "pk_test_51SByc0F56lxJSkyNIg0qr8bssadqRMjQv6RDCwMJSVRfMVMzLqY68zFsdzxHUoIpxNEuVFeGQmPsFtOd7hW6FYdM00hoOHHHLE"; // <-- USA TU CLAVE PUBLICABLE
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
)