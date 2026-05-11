import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeContextProvider } from './app/compartido/theme/ThemeConext';
import { RuteoPrincipal } from './ruteo/RuteoPrincipal';

// ✅ Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CargarComponente = () => (
  <div className="d-flex justify-content-center">
    <div className="mt-3">
      <span className="spinner-grow-sm fs-4 fw-bold text-danger"></span>
      <br />
      <span className="text-center fst-italic fs-3 text-primary">
        Cargando ...
      </span>
    </div>
  </div>
);

function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        {/* 🔥 GLOBAL: mensajes disponibles en toda la app */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          draggable
          closeButton
          theme="colored"
        />

        <Suspense fallback={<CargarComponente />}>
          <RuteoPrincipal />
        </Suspense>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;