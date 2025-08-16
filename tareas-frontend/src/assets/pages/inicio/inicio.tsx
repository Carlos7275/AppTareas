import "./inicio.css";

export default function Inicio() {
  const imagenFondo = "images/tareas.jpeg";

  return (
    <>
      {/* Hero Section */}
      <div
        className="hero-section"
        style={{ backgroundImage: `url(${imagenFondo})` }}
      >
        <div className="overlay"></div>

        <div className="hero-text">
          <h1>Organiza tu vida con TodoList</h1>
          <p>
            Planifica tus días, gestiona tus tareas y alcanza tus metas sin estrés. 
            TodoList te acompaña en cada paso de tu productividad.
          </p>

          <div className="hero-highlights">
            <div className="highlight">📋 Listas Inteligentes</div>
            <div className="highlight">⏰ Recordatorios Automáticos</div>
            <div className="highlight">📊 Estadísticas de Progreso</div>
          </div>
        </div>
      </div>

      {/* Sección de Información */}
      <div className="info-section">
        <h2>Características Destacadas</h2>
        <p>
          TodoList combina simplicidad y eficacia. Descubre cómo tu productividad puede mejorar
          con herramientas inteligentes y recordatorios intuitivos.
        </p>

        <div className="info-cards">
          <div className="card">
            <div className="card-icon">📋</div>
            <h3>Listas Inteligentes</h3>
            <p>Crea listas personalizadas y organiza tus tareas por prioridad.</p>
          </div>
          <div className="card">
            <div className="card-icon">⏰</div>
            <h3>Recordatorios</h3>
            <p>No pierdas de vista tus tareas importantes con alertas oportunas.</p>
          </div>
          <div className="card">
            <div className="card-icon">📊</div>
            <h3>Estadísticas</h3>
            <p>Visualiza tu progreso y mejora tu productividad con gráficos claros.</p>
          </div>
          <div className="card">
            <div className="card-icon">💡</div>
            <h3>Consejos de Productividad</h3>
            <p>Recibe tips para administrar tu tiempo y cumplir tus objetivos.</p>
          </div>
        </div>
      </div>
    </>
  );
}
