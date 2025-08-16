// src/assets/pages/error404/Error404.jsx
import "./Error404.css";

export default function Error404() {
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">🚫</div>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        <button className="error-button" onClick={() => window.history.back()}>
          Volver a la página anterior
        </button>
      </div>
    </div>
  );
}
