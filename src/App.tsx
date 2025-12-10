import React, { Suspense } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeContextProvider } from '../src/app/shared/theme/ThemeConext';
import { MainRoute } from './routes/MainRoute';

const CargarComponente = () => (
  <div className="d-flex justify-content-center">
    <div className="mt-3">
      <span className="spinner-grow-sm fs-4 fw-bold text-danger"></span>
      <br />
      <span className="text-center fst-italic fs-3 text-primary">Cargando ...</span>
    </div>
  </div>
);


function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <Suspense fallback={<CargarComponente />}>
          <MainRoute />
        </Suspense>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;
